#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { composeWorkflow, validateSpec } from './lib/compose.mjs';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationData } from './lib/resolve.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { addTriggers, createWorkflow, deleteTriggers, saveWorkflow, setPublished } from './lib/build.mjs';
import { isLabLocation, labLocationId } from './lib/config.mjs';

export const LAB = {
  locationId: labLocationId()
};

export function locationFor(locationId = LAB.locationId, appOrigin) {
  if (!locationId) throw new Error('--location is required (no lab location configured; run `node scripts/setup.mjs`)');
  return { locationId, ...(appOrigin ? { appOrigin } : {}) };
}

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export function validateLocationReferences(spec, data) {
  const requireTag = (name, pathName) => {
    const matches = data.tags.filter(tag => tag.name?.toLowerCase() === String(name).toLowerCase());
    if (matches.length !== 1) throw new Error(matches.length ? `${pathName} tag is ambiguous: ${name}` : `${pathName} tag not found: ${name}`);
  };
  spec.triggers.forEach((trigger, triggerIndex) => {
    if (trigger.type !== 'contact_tag') return;
    trigger.filters.forEach((filter, filterIndex) => {
      if (filter.field === 'tagsAdded' || filter.field === 'tagsRemoved') requireTag(filter.value, `spec.triggers[${triggerIndex}].filters[${filterIndex}].value`);
    });
  });
  const visit = (actions, pathName) => actions.forEach((action, index) => {
    const here = `${pathName}[${index}]`;
    if (action.type === 'add_contact_tag' || action.type === 'remove_contact_tag') action.config.tags.forEach((tag, tagIndex) => requireTag(tag, `${here}.config.tags[${tagIndex}]`));
    if (action.type === 'if_else') {
      action.branches.forEach((branch, branchIndex) => visit(branch.actions, `${here}.branches[${branchIndex}].actions`));
      visit(action.else?.actions ?? [], `${here}.else.actions`);
    }
  });
  visit(spec.actions, 'spec.actions');
}

export function findFolder(data, name) {
  if (!name) return null;
  const matches = data.workflows.filter(item => item.name?.toLowerCase() === name.toLowerCase() && (item.type === 'folder' || item.type === 'directory' || item.isFolder));
  if (matches.length !== 1) throw new Error(matches.length ? `folder is ambiguous: ${name}` : `folder not found: ${name}`);
  return matches[0].id ?? matches[0]._id;
}

function writeLog(log) {
  const directory = path.resolve('research/phase2/builds');
  fs.mkdirSync(directory, { recursive: true });
  const safe = log.spec.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const file = path.join(directory, `${new Date().toISOString().replace(/[:.]/g, '-')}-${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(log, null, 2) + '\n');
  return file;
}

export async function buildFromSpec(spec, { dryRun = false, location = LAB, workflowId: targetWorkflowId } = {}) {
  validateSpec(spec);
  if (!dryRun && isLabLocation(location.locationId) && !spec.name.startsWith('ZZZ-SPIKE-')) throw new Error('lab workflow names must start with ZZZ-SPIKE-');
  // A published workflow stays published when you edit it, so publish=true is a
  // normal state to rebuild — not an escalation. The caller still has to pass
  // allow_publish explicitly, and the extension gates every write behind an
  // approval bound to the exact change, which is where consent belongs.

  let client;
  let resolvedLocation = location;
  try {
    client = await connectGhlClient({ locationId: location.locationId, appOrigin: location.appOrigin });
    resolvedLocation = await resolveLocationDescriptor(client, location.locationId);
    const locationData = await resolveLocationData(resolvedLocation, client);
    if (locationData.tags) validateLocationReferences(spec, locationData);
    const folder = findFolder(locationData, spec.folder);
    const composition = composeWorkflow(spec, locationData);
    if (dryRun) return { dryRun: true, spec, location: resolvedLocation, composition, ...(client ? { _disconnect: client.disconnect } : {}) };

    // In-place update is NOT implemented here and must not be attempted.
    //
    // composeWorkflow() allocates a fresh randomUUID for every node, and
    // saveWorkflow() sends them as createdSteps with empty modifiedSteps and
    // deletedSteps. Against an existing workflow that is a destroy-and-recreate:
    // the server is never told the old step ids are gone, so contacts parked on
    // them are stranded. repair-workflow.mjs already does this correctly via
    // reconcileTemplates(), which matches canonical nodes to actual ones and
    // reuses their ids. Route edits there instead of reimplementing it.
    const existingId = spec.workflow_id ?? targetWorkflowId;
    if (existingId) {
      throw new Error(
        'build_workflow cannot update an existing workflow: it would recreate every step with new ids ' +
        'and strand contacts mid-workflow. Use repair_workflow, which reconciles step ids in place.'
      );
    }
    const workflowId = await createWorkflow(client, resolvedLocation, { name: spec.name, folder, settings: spec.settings });
    const triggers = await addTriggers(client, resolvedLocation, workflowId, spec);
    await saveWorkflow(client, resolvedLocation, workflowId, composition, triggers, {
      name: spec.name,
      parentId: folder,
      status: 'draft'
    });
    // Only ever publishes something this call just created, and only when asked.
    // It never demotes: a workflow is left as the draft it already is rather
    // than being switched off by an omitted flag.
    const publishState = spec.publish === true
      ? await setPublished(client, resolvedLocation, workflowId, true)
      : { status: 'draft', triggersActive: false };
    return { dryRun: false, spec, location: resolvedLocation, workflowId, triggerIds: triggers.map(trigger => trigger.id), composition, publishState, _disconnect: client.disconnect };
  } catch (error) {
    if (client) error.disconnect = client.disconnect;
    throw error;
  }
}

async function main() {
  const specPath = argument('spec');
  if (!specPath) throw new Error('usage: node scripts/build-workflow.mjs --spec <file> [--location <id>] [--app-origin <origin>] [--dry-run]');
  const spec = JSON.parse(fs.readFileSync(path.resolve(specPath), 'utf8'));
  const startedAt = new Date().toISOString();
  let result;
  let disconnect;
  let code = 0;
  try {
    result = await buildFromSpec(spec, {
      dryRun: process.argv.includes('--dry-run'),
      location: locationFor(argument('location'), argument('app-origin')),
      // Without this the CLI could only ever create: --workflow was accepted on
      // the command line but never reached buildFromSpec, so asking to edit an
      // existing workflow silently produced a duplicate instead.
      workflowId: argument('workflow')
    });
    disconnect = result._disconnect;
    const log = { startedAt, finishedAt: new Date().toISOString(), ok: true, ...result };
    const logFile = writeLog(log);
    fs.writeSync(1, JSON.stringify({ ...result, logFile }, null, 2) + '\n');
  } catch (error) {
    disconnect = error.disconnect;
    const log = { startedAt, finishedAt: new Date().toISOString(), ok: false, spec, error: error.stack ?? String(error) };
    const logFile = writeLog(log);
    fs.writeSync(2, `BUILD FAILED: ${error.message}\nlog: ${logFile}\n`);
    code = 1;
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
