import { API_BASE } from './ghl-client.mjs';
import { composeTriggers, composeWorkflow } from './compose.mjs';

function signature(node) {
  return [node.type, node.nodeType ?? '', node.name ?? ''].join('\0');
}

function matchNodes(expected, actual) {
  const cost = Array.from({ length: expected.length + 1 }, () => Array(actual.length + 1).fill(0));
  for (let i = expected.length; i >= 0; i--) {
    for (let j = actual.length; j >= 0; j--) {
      if (i === expected.length) { cost[i][j] = actual.length - j; continue; }
      if (j === actual.length) { cost[i][j] = expected.length - i; continue; }
      const exact = signature(expected[i]) === signature(actual[j]);
      const sameRole = expected[i].order === actual[j].order && (expected[i].nodeType ?? '') === (actual[j].nodeType ?? '');
      const substitute = (exact ? 0 : sameRole ? 0.5 : 1.5) + cost[i + 1][j + 1];
      cost[i][j] = Math.min(substitute, 1 + cost[i + 1][j], 1 + cost[i][j + 1]);
    }
  }
  const pairs = [];
  for (let i = 0, j = 0; i < expected.length && j < actual.length;) {
    const exact = signature(expected[i]) === signature(actual[j]);
    const sameRole = expected[i].order === actual[j].order && (expected[i].nodeType ?? '') === (actual[j].nodeType ?? '');
    const substitute = (exact ? 0 : sameRole ? 0.5 : 1.5) + cost[i + 1][j + 1];
    if (substitute === cost[i][j]) { pairs.push([i++, j++]); continue; }
    if (1 + cost[i + 1][j] === cost[i][j]) i++;
    else j++;
  }
  return pairs;
}

function deepOverlay(base, patch) {
  if (Array.isArray(patch)) return patch.map((item, index) => deepOverlay(Array.isArray(base) ? base[index] : undefined, item));
  if (!patch || typeof patch !== 'object') return patch;
  const result = base && typeof base === 'object' && !Array.isArray(base) ? structuredClone(base) : {};
  for (const [key, value] of Object.entries(patch)) result[key] = deepOverlay(result[key], value);
  return result;
}

function preserveConditionIds(expected, actual) {
  const expectedBranches = expected.attributes?.branches;
  const actualBranches = actual.attributes?.branches;
  if (!Array.isArray(expectedBranches) || !Array.isArray(actualBranches)) return;
  expectedBranches.forEach((branch, branchIndex) => branch.segments?.forEach((segment, segmentIndex) => {
    const actualSegment = actualBranches[branchIndex]?.segments?.[segmentIndex];
    if (actualSegment?.__segmentId) segment.__segmentId = actualSegment.__segmentId;
    segment.conditions?.forEach((condition, conditionIndex) => {
      const actualCondition = actualSegment?.conditions?.[conditionIndex];
      if (actualCondition?.__conditionId) condition.__conditionId = actualCondition.__conditionId;
    });
  }));
}

function rewriteIds(value, ids) {
  if (typeof value === 'string') return ids.get(value) ?? value;
  if (Array.isArray(value)) return value.map(item => rewriteIds(item, ids));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteIds(item, ids)]));
}

export function reconcileTemplates(spec, data, actualTemplates) {
  const canonical = composeWorkflow(spec, data).templates;
  const pairs = matchNodes(canonical, actualTemplates);
  const actualByExpected = new Map(pairs.map(([expectedIndex, actualIndex]) => [expectedIndex, actualIndex]));
  const ids = new Map(pairs.map(([expectedIndex, actualIndex]) => [canonical[expectedIndex].id, actualTemplates[actualIndex].id]));
  const matchedActual = new Set(pairs.map(([, actualIndex]) => actualIndex));
  const templates = canonical.map((source, expectedIndex) => {
    const actualIndex = actualByExpected.get(expectedIndex);
    const actual = actualIndex === undefined ? null : actualTemplates[actualIndex];
    const expected = structuredClone(source);
    if (actual) preserveConditionIds(expected, actual);
    const rewritten = rewriteIds(expected, ids);
    const desired = actual ? deepOverlay(actual, rewritten) : rewritten;
    for (const key of ['next', 'parent', 'parentKey', 'sibling']) if (!(key in rewritten)) delete desired[key];
    return desired;
  });
  const added = canonical.map((node, index) => actualByExpected.has(index) ? null : ids.get(node.id) ?? node.id).filter(Boolean);
  const removed = actualTemplates.filter((_, index) => !matchedActual.has(index)).map(node => node.id);
  const modified = templates.filter((node, index) => {
    const actualIndex = actualByExpected.get(index);
    return actualIndex !== undefined && JSON.stringify(node) !== JSON.stringify(actualTemplates[actualIndex]);
  }).map(node => node.id);
  return { templates, added, removed, modified };
}

export function unrepairableMismatches(verification) {
  const rows = verification.bad.filter(row => row.path === '$.workflow.status');
  const triggerLength = verification.bad.find(row => row.path === '$.triggers.length');
  if (triggerLength && triggerLength.actual > triggerLength.expected) rows.push({
    path: '$.triggers.length', status: 'POLICY', expected: triggerLength.expected, actual: triggerLength.actual,
    reason: 'extra triggers cannot be removed by the approved trigger repair path'
  });
  return rows.map(row => ({ ...row, reason: row.reason ?? 'workflow status is report-only; repair never publishes or changes publish state' }));
}

export async function applyRepair(spec, workflowId, verification, data, client, location) {
  const patch = { workflow: null, triggers: [] };
  if (verification.bad.some(row => row.path === '$.workflow.name' || row.path.startsWith('$.templates'))) {
    const current = await client.getWorkflow(workflowId);
    const steps = await client.getStepsJson(current);
    const reconciled = reconcileTemplates(spec, data, steps.templates ?? []);
    const body = {
      ...current,
      name: spec.name,
      workflowData: { ...(current.workflowData ?? {}), templates: reconciled.templates },
      modifiedSteps: reconciled.modified,
      deletedSteps: reconciled.removed,
      createdSteps: reconciled.added,
      senderAddress: current.senderAddress ?? {},
      eventStartDate: current.eventStartDate ?? '',
      triggersChanged: false,
      permissionMeta: current.permissionMeta ?? { canRead: true, canWrite: true },
      scheduledPauseDates: current.scheduledPauseDates ?? []
    };
    delete body.triggers;
    delete body.newTriggers;
    await client.apiFetch('PUT', `${API_BASE}/workflow/${location.locationId}/${workflowId}`, body);
    patch.workflow = { name: verification.workflow.name === spec.name ? null : { from: verification.workflow.name, to: spec.name }, ...reconciled };
  }

  const triggerRows = verification.bad.filter(row => row.path.startsWith('$.triggers'));
  if (triggerRows.length) {
    const expected = composeTriggers(spec, workflowId, location);
    for (let index = 0; index < expected.length; index++) {
      const actual = verification.triggers[index];
      const hasMismatch = triggerRows.some(row => row.path === '$.triggers.length' || row.path.startsWith(`$.triggers[${index}]`));
      if (!hasMismatch) continue;
      if (actual) {
        const body = deepOverlay(actual, expected[index]);
        await client.apiFetch('PUT', `${API_BASE}/workflow/${location.locationId}/trigger/${actual.id ?? actual._id}`, body);
        patch.triggers.push({ index, operation: 'update', id: actual.id ?? actual._id });
      } else {
        const result = await client.apiFetch('POST', `${API_BASE}/workflow/${location.locationId}/trigger`, expected[index]);
        patch.triggers.push({ index, operation: 'create', id: result?.id ?? result?._id ?? null });
      }
    }
  }
  return patch;
}
