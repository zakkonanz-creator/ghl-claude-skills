#!/usr/bin/env node
// Read a persisted workflow back as a spec that build_workflow accepts.
//
// This is the inverse of the spec -> node mapping in verify-build.mjs. It exists
// because the builder takes a whole workflow, never a diff: without it, "add a
// step to this workflow" means reconstructing the existing steps from memory,
// and one wrong guess silently rewrites the parts that were already correct.
//
// Anything it cannot translate faithfully is reported in `unsupported` rather
// than approximated. A spec carrying a guessed action would build cleanly and
// destroy the real step, so an honest gap is the safer failure.

import { pathToFileURL } from 'node:url';
import { actionAttributes } from './lib/compose.mjs';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { resolveLocationData } from './lib/resolve.mjs';
import { LAB } from './build-workflow.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const nameOf = (collection, id) => collection.find(item => item.id === id)?.name;

/** Reverse a node's stored attributes into a spec `config`. */
function configFrom(node, data, unsupported) {
  const attributes = node.attributes ?? {};
  switch (node.type) {
    case 'sms':
      return { body: attributes.body, ...(attributes.attachments?.length ? { attachments: attributes.attachments } : {}) };
    case 'email':
      return {
        subject: attributes.subject,
        html: attributes.html,
        ...(attributes.from_name !== undefined ? { from_name: attributes.from_name } : {}),
        ...(attributes.from_email !== undefined ? { from_email: attributes.from_email } : {}),
        ...(attributes.preHeader !== undefined ? { preHeader: attributes.preHeader } : {}),
        ...(attributes.attachments?.length ? { attachments: attributes.attachments } : {})
      };
    case 'wait': {
      if (attributes.type === 'appointment') {
        // Appointment waits carry a distributed duration plus scheduling mode;
        // round-tripping them has never been exercised, so do not pretend.
        unsupported.push({ id: node.id, name: node.name, reason: 'appointment wait is not round-tripped' });
        return null;
      }
      const startAfter = attributes.startAfter ?? {};
      return {
        value: startAfter.value,
        ...(startAfter.type ? { unit: startAfter.type } : {}),
        ...(startAfter.when ? { when: startAfter.when } : {})
      };
    }
    case 'add_contact_tag':
    case 'remove_contact_tag':
      return { tags: attributes.tags ?? [] };
    case 'add_notes':
      return { title: attributes.title, html: attributes.html, ...(attributes.color ? { color: attributes.color } : {}) };
    case 'create_opportunity': {
      const pipeline = data.pipelines.find(item => item.id === attributes.pipeline_id);
      const stage = (pipeline?.stages ?? []).find(item => item.id === attributes.pipeline_stage_id);
      if (!pipeline || !stage) {
        // The spec addresses these by name. An unresolvable id means the name is
        // unknown, and a build from a guessed name would target the wrong stage.
        unsupported.push({ id: node.id, name: node.name, reason: 'pipeline or stage id does not resolve to a name' });
        return null;
      }
      return {
        pipeline: pipeline.name,
        stage: stage.name,
        ...(attributes.opportunity_name ? { opportunity_name: attributes.opportunity_name } : {}),
        ...(attributes.opportunity_source ? { opportunity_source: attributes.opportunity_source } : {}),
        ...(attributes.monetary_value ? { monetary_value: attributes.monetary_value } : {}),
        ...(attributes.opportunity_status ? { opportunity_status: attributes.opportunity_status } : {}),
        ...(attributes.allow_multiple ? { allow_multiple: true } : {}),
        ...(attributes.allow_backward !== undefined ? { allow_backward: attributes.allow_backward } : {})
      };
    }
    case 'assign_user': {
      const users = (attributes.user_list ?? []).map(id => nameOf(data.users, id));
      if (users.some(value => value === undefined)) {
        unsupported.push({ id: node.id, name: node.name, reason: 'assigned user id does not resolve to a name' });
        return null;
      }
      return {
        users,
        ...(attributes.only_unassigned_contact ? { only_unassigned_contact: true } : {}),
        ...(attributes.traffic_split && attributes.traffic_split !== 'equally' ? { traffic_split: attributes.traffic_split } : {})
      };
    }
    case 'update_contact_field': {
      const fields = (attributes.fields ?? []).map(entry => {
        const field = data.customFields.find(item => item.id === entry.field);
        return field ? { field: field.name, value: entry.value ?? '', ...(entry.date ? { date: entry.date } : {}) } : null;
      });
      if (fields.some(entry => entry === null)) {
        unsupported.push({ id: node.id, name: node.name, reason: 'custom field id does not resolve to a name' });
        return null;
      }
      return { fields, ...(attributes.actionType && attributes.actionType !== 'update_field_data' ? { actionType: attributes.actionType } : {}) };
    }
    case 'internal_notification': {
      // Stored as {type: <subtype>, [subtype]: payload} — e.g.
      // {type: 'email', email: {...}}. The spec addresses users by name, so a
      // payload naming users by id can only be rebuilt if every id resolves.
      const subtype = attributes.type;
      const payload = { ...(attributes[subtype] ?? {}) };
      if (!subtype || !attributes[subtype]) {
        unsupported.push({ id: node.id, name: node.name, reason: 'notification payload has an unrecognised shape' });
        return null;
      }
      const selected = payload.selectedUser;
      if (Array.isArray(selected) && selected.length > 0) {
        const users = selected.map(id => nameOf(data.users, id));
        if (users.some(value => value === undefined)) {
          unsupported.push({ id: node.id, name: node.name, reason: 'notified user id does not resolve to a name' });
          return null;
        }
        delete payload.selectedUser;
        delete payload.userType;
        return { notificationType: subtype, users, payload };
      }
      return { notificationType: subtype, payload };
    }
    default:
      unsupported.push({ id: node.id, name: node.name, reason: `action type "${node.type}" is not round-tripped` });
      return null;
  }
}

// Triggers whose builder rejects an empty filter list. Reading one of these
// without its conditions yields a spec that cannot be built, so say so rather
// than returning a trigger that looks complete.
const TRIGGERS_REQUIRING_FILTERS = new Set([
  'contact_tag',
  'contact_changed',
  'custom_date_reminder',
  'pipeline_stage_changed',
  'opportunity_status_changed'
]);

/**
 * Prove an extracted config reproduces the live node, and report it when it does not.
 *
 * `configFrom` is an allowlist of fields to KEEP, but the safety contract needs
 * an allowlist of fields it is safe to IGNORE. Every silent-loss bug found in
 * review was the same shape: a key present on the live node, absent from the
 * switch arm, compared against nothing — email tracking options, weighted
 * round-robin splits, opportunity custom fields, SMS template ids.
 *
 * So instead of trusting the extraction, run it back through the real forward
 * composer and diff. Anything that does not survive the round-trip is reported
 * rather than quietly dropped, and this covers action types added later too.
 */
const isEmpty = value =>
  value === undefined || value === null || (Array.isArray(value) && value.length === 0);

// Fields the platform fills in itself. They carry no authored intent — nothing
// in a spec can express them — so a difference here is the server doing its job,
// not a change the rebuild would make. Compared by their own name at any depth,
// because they do not all live at the top level: `sourceId` is nested inside
// `trackingOptions`, and while it was listed here it was never actually skipped
// (the comparison only walked top-level keys). Since every email step that has
// ever been saved carries a `sourceId`, that one oversight made every workflow
// containing an email unreadable, and therefore uneditable.
const SERVER_DERIVED = new Set(['name', 'cat', 'sourceId', 'htmlDefaults', 'isCloned']);

/**
 * Compare one live value against its re-composed counterpart, ignoring
 * server-derived fields wherever they appear.
 *
 * Recursing matters: comparing whole objects with JSON.stringify judged
 * `trackingOptions` as a unit, so a benign server-filled `sourceId` was
 * indistinguishable from the link-tracking flags beside it — which are real
 * authored settings that a rebuild would silently turn off. Recursion lets the
 * dangerous siblings still be caught while the benign field is excluded.
 */
function valuesDiffer(live, rebuilt) {
  if (isEmpty(live) && isEmpty(rebuilt)) return false;
  const bothPlainObjects =
    live && rebuilt &&
    typeof live === 'object' && typeof rebuilt === 'object' &&
    !Array.isArray(live) && !Array.isArray(rebuilt);
  if (!bothPlainObjects) return JSON.stringify(live) !== JSON.stringify(rebuilt);

  for (const key of new Set([...Object.keys(live), ...Object.keys(rebuilt)])) {
    if (SERVER_DERIVED.has(key)) continue;
    if (valuesDiffer(live[key], rebuilt[key])) return true;
  }
  return false;
}

function residualMismatch(node, config, data) {
  let rebuilt;
  try {
    rebuilt = actionAttributes({ type: node.type, name: node.name, config }, data, new Map());
  } catch (error) {
    return `re-composing the extracted step failed: ${error.message}`;
  }
  if (rebuilt === undefined) return null;
  const live = node.attributes ?? {};
  const differing = [];
  for (const key of new Set([...Object.keys(live), ...Object.keys(rebuilt)])) {
    if (SERVER_DERIVED.has(key)) continue;
    // An absent field and an empty list carry the same meaning here, and the
    // composer omits what the live node stores as []. Treating that as drift
    // would cry wolf on every step and train the reader to be ignored.
    if (valuesDiffer(live[key], rebuilt[key])) differing.push(key);
  }
  return differing.length ? `rebuilding would change ${differing.join(', ')}` : null;
}

function nextIds(node) {
  if (Array.isArray(node?.next)) return node.next;
  return typeof node?.next === 'string' && node.next ? [node.next] : [];
}

/**
 * Walk the linear chain from `startId`, converting each node to a spec action.
 *
 * Branching (`if_else`) and `goto` are reported as unsupported rather than
 * flattened: flattening would produce a spec that builds a structurally
 * different workflow while looking correct.
 */
/**
 * Mark everything still ahead of a hard stop as un-walked.
 *
 * Some stops are genuine: at a branch, or at a step with two successors, the
 * reader cannot know which chain continues, so it must stop. But the steps after
 * it are usually perfectly ordinary and reachable — reporting them as "not
 * reachable from the first step" describes a graph defect that does not exist
 * and sends the reader looking in the wrong place entirely.
 */
function markUnwalked(startId, nodes, unsupported, seen, why) {
  let current = startId ? nodes.get(startId) : undefined;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    unsupported.push({ id: current.id, name: current.name ?? null, reason: why });
    const next = nextIds(current);
    if (next.length !== 1) break;
    current = nodes.get(next[0]);
  }
}

function actionsFrom(startId, nodes, data, unsupported, seen) {
  const actions = [];
  let current = startId ? nodes.get(startId) : undefined;
  while (current) {
    if (seen.has(current.id)) {
      unsupported.push({ id: current.id, name: current.name, reason: 'the step graph loops back on itself' });
      break;
    }
    seen.add(current.id);

    if (current.type === 'if_else' || current.nodeType === 'condition-node' || current.type === 'goto') {
      unsupported.push({ id: current.id, name: current.name, reason: `"${current.type}" branching is not round-tripped` });
      for (const branchId of nextIds(current)) {
        markUnwalked(branchId, nodes, unsupported, seen, `not read because an earlier "${current.type}" step could not be followed`);
      }
      break;
    }

    // A step that cannot be represented faithfully is a fidelity problem with
    // that step, not a traversal problem: the chain is still followable, so the
    // walk continues. Stopping here reported every later step as "not reachable
    // from the first step" — one email with link tracking enabled produced four
    // bogus unreachable steps, and a caller that (correctly) refuses to rebuild
    // an incomplete spec then refused an edit that was perfectly safe.
    //
    // The step is deliberately NOT pushed to `actions`: it is recorded in
    // `unsupported`, which sets complete:false and makes step_count disagree,
    // so nothing can rebuild from this spec and silently drop it.
    const config = configFrom(current, data, unsupported);
    const mismatch = config === null ? null : residualMismatch(current, config, data);
    if (config === null || mismatch) {
      if (mismatch) unsupported.push({ id: current.id, name: current.name, reason: mismatch });
    } else {
      actions.push({ type: current.type, name: current.name, config });
    }

    const next = nextIds(current);
    if (next.length > 1) {
      unsupported.push({ id: current.id, name: current.name, reason: 'the step has more than one following step' });
      for (const branchId of next) {
        markUnwalked(branchId, nodes, unsupported, seen, 'not read because an earlier step had more than one following step');
      }
      break;
    }
    current = next[0] ? nodes.get(next[0]) : undefined;
  }
  return actions;
}

function triggersFrom(triggers, unsupported) {
  return (triggers ?? [])
    .filter(trigger => trigger?.type)
    .map(trigger => {
      // The API returns these as `conditions`; the spec calls them `filters`.
      // Reading only `filters` silently produced a trigger with none, and types
      // like contact_tag reject that outright ("filters must not be empty"),
      // so an edit that should have appended a step failed instead.
      const source = trigger.conditions ?? trigger.filters ?? [];
      const filters = source.map(filter => ({
        field: filter.field,
        operator: filter.operator,
        ...(filter.value !== undefined ? { value: filter.value } : {}),
        ...(filter.title ? { title: filter.title } : {}),
        ...(filter.type ? { type: filter.type } : {})
      }));
      if (filters.length === 0 && TRIGGERS_REQUIRING_FILTERS.has(trigger.type)) {
        unsupported.push({
          id: trigger.id ?? null,
          name: trigger.name ?? trigger.type,
          reason: `trigger "${trigger.type}" requires filters but none could be read`
        });
      }
      return {
        type: trigger.type,
        ...(trigger.name ? { name: trigger.name } : {}),
        // Only spec-facing condition fields — never stored ids or active state.
        ...(filters.length ? { filters } : {})
      };
    });
}

/**
 * Convert already-fetched workflow data into a spec.
 *
 * Kept separate from the network call so the conversion can be tested against
 * recorded payloads without a live browser session.
 */
export function toSpec({ workflowId, locationId, workflow, steps, triggers, data, stepsLoaded = true }) {
  const templates = steps.templates ?? [];
  const nodes = new Map(templates.map(node => [node.id, node]));
  const inbound = new Set(templates.flatMap(nextIds));
  const root = templates.find(node => node.order === 0 && !inbound.has(node.id)) ?? templates.find(node => !inbound.has(node.id));

  const unsupported = [];
  const published = workflow?.status === 'published';
  // getStepsJson returns {templates: []} with no error when the steps file is
  // missing, so a failed fetch is indistinguishable from an empty workflow —
  // and reported as complete. Rebuilding that spec wipes every real step.
  if (!stepsLoaded) {
    unsupported.push({
      id: null,
      name: null,
      reason: 'the workflow steps could not be loaded, so this spec is not a record of what exists'
    });
  }
  // Every node having an inbound edge means the graph has no entry point, so
  // there is nothing to walk. Say so — silently returning zero actions reads
  // like an empty workflow, which is exactly the wrong thing to build back.
  if (templates.length > 0 && !root) {
    unsupported.push({ id: null, name: null, reason: 'no first step could be identified in the step graph' });
  }
  // More than one entry point means the walk would silently follow one chain
  // and delete the others on rebuild. Which one it picks is array order.
  const roots = templates.filter(node => !inbound.has(node.id));
  if (roots.length > 1) {
    unsupported.push({
      id: null,
      name: null,
      reason: `the step graph has ${roots.length} entry points, so only one chain could be followed`
    });
  }

  const seen = new Set();
  const actions = actionsFrom(root?.id, nodes, data, unsupported, seen);

  // Anything never visited would be destroyed by a rebuild. The old count check
  // could not see this: two chains of equal length made the totals agree.
  for (const node of templates) {
    if (!seen.has(node.id)) {
      unsupported.push({
        id: node.id,
        name: node.name ?? null,
        reason: 'step is not reachable from the first step, so it was never read'
      });
    }
  }

  return {
    workflow_id: workflowId,
    location: locationId,
    status: workflow?.status ?? null,
    spec: {
      name: workflow?.name ?? '',
      folder: workflow?.folderName ?? null,
      // Mirror the live state. Editing a published workflow leaves it
      // published — forcing false here would have turned "add a step" into an
      // unpublish, and made the model describe an edit as building a draft.
      publish: published,
      triggers: triggersFrom(triggers, unsupported),
      actions
    },
    // Non-empty means the spec is NOT safe to build back: it is missing steps
    // the live workflow has.
    unsupported,
    // Advisory only. spec.publish mirrors the live state, and the publish guard
    // reads the build_workflow TOOL ARGUMENT `allow_publish` — not any spec
    // field — so the caller must pass it themselves.
    ...(published ? { requires_allow_publish: true } : {}),
    complete: unsupported.length === 0 && actions.length === templates.length,
    step_count: { live: templates.length, in_spec: actions.length }
  };
}

export async function readWorkflow({ workflowId, locationId = LAB.locationId, appOrigin }) {
  const client = await connectGhlClient({ locationId, appOrigin });
  try {
    const location = await resolveLocationDescriptor(client, locationId);
    const data = await resolveLocationData(location, client);
    const workflow = await client.getWorkflow(workflowId);
    const steps = await client.getStepsJson(workflow);
    const triggers = await client.getTriggers(workflowId);
    // getStepsJson falls back to an empty template list when the workflow has
    // no fileUrl, which is silent. Treat "no fileUrl and no inline templates"
    // as a failed load rather than as an empty workflow.
    const stepsLoaded = Boolean(workflow?.fileUrl) || Array.isArray(workflow?.workflowData?.templates);
    return toSpec({ workflowId, locationId, workflow, steps, triggers, data, stepsLoaded });
  } finally {
    await client.disconnect();
  }
}

async function main() {
  const workflowId = argument('workflow');
  if (!workflowId) {
    process.stderr.write('READ WORKFLOW FAILED: --workflow is required\n');
    return 1;
  }
  const locationId = argument('location') ?? LAB.locationId;
  let appOrigin = argument('app-origin');
  if (!appOrigin) {
    // Without this the client silently falls back to the default white-label
    // domain, and every call returns 403 "Forbidden resource" — an error that
    // reads like a login or permission problem and sends you chasing the wrong
    // thing. Resolve the origin from the agency registry instead.
    const { listAgencyAccounts } = await import('./lib/agency.mjs');
    const accounts = await listAgencyAccounts();
    const agency = Object.values(accounts).find(candidate => candidate.locations.includes(locationId));
    if (!agency) {
      process.stderr.write(
        `READ WORKFLOW FAILED: location ${locationId} is not in the agency registry, ` +
        'so its app origin is unknown. Pass --app-origin explicitly.\n'
      );
      return 1;
    }
    appOrigin = agency.appOrigin;
  }
  try {
    const result = await readWorkflow({ workflowId, locationId, appOrigin });
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return result.complete ? 0 : 2;
  } catch (error) {
    process.stderr.write(`READ WORKFLOW FAILED: ${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main());
}
