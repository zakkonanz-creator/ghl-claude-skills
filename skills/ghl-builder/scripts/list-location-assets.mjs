#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { resolveLocationData } from './lib/resolve.mjs';
import { LAB } from './build-workflow.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

export async function listLocationAssets(locationId = LAB.locationId, appOrigin) {
  const client = await connectGhlClient({ locationId, appOrigin });
  try {
    const location = await resolveLocationDescriptor(client, locationId);
    const data = await resolveLocationData(location, client);
    return {
      location,
      tags: data.tags.map(({ id, name }) => ({ id, name })),
      pipelines: data.pipelines.map(({ id, name, stages = [] }) => ({ id, name, stages: stages.map(({ id: stageId, name: stageName }) => ({ id: stageId, name: stageName })) })),
      customFields: data.customFields.map(({ id, name, fieldKey, dataType, type }) => ({ id, name, fieldKey, dataType, type })),
      users: data.users.map(({ id, name, email }) => ({ id, name, email }))
    };
  } finally {
    await client.disconnect();
  }
}

async function main() {
  try {
    const assets = await listLocationAssets(argument('location') ?? LAB.locationId, argument('app-origin'));
    process.stdout.write(JSON.stringify(assets, null, 2) + '\n');
    return 0;
  } catch (error) {
    process.stderr.write(`LIST ASSETS FAILED: ${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main());
