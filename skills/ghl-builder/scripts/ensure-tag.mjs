#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { API_BASE, connectGhlClient } from './lib/ghl-client.mjs';

import { isLabLocation, labLocationId } from './lib/config.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function listTags(client, locationId) {
  const result = await client.apiFetch('GET', `${API_BASE}/locations/${locationId}/tags?limit=200`);
  return result.tags ?? result;
}

export async function ensureLabTag(name, client, locationId = labLocationId()) {
  if (!name) throw new Error('tag name is required');
  if (isLabLocation(locationId) && !name.startsWith('zzz-spike-')) throw new Error('lab tag names must start with zzz-spike-');
  const matches = (await listTags(client, locationId)).filter(tag => tag.name?.toLowerCase() === name.toLowerCase());
  if (matches.length > 1) throw new Error(`lab tag is ambiguous: ${name}`);
  if (matches.length === 1) return { created: false, tag: matches[0] };
  await client.apiFetch('POST', `${API_BASE}/locations/${locationId}/tags`, { name });
  for (let attempt = 0; attempt < 12; attempt++) {
    const saved = (await listTags(client, locationId)).filter(tag => tag.name?.toLowerCase() === name.toLowerCase());
    if (saved.length > 1) throw new Error(`created tag read back ambiguously: ${name}`);
    if (saved.length === 1) return { created: true, tag: saved[0] };
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`created tag did not read back within 6s: ${name}`);
}

async function main() {
  const name = argument('name');
  const locationId = argument("location") ?? labLocationId();
  if (!locationId) throw new Error('--location is required (no lab location configured)');
  if (!name) throw new Error('usage: node scripts/ensure-tag.mjs --name <tag-name> [--location <id>]');
  let client;
  try {
    client = await connectGhlClient({ locationId, appOrigin: argument('app-origin') });
    const result = await ensureLabTag(name, client, locationId);
    process.stdout.write(`${result.created ? 'CREATED' : 'EXISTS'} tag ${result.tag.name} id=${result.tag.id ?? result.tag._id}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`ENSURE TAG FAILED: ${error.message}\n`);
    return 1;
  } finally {
    await client?.disconnect();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main());
