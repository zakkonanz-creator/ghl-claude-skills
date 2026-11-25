import { API_BASE } from './ghl-client.mjs';
import { composeTriggers } from './compose.mjs';

export async function createWorkflow(client, location, { name, folder = null, settings = {} }) {
  // Workflow-level settings. The defaults below preserve this engine's historical
  // behaviour, so omitting `settings` changes nothing for existing callers.
  //
  // `allowMultiple` is the builder's "Allow Re-entry". On an OPPORTUNITY-triggered
  // workflow it is NOT sufficient on its own: `allowMultipleOpportunity` governs
  // per-opportunity enrolment separately and also defaults true. Any design that
  // relies on a contact being unable to re-enter (for example a terminal Wait node
  // used as a cooldown gate) must set BOTH to false, or a second opportunity for the
  // same contact enrols a second instance and the gate silently does nothing.
  const {
    stopOnResponse = false,
    allowMultiple = true,
    allowMultipleOpportunity = true
  } = settings;
  const body = {
    name, status: 'draft', parentId: folder, updatedBy: location.userId,
    modifiedSteps: [], deletedSteps: [], createdSteps: [], senderAddress: {},
    stopOnResponse, allowMultiple, allowMultipleOpportunity,
    autoMarkAsRead: false, eventStartDate: '', timezone: '', workflowData: { templates: [] },
    triggersChanged: false, company_id: location.companyId, company_age: location.companyAge
  };
  const result = await client.apiFetch('POST', `${API_BASE}/workflow/${location.locationId}`, body);
  const id = result?.id ?? result?._id;
  if (!id) throw new Error(`create workflow response did not contain an id: ${JSON.stringify(result)}`);
  return id;
}

export async function addTriggers(client, location, workflowId, spec) {
  const triggers = composeTriggers(spec, workflowId, location);
  const saved = [];
  for (const trigger of triggers) {
    const result = await client.apiFetch('POST', `${API_BASE}/workflow/${location.locationId}/trigger`, trigger);
    const id = result?.id ?? result?._id;
    if (!id) throw new Error(`create trigger response did not contain an id: ${JSON.stringify(result)}`);
    saved.push({ ...trigger, id });
  }
  return saved;
}

/**
 * Remove a workflow's existing triggers before re-adding them from the spec.
 *
 * Rebuilding adds triggers from the spec, so without this an edit accumulates a
 * duplicate trigger on every save and the workflow fires more than once.
 */
export async function deleteTriggers(client, location, workflowId) {
  const existing = await client.getTriggers(workflowId);
  for (const trigger of existing) {
    const id = trigger.id ?? trigger._id;
    if (!id) continue;
    await client.apiFetch('DELETE', `${API_BASE}/workflow/${location.locationId}/trigger/${id}`);
  }
  return existing.length;
}

export async function saveWorkflow(client, location, workflowId, composition, triggers, changes = {}) {
  const current = await client.getWorkflow(workflowId);
  const body = {
    ...current,
    ...changes,
    workflowData: { ...(current.workflowData ?? {}), templates: composition.templates },
    modifiedSteps: [], deletedSteps: [], createdSteps: composition.createdSteps,
    senderAddress: current.senderAddress ?? {}, eventStartDate: current.eventStartDate ?? '',
    triggersChanged: triggers.length > 0, newTriggers: triggers,
    permissionMeta: current.permissionMeta ?? { canRead: true, canWrite: true },
    scheduledPauseDates: current.scheduledPauseDates ?? []
  };
  delete body.triggers;
  return client.apiFetch('PUT', `${API_BASE}/workflow/${location.locationId}/${workflowId}`, body);
}

/**
 * Set a workflow's published state and leave it there.
 *
 * The previous behaviour published and immediately reverted, because it existed
 * only as a research smoke test gated to one hardcoded spike name. That is not
 * what editing a live workflow means: a published workflow stays published, and
 * a caller asking for publish expects it to remain so.
 */
export async function setPublished(client, location, workflowId, published) {
  const status = published ? 'published' : 'draft';
  const workflow = await client.getWorkflow(workflowId);
  const triggers = await client.getTriggers(workflowId);
  // A published workflow needs its triggers active, and a draft needs them
  // inactive — status alone leaves a published workflow that never fires.
  const body = {
    ...workflow,
    status,
    triggersChanged: true,
    modifiedSteps: [], deletedSteps: [], createdSteps: [],
    senderAddress: workflow.senderAddress ?? {},
    eventStartDate: workflow.eventStartDate ?? '',
    newTriggers: triggers.map(trigger => ({
      ...trigger,
      active: published,
      workflowId,
      location_id: location.locationId,
      company_id: location.companyId,
      company_age: location.companyAge
    })),
    permissionMeta: workflow.permissionMeta ?? { canRead: true, canWrite: true },
    scheduledPauseDates: workflow.scheduledPauseDates ?? []
  };
  delete body.triggers;
  await client.apiFetch('PUT', `${API_BASE}/workflow/${location.locationId}/${workflowId}`, body);

  const after = await client.getWorkflow(workflowId);
  const afterTriggers = await client.getTriggers(workflowId);
  if (after.status !== status || afterTriggers.some(trigger => trigger.active !== published)) {
    throw new Error(
      `publish read-back failed: status is ${after.status} and ` +
      `${afterTriggers.filter(t => t.active === published).length}/${afterTriggers.length} triggers are active:${published}`
    );
  }
  return { status, triggersActive: published };
}

