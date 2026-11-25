#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { LAB } from './build-workflow.mjs';
import { accountForLocation } from './lib/config.mjs';

const BUILDER_ORIGIN = 'https://client-app-automation-workflows.leadconnectorhq.com/';

export function workflowRoute(workflowId, locationId = LAB.locationId, appOrigin = accountForLocation(locationId)?.appOrigin) {
  if (!appOrigin) throw new Error(`no app origin known for location ${locationId}; run node scripts/setup.mjs`);
  return `${appOrigin}/v2/location/${locationId}/automation/workflow/${workflowId}`;
}

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function argumentsFor(name) {
  return process.argv.flatMap((value, index) => value === `--${name}` && process.argv[index + 1] ? [process.argv[index + 1]] : []);
}

export async function waitForWorkflowFrame(page, timeout = 60000, pollInterval = 250) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const frame = page.frames().find(candidate => candidate !== page.mainFrame() && candidate.url().startsWith(BUILDER_ORIGIN));
    if (frame) return frame;
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  throw new Error(`builder iframe src did not reach ${BUILDER_ORIGIN} within ${timeout}ms`);
}

export async function checkReloadRender(page, workflowId, expectedLabels, timeout = 60000, locationId = LAB.locationId, appOrigin) {
  const route = workflowRoute(workflowId, locationId, appOrigin);
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout });
  const started = Date.now();
  const frame = await waitForWorkflowFrame(page, timeout);
  const remaining = () => Math.max(1, timeout - (Date.now() - started));
  await frame.locator('[data-id]').first().waitFor({ state: 'attached', timeout: remaining() });
  for (const label of expectedLabels) {
    await frame.getByText(label, { exact: false }).first().waitFor({ state: 'visible', timeout: remaining() });
  }
  return { workflowId, route, frameUrl: frame.url(), expectedLabels };
}

async function main() {
  const workflowId = argument('workflow');
  const expectedLabels = argumentsFor('expect');
  const locationId = argument('location') ?? LAB.locationId;
  const appOrigin = argument('app-origin');
  if (!workflowId || expectedLabels.length === 0) throw new Error('usage: node scripts/reload-render.mjs --workflow <id> [--location <id>] --expect <canvas-label> [--expect <canvas-label>]');
  let client;
  try {
    client = await connectGhlClient({ locationId, appOrigin });
    await resolveLocationDescriptor(client, locationId);
    const result = await checkReloadRender(client.page, workflowId, expectedLabels, 60000, locationId, appOrigin);
    process.stdout.write(`PASS reload-render ${JSON.stringify(result)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`RELOAD-RENDER FAILED: ${error.message}\n`);
    return 1;
  } finally {
    await client?.disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await main();
  process.exit(code);
}
