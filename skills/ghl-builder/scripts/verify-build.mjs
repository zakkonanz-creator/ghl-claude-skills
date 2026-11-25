#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { windowWaitAttributes } from './lib/compose.mjs';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationData } from './lib/resolve.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { LAB } from './build-workflow.mjs';

const ACTION_NAMES = {
  sms: 'SMS', email: 'Email', wait: 'Wait', add_contact_tag: 'Add Tag', remove_contact_tag: 'Remove Tag',
  add_notes: 'Note', if_else: 'If/Else', goto: 'Go To', create_opportunity: 'Create or update opportunity',
  assign_user: 'Assign to user', update_contact_field: 'Update contact field', internal_notification: 'Internal Notification'
};

function validateVerificationSpec(spec) {
  if (!spec || typeof spec !== 'object' || !spec.name) throw new Error('spec.name is required');
  if (!Array.isArray(spec.triggers) || spec.triggers.length === 0) throw new Error('spec.triggers must not be empty');
  if (!Array.isArray(spec.actions)) throw new Error('spec.actions must be an array');
}

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function findOne(items, value, label, aliases = []) {
  const needle = String(value).toLowerCase();
  const matches = items.filter(item => [item.name, ...aliases.map(key => item[key])].some(candidate => String(candidate ?? '').toLowerCase() === needle));
  if (matches.length !== 1) throw new Error(matches.length ? `${label} is ambiguous: ${value}` : `${label} not found: ${value}`);
  return matches[0];
}

function compare(expected, actual, pathName, rows) {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) { rows.push({ path: pathName, status: 'TYPE', expected: 'array', actual: typeof actual }); return; }
    if (expected.length !== actual.length) rows.push({ path: `${pathName}.length`, status: 'VALUE', expected: expected.length, actual: actual.length });
    expected.forEach((item, index) => compare(item, actual[index], `${pathName}[${index}]`, rows));
    return;
  }
  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object' || Array.isArray(actual)) { rows.push({ path: pathName, status: 'TYPE', expected: 'object', actual: typeof actual }); return; }
    for (const [key, value] of Object.entries(expected)) {
      if (!(key in actual)) rows.push({ path: `${pathName}.${key}`, status: 'MISSING', expected: value, actual: undefined });
      else compare(value, actual[key], `${pathName}.${key}`, rows);
    }
    return;
  }
  rows.push({ path: pathName, status: typeof expected !== typeof actual ? 'TYPE' : Object.is(expected, actual) ? 'OK' : 'VALUE', expected, actual });
}

function expectedAttributes(action, data, deferredGoto, node) {
  const config = action.config ?? {};
  switch (action.type) {
    case 'sms': return { body: config.body, attachments: config.attachments ?? [] };
    case 'email': return {
      isCloned: false, fieldDefaults: {}, trackingOptions: { hasTrackingLinks: false, hasUtmTracking: false, hasTags: false }, conditions: [],
      html: config.html, subject: config.subject, attachments: config.attachments ?? [],
      ...(config.from_name !== undefined ? { from_name: config.from_name } : {}), ...(config.from_email !== undefined ? { from_email: config.from_email } : {}),
      ...(config.preHeader !== undefined ? { preHeader: config.preHeader } : {})
    };
    case 'wait': return config.window ? windowWaitAttributes(action) : {
      ...(config.mode === 'appointment' ? (() => {
        const distributed = { months: 0, days: 0, hours: 0, minutes: 0, ...config.distributed };
        return {
          type: 'appointment', name: action.name ?? 'Wait', cat: '',
          appointmentStartAfter: { when: config.when, type: 'minutes', value: distributed.days * 1440 + distributed.hours * 60 + distributed.minutes, distributed },
          appointmentCondition: config.appointmentCondition ?? 'next', isHybridAction: true,
          hybridActionType: 'wait', convertToMultipath: false, transitions: []
        };
      })() : {
      type: 'time', startAfter: { type: config.unit ?? config.startAfter?.type ?? 'minutes', value: config.value ?? config.startAfter?.value, when: config.when ?? config.startAfter?.when ?? 'after' },
      name: action.name ?? 'Wait', cat: '', timePeriodInputMode: 'standard', unitInputMode: 'standard', isHybridAction: true,
      hybridActionType: 'wait', convertToMultipath: false, transitions: []
      })
    };
    case 'add_contact_tag': return { tags: config.tags };
    case 'remove_contact_tag': return { tags: config.tags, type: 'remove_contact_tag' };
    case 'add_notes': return { title: config.title, html: config.html, color: config.color ?? '#FEF0C7', type: 'add_notes' };
    case 'goto': deferredGoto.push({ node, ref: config.target }); return { type: 'goto' };
    case 'create_opportunity': {
      const pipeline = findOne(data.pipelines, config.pipeline, 'pipeline');
      const stage = findOne(pipeline.stages ?? [], config.stage, `stage in pipeline ${pipeline.name}`);
      return {
        fields: config.fields ?? [], type: 'create_opportunity', pipeline_id: pipeline.id, pipeline_stage_id: stage.id,
        opportunity_name: config.opportunity_name ?? '', opportunity_source: config.opportunity_source ?? '', monetary_value: config.monetary_value ?? '',
        ...(config.allow_multiple ? { allow_multiple: true } : {}), ...(config.allow_backward !== undefined ? { allow_backward: config.allow_backward } : {}),
        ...(config.opportunity_status ? { opportunity_status: config.opportunity_status } : {})
      };
    }
    case 'assign_user': {
      const ids = config.users.map(value => findOne(data.users, value, 'user', ['email']).id);
      const weights = config.weights ?? Object.fromEntries(ids.map(id => [id, 1]));
      let cursor = 1;
      const trafficIndex = ids.map(id => ({ id, indexes: Array.from({ length: Number(weights[id] ?? 1) }, () => cursor++) }));
      return { type: 'assign_user', user_list: ids, only_unassigned_contact: config.only_unassigned_contact ?? false, traffic_split: config.traffic_split ?? 'equally', traffic_weightage: weights, traffic_index: trafficIndex, total_index: cursor - 1 };
    }
    case 'update_contact_field': {
      const types = { TEXT: 'string', NUMERICAL: 'numerical', DATE: 'date', SINGLE_OPTIONS: 'string', MULTIPLE_OPTIONS: 'string' };
      return { type: 'update_contact_field', actionType: config.actionType ?? 'update_field_data', fields: config.fields.map(entry => {
        const field = findOne(data.customFields, entry.field, 'custom field', ['fieldKey']);
        return { field: field.id, value: entry.value ?? '', title: field.name, type: types[field.dataType] ?? String(field.type ?? 'string').toLowerCase(), date: entry.date ?? '' };
      }) };
    }
    case 'internal_notification': {
      const subtype = config.notificationType ?? config.type ?? 'notification';
      const payload = { ...(config.payload ?? {}) };
      if (config.users) { payload.userType = 'user'; payload.selectedUser = config.users.map(value => findOne(data.users, value, 'user', ['email']).id); }
      if (subtype === 'notification') Object.assign(payload, { type: 'send_notification', title: config.title ?? payload.title, body: config.body ?? payload.body, redirectPage: config.redirectPage ?? payload.redirectPage ?? 'contact', userType: payload.userType ?? config.userType ?? 'all' });
      return { type: subtype, [subtype]: payload };
    }
    default: return config.attributes;
  }
}

function expectedCondition(condition, data) {
  let field = condition.conditionSubType ?? condition.field;
  const matches = data.customFields.filter(item => [item.name, item.fieldKey].some(value => String(value ?? '').toLowerCase() === String(field).toLowerCase()));
  if (matches.length === 1) field = matches[0].id;
  return {
    conditionType: condition.conditionType, conditionSubType: field,
    conditionOperator: condition.conditionOperator ?? condition.operator,
    ...(condition.conditionValue !== undefined || condition.value !== undefined ? { conditionValue: condition.conditionValue ?? condition.value } : {}),
    ifElseNodeId: condition.ifElseNodeId ?? '', isWait: condition.isWait ?? false
  };
}

export function verifyTemplates(spec, templates, data) {
  const rows = [];
  const nodes = new Map(templates.map(node => [node.id, node]));
  const visited = new Set();
  const refs = new Map();
  const deferredGoto = [];
  const firstAction = spec.actions[0];
  const firstName = firstAction ? firstAction.name ?? ACTION_NAMES[firstAction.type] ?? firstAction.type : null;
  const expectedRootNodeType = firstAction?.type === 'if_else' ? 'condition-node' : undefined;
  const firstActionCandidates = firstAction ? templates.filter(node => node.order === 0 && node.type === firstAction.type && node.name === firstName && node.nodeType === expectedRootNodeType) : [];
  const unparentedCandidates = firstActionCandidates.filter(node => node.parentKey === undefined && node.parent === undefined);
  const inbound = new Set(templates.flatMap(node => Array.isArray(node.next) ? node.next : typeof node.next === 'string' ? [node.next] : []));
  const roots = unparentedCandidates.length ? unparentedCandidates : firstActionCandidates.filter(node => !inbound.has(node.id));
  const expectedRootCount = firstAction ? 1 : 0;
  if (roots.length !== expectedRootCount) rows.push({ path: '$.templates.roots', status: 'VALUE', expected: expectedRootCount, actual: roots.length });

  const verifyList = (actions, startId, pathName, stableParent = null) => {
    let currentId = startId;
    let previousId = stableParent;
    actions.forEach((action, index) => {
      const actionPath = `${pathName}[${index}]`;
      const node = nodes.get(currentId);
      if (!node) { rows.push({ path: actionPath, status: 'MISSING', expected: action.type, actual: currentId }); currentId = null; return; }
      visited.add(node.id);
      compare(action.type, node.type, `${actionPath}.type`, rows);
      compare(action.name ?? ACTION_NAMES[action.type] ?? action.type, node.name, `${actionPath}.name`, rows);
      compare(index, node.order, `${actionPath}.order`, rows);
      if (previousId) compare(previousId, node.parentKey, `${actionPath}.parentKey`, rows);
      else {
        if (node.parentKey !== undefined) rows.push({ path: `${actionPath}.parentKey`, status: 'VALUE', expected: undefined, actual: node.parentKey });
        if (node.parent !== undefined) rows.push({ path: `${actionPath}.parent`, status: 'VALUE', expected: undefined, actual: node.parent });
      }
      if (stableParent) compare(stableParent, node.parent, `${actionPath}.parent`, rows);
      if (action.ref) refs.set(action.ref, node.id);

      if (action.type === 'find_opportunity') {
        // Three-node multipath family: parent plus two pre-defined transition
        // children. Both children must be walked or visitedCount goes stale.
        const config = action.config ?? {};
        const findName = action.name ?? 'Find opportunity';
        compare('multi-path', node.cat, `${actionPath}.cat`, rows);
        compare('INTERNAL', node.workflowsActionType, `${actionPath}.workflowsActionType`, rows);
        if (!Array.isArray(node.next)) rows.push({ path: `${actionPath}.next`, status: 'TYPE', expected: 'array', actual: node.next });
        else compare(2, node.next.length, `${actionPath}.next.length`, rows);
        const foundId = node.next?.[0];
        const notFoundId = node.next?.[1];
        compare({
          sorting: config.sorting ?? 'latest', type: 'find_opportunity', __customInputs__: {},
          cat: 'multi-path', convertToMultipath: true, __name__: findName,
          __customInputFields__: (config.filters ?? []).map(filter => {
            let value = filter.value;
            if (filter.field === 'pipeline_id' && value !== undefined) {
              const match = data.pipelines.filter(item => item.id === value || String(item.name ?? '').toLowerCase() === String(value).toLowerCase());
              if (match.length === 1) value = match[0].id;
            }
            return { __customInputs__: {}, filterField: filter.field, value: filter.operator, secondValue: value ?? '' };
          }),
          transitions: [
            { id: foundId, name: 'Opportunity Found', fields: [], meta: { __branchKey__: 'predefined_Opportunity Found' }, conditionType: 'pre-defined' },
            { id: notFoundId, name: 'Opportunity Not Found', fields: [], meta: { __branchKey__: 'predefined_Opportunity Not Found' }, conditionType: 'pre-defined' }
          ]
        }, node.attributes, `${actionPath}.attributes`, rows);

        for (const [branchId, branchName, branchKey] of [[foundId, 'Opportunity Found', 'found'], [notFoundId, 'Opportunity Not Found', 'notFound']]) {
          const branchPath = `${actionPath}.${branchKey}`;
          const branchNode = nodes.get(branchId);
          if (!branchNode) { rows.push({ path: branchPath, status: 'MISSING', expected: 'transition node', actual: branchId }); continue; }
          visited.add(branchId);
          compare({ name: branchName, type: 'transition', cat: 'transition', attributes: {}, parentKey: node.id, parent: node.id, order: node.order + 1 }, branchNode, `${branchPath}.node`, rows);
          const branchActions = config[branchKey]?.actions ?? [];
          if (branchActions.length) verifyList(branchActions, branchNode.next, `${branchPath}.actions`, branchId);
          else if (branchNode.next !== undefined) rows.push({ path: `${branchPath}.node.next`, status: 'VALUE', expected: undefined, actual: branchNode.next });
        }
        currentId = null;
        return;
      }

      if (action.type !== 'if_else') {
        compare(expectedAttributes(action, data, deferredGoto, node), node.attributes, `${actionPath}.attributes`, rows);
        if (action.type === 'wait') compare('', node.cat, `${actionPath}.cat`, rows);
        const shouldContinue = index < actions.length - 1;
        if (shouldContinue) {
          if (typeof node.next !== 'string') rows.push({ path: `${actionPath}.next`, status: 'TYPE', expected: 'string child id', actual: node.next });
          previousId = node.id;
          currentId = node.next;
        } else {
          if (node.next !== undefined) rows.push({ path: `${actionPath}.next`, status: 'VALUE', expected: undefined, actual: node.next });
          currentId = null;
        }
        return;
      }

      compare('conditions', node.cat, `${actionPath}.cat`, rows);
      compare([], node.comments, `${actionPath}.comments`, rows);
      compare('condition-node', node.nodeType, `${actionPath}.nodeType`, rows);
      compare({ currentRecipeType: 'CUSTOM', operator: 'and', if: true, conditionName: action.name ?? 'If/Else', version: 2, noneBranchName: action.else?.name ?? 'None' }, node.attributes, `${actionPath}.attributes`, rows);
      const expectedNextCount = action.branches.length + 1;
      if (!Array.isArray(node.next)) rows.push({ path: `${actionPath}.next`, status: 'TYPE', expected: 'array', actual: node.next });
      else compare(expectedNextCount, node.next.length, `${actionPath}.next.length`, rows);
      compare(action.branches.length, node.attributes?.branches?.length, `${actionPath}.attributes.branches.length`, rows);

      action.branches.forEach((branch, branchIndex) => {
        const branchPath = `${actionPath}.branches[${branchIndex}]`;
        const branchId = node.next?.[branchIndex];
        const branchNode = nodes.get(branchId);
        if (!branchNode) { rows.push({ path: branchPath, status: 'MISSING', expected: 'branch node', actual: branchId }); return; }
        visited.add(branchId);
        const siblings = node.next.filter(id => id !== branchId);
        compare({ id: branchId, name: branch.name, operator: branch.operator ?? 'and' }, node.attributes.branches[branchIndex], `${branchPath}.definition`, rows);
        compare({ name: branch.name, type: 'if_else', cat: 'conditions', comments: [], nodeType: 'branch-yes', parentKey: node.id, parent: node.id, order: node.order + 1, sibling: siblings, attributes: { if: false, conditionName: action.name ?? 'If/Else', operator: branch.operator ?? 'and', branches: [] } }, branchNode, `${branchPath}.node`, rows);
        const segments = node.attributes.branches[branchIndex]?.segments;
        compare(1, segments?.length, `${branchPath}.segments.length`, rows);
        compare(branch.operator ?? 'and', segments?.[0]?.operator, `${branchPath}.segments[0].operator`, rows);
        compare(branch.conditions.length, segments?.[0]?.conditions?.length, `${branchPath}.conditions.length`, rows);
        branch.conditions.forEach((condition, conditionIndex) => compare(expectedCondition(condition, data), segments?.[0]?.conditions?.[conditionIndex], `${branchPath}.conditions[${conditionIndex}]`, rows));
        if (branch.actions.length) verifyList(branch.actions, branchNode.next, `${branchPath}.actions`, branchId);
        else if (branchNode.next !== undefined) rows.push({ path: `${branchPath}.node.next`, status: 'VALUE', expected: undefined, actual: branchNode.next });
      });

      const nonePath = `${actionPath}.else`;
      const noneId = node.next?.at(-1);
      const noneNode = nodes.get(noneId);
      if (!noneNode) rows.push({ path: nonePath, status: 'MISSING', expected: 'None branch node', actual: noneId });
      else {
        visited.add(noneId);
        compare({ name: action.else?.name ?? 'None', type: 'if_else', cat: 'conditions', comments: [], nodeType: 'branch-no', parentKey: node.id, parent: node.id, order: node.order + 1, sibling: node.next.slice(0, -1), attributes: { else: true } }, noneNode, `${nonePath}.node`, rows);
        const noneActions = action.else?.actions ?? [];
        if (noneActions.length) verifyList(noneActions, noneNode.next, `${nonePath}.actions`, noneId);
        else if (noneNode.next !== undefined) rows.push({ path: `${nonePath}.node.next`, status: 'VALUE', expected: undefined, actual: noneNode.next });
      }
      currentId = null;
    });
    if (currentId) rows.push({ path: `${pathName}.next`, status: 'VALUE', expected: undefined, actual: currentId });
  };

  verifyList(spec.actions, roots[0]?.id, '$.templates');
  for (const goto of deferredGoto) compare(refs.get(goto.ref), goto.node.attributes.targetNodeId, `$.templates.goto(${goto.ref}).targetNodeId`, rows);
  compare(templates.length, visited.size, '$.templates.visitedCount', rows);
  return rows;
}

export function verifyTriggers(spec, triggers, workflowId, location = LAB) {
  const rows = [];
  compare(spec.triggers.length, triggers.length, '$.triggers.length', rows);
  spec.triggers.forEach((triggerSpec, index) => {
    const actual = triggers[index];
    const name = triggerSpec.name ?? triggerSpec.type.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
    // Triggers are active exactly when the workflow is published — setPublished
    // sets both together. Hardcoding false meant every trigger on a published
    // workflow verified as a mismatch.
    compare({ active: spec.publish === true, conditions: triggerSpec.filters ?? [], type: triggerSpec.type, masterType: 'highlevel', name, actions: [{ workflow_id: workflowId, type: 'add_to_workflow' }], location_id: location.locationId, schedule_config: triggerSpec.schedule_config ?? {} }, actual, `$.triggers[${index}]`, rows);
  });
  return rows;
}

export async function verifyBuild(spec, workflowId, { location = LAB } = {}) {
  validateVerificationSpec(spec);
  const client = await connectGhlClient({ locationId: location.locationId, appOrigin: location.appOrigin });
  try {
    const resolvedLocation = await resolveLocationDescriptor(client, location.locationId);
    const result = await verifyBuildWithClient(spec, workflowId, client, undefined, resolvedLocation);
    return { ...result, _disconnect: client.disconnect };
  } catch (error) {
    error.disconnect = client.disconnect;
    throw error;
  }
}

export async function verifyBuildWithClient(spec, workflowId, client, suppliedData, location = LAB) {
  validateVerificationSpec(spec);
  const resolvedLocation = suppliedData || location.companyId ? location : await resolveLocationDescriptor(client, location.locationId);
  const data = suppliedData ?? await resolveLocationData(resolvedLocation, client);
  const workflow = await client.getWorkflow(workflowId);
  const triggers = await client.getTriggers(workflowId);
  const steps = await client.getStepsJson(workflow);
  const rows = [];
  compare(spec.name, workflow.name, '$.workflow.name', rows);
  // Honour the spec rather than assuming draft. This was hardcoded to 'draft'
  // from when every build created one, so verifying a published workflow always
  // reported a status mismatch — and because repair treats publish state as
  // report-only, that unrepairable row aborted the whole repair before the real
  // change was applied. Editing any published workflow was impossible.
  compare(spec.publish === true ? 'published' : 'draft', workflow.status, '$.workflow.status', rows);
  rows.push(...verifyTemplates(spec, steps.templates ?? [], data), ...verifyTriggers(spec, triggers, workflowId, resolvedLocation));
  const bad = rows.filter(row => row.status !== 'OK');
  return { pass: bad.length === 0, workflowId, workflow, triggers, steps, rows, bad };
}

async function main() {
  const specPath = argument('spec');
  const workflowId = argument('workflow');
  if (!specPath || !workflowId) throw new Error('usage: node scripts/verify-build.mjs --spec <file> --workflow <id> [--location <id>] [--app-origin <origin>]');
  const spec = JSON.parse(fs.readFileSync(path.resolve(specPath), 'utf8'));
  let disconnect;
  let code = 1;
  try {
    const result = await verifyBuild(spec, workflowId, { location: { ...LAB, locationId: argument('location') ?? LAB.locationId, appOrigin: argument('app-origin') } });
    disconnect = result._disconnect;
    for (const row of result.bad) fs.writeSync(1, `${row.status.padEnd(8)} ${row.path} expected=${JSON.stringify(row.expected)} actual=${JSON.stringify(row.actual)}\n`);
    fs.writeSync(1, (result.pass ? `PASS workflow ${workflowId}` : `FAIL workflow ${workflowId}: ${result.bad.length} mismatch(es)`) + '\n');
    code = result.pass ? 0 : 1;
  } catch (error) {
    disconnect = error.disconnect;
    fs.writeSync(2, `VERIFY FAILED: ${error.message}\n`);
  } finally {
    await Promise.all([new Promise(resolve => process.stdout.write('', resolve)), new Promise(resolve => process.stderr.write('', resolve))]);
    await disconnect?.();
  }
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await main();
  process.exit(code);
}
