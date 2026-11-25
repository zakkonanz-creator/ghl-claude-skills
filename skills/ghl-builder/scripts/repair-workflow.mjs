#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationData } from './lib/resolve.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { applyRepair, unrepairableMismatches } from './lib/repair.mjs';
import { verifyBuildWithClient } from './verify-build.mjs';
import { LAB } from './build-workflow.mjs';
import { isLabLocation } from './lib/config.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function writeLog(log, directory = path.resolve('research/phase3/repairs')) {
  fs.mkdirSync(directory, { recursive: true });
  const safe = String(log.spec?.name ?? log.workflowId ?? 'repair').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const file = path.join(directory, `${new Date().toISOString().replace(/[:.]/g, '-')}-${safe}.json`);
  fs.writeFileSync(file, JSON.stringify(log, null, 2) + '\n');
  return file;
}

export async function repairWorkflow(spec, workflowId, { maxRetries = 3, client: suppliedClient, data: suppliedData, logDirectory, location = LAB } = {}) {
  if (!Number.isInteger(maxRetries) || maxRetries < 1) throw new Error('maxRetries must be a positive integer');
  if (isLabLocation(location.locationId) && !spec?.name?.startsWith('ZZZ-SPIKE-')) throw new Error('lab repair is restricted to ZZZ-SPIKE- workflow specs');
  const log = { startedAt: new Date().toISOString(), workflowId, spec, maxRetries, cycles: [] };
  let client = suppliedClient;
  let ownsClient = false;
  try {
    if (!client) { client = await connectGhlClient({ locationId: location.locationId, appOrigin: location.appOrigin }); ownsClient = true; }
    const resolvedLocation = suppliedData || location.companyId ? location : await resolveLocationDescriptor(client, location.locationId);
    const data = suppliedData ?? await resolveLocationData(resolvedLocation, client);
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const verification = await verifyBuildWithClient(spec, workflowId, client, data, resolvedLocation);
      const cycle = { attempt, verifiedAt: new Date().toISOString(), pass: verification.pass, mismatches: verification.bad };
      log.cycles.push(cycle);
      if (verification.pass) {
        log.ok = true;
        log.outcome = attempt === 0 ? 'already-matched' : 'repaired';
        break;
      }
      const policy = unrepairableMismatches(verification);
      cycle.unrepairable = policy;
      if (attempt === maxRetries || (policy.length && verification.bad.length === policy.length)) {
        log.ok = false;
        log.outcome = policy.length ? 'unrepairable-by-policy' : 'retries-exhausted';
        break;
      }
      cycle.patch = await applyRepair(spec, workflowId, verification, data, client, resolvedLocation);
    }
  } catch (error) {
    log.ok = false;
    log.outcome = 'unrepairable-error';
    log.error = error.stack ?? String(error);
  } finally {
    log.finishedAt = new Date().toISOString();
    if (ownsClient) await client?.disconnect();
  }
  if (logDirectory !== false) log.logFile = writeLog(log, logDirectory);
  return log;
}

async function main() {
  const specPath = argument('spec');
  const workflowId = argument('workflow');
  const retriesText = argument('max-retries') ?? '3';
  if (!specPath || !workflowId) {
    fs.writeSync(2, 'usage: node scripts/repair-workflow.mjs --spec <file> --workflow <id> [--location <id>] [--app-origin <origin>] [--max-retries 3]\n');
    return 2;
  }
  let result;
  try {
    const spec = JSON.parse(fs.readFileSync(path.resolve(specPath), 'utf8'));
    result = await repairWorkflow(spec, workflowId, { maxRetries: Number(retriesText), location: { ...LAB, locationId: argument('location') ?? LAB.locationId, appOrigin: argument('app-origin') } });
  } catch (error) {
    fs.writeSync(2, `REPAIR FAILED: ${error.message}\n`);
    return 2;
  }
  if (result.ok) fs.writeSync(1, `${result.outcome.toUpperCase()} workflow ${workflowId} in ${result.cycles.length - 1} repair cycle(s)\nlog: ${result.logFile}\n`);
  else {
    const final = result.cycles.at(-1);
    fs.writeSync(2, `UNREPAIRABLE workflow ${workflowId}: ${result.outcome}\n`);
    // Repair writes as it goes, so a failed run is NOT the same as an untouched
    // workflow. Saying only "unrepairable" led to the change being reported as
    // "no changes were made" when steps had in fact been added and rewired —
    // the one thing a report must never get backwards.
    const applied = result.cycles.flatMap(cycle => {
      const workflowPatch = cycle.patch?.workflow;
      const added = workflowPatch?.added?.length ?? 0;
      const removed = workflowPatch?.removed?.length ?? 0;
      const modified = workflowPatch?.modified?.length ?? 0;
      const triggers = cycle.patch?.triggers?.length ?? 0;
      return added + removed + modified + triggers
        ? [{ attempt: cycle.attempt, added, removed, modified, triggers }]
        : [];
    });
    if (applied.length) {
      fs.writeSync(2, 'CHANGES WERE APPLIED before this failure — the workflow is NOT untouched:\n');
      for (const row of applied) {
        fs.writeSync(
          2,
          `  cycle ${row.attempt}: ${row.added} step(s) added, ${row.removed} removed, ` +
          `${row.modified} modified, ${row.triggers} trigger change(s)\n`
        );
      }
      fs.writeSync(2, '  Read the workflow back before telling the user nothing changed.\n');
    }
    for (const row of final?.unrepairable ?? final?.mismatches ?? []) fs.writeSync(2, `${row.path ?? 'error'}: ${row.reason ?? `${row.status} expected=${JSON.stringify(row.expected)} actual=${JSON.stringify(row.actual)}`}\n`);
    if (result.error) fs.writeSync(2, `${result.error.split('\n')[0]}\n`);
    fs.writeSync(2, `log: ${result.logFile}\n`);
  }
  return result.ok ? 0 : 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main());
