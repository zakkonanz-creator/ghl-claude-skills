#!/usr/bin/env node
/**
 * sync-account-registry.mjs
 *
 * One command that gives an agent current, accurate knowledge of an account
 * before it plans anything:
 *
 *   custom contact fields  name, folder, type, valid options
 *   custom values          name, current value, and whether it is still blank
 *
 * Run it before planning a build, not during one. The platform accepts a
 * wrong-shaped write silently, so a field's type has to be known up front
 * rather than discovered by writing and seeing what happens.
 *
 *   node scripts/sync-account-registry.mjs --location <id>
 *   node scripts/sync-account-registry.mjs --location <id> --token <pit>
 *   node scripts/sync-account-registry.mjs --location <id> --print
 *
 * Auth: with --token (or GHL_PIT_TOKEN in the environment) it calls the public
 * API host directly, no browser needed. Without one it borrows the logged-in
 * session from the debug Chrome on port 9222.
 *
 * Global fields, the built-in contact and system ones, are account independent
 * and live in registry/global-fields.json. Refresh those with --global.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { accountForLocation, resolvePlaywrightPath } from './lib/config.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(HERE, '..', 'registry');
const PUBLIC_API = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : fallback;
}
const has = name => process.argv.includes(`--${name}`);

const locationId = arg('location');
const token = arg('token', process.env.GHL_PIT_TOKEN);
const appOrigin = arg('app-origin', accountForLocation(locationId)?.appOrigin);

if (!locationId) {
  console.error('usage: sync-account-registry.mjs --location <id> [--token <pit>] [--global] [--print]');
  process.exit(2);
}

/** Custom value keys arrive as "{{ custom_values.x }}"; specs write "{{custom_values.x}}". */
const normalise = key => String(key).replace(/\s+/g, '');

/**
 * Two ways to reach the API. A token is cleaner and needs no browser, but the
 * token must be issued for THIS location: one from another sub-account returns
 * 403 "does not have access to this location".
 */
async function viaToken(paths) {
  const results = {};
  for (const [name, url] of Object.entries(paths)) {
    const response = await fetch(`${PUBLIC_API}${url}`, {
      headers: { Authorization: `Bearer ${token}`, Version: VERSION }
    });
    if (!response.ok) {
      throw new Error(`${name} returned HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
    results[name] = await response.json();
  }
  return results;
}

async function viaBrowser(paths) {
  const { chromium } = await import(pathToFileURL(resolvePlaywrightPath()).href);
  const browser = await chromium.connectOverCDP(arg('cdp', 'http://localhost:9222'));
  const page = await browser.contexts()[0].newPage();
  try {
    let authorization = null;
    const extra = {};
    page.on('request', request => {
      const headers = request.headers();
      if (headers.authorization && request.url().includes('leadconnectorhq.com')) {
        authorization = headers.authorization;
        for (const key of ['channel', 'source', 'token-id']) if (headers[key]) extra[key] = headers[key];
      }
    });
    await page.goto(`${appOrigin}/v2/location/${locationId}/settings/custom_fields`, {
      waitUntil: 'domcontentloaded', timeout: 60000
    });
    for (let i = 0; i < 45 && !authorization; i++) await page.waitForTimeout(1000);
    if (!authorization) throw new Error('no authenticated session; log in first, or pass --token');

    return await page.evaluate(async ({ paths, authorization, extra, host, VERSION }) => {
      const headers = {
        'content-type': 'application/json',
        authorization,
        source: 'WEB_USER',
        channel: 'APP',
        version: VERSION,
        ...extra
      };
      const results = {};
      for (const [name, url] of Object.entries(paths)) {
        const response = await fetch(`${host}${url}`, { headers });
        if (!response.ok) throw new Error(`${name} returned HTTP ${response.status}`);
        results[name] = await response.json();
      }
      return results;
    }, { paths, authorization, extra, host: PUBLIC_API, VERSION });
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

const fetchAll = token ? viaToken : viaBrowser;

const { fields, values } = await fetchAll({
  fields: `/locations/${locationId}/customFields`,
  values: `/locations/${locationId}/customValues`
});

const customFields = fields.customFields ?? [];
const customValues = values.customValues ?? [];
if (!customFields.length && !customValues.length) {
  throw new Error('nothing returned; refusing to overwrite the registry with an empty read');
}

// Folder documents are not included in the list response, so resolve the few
// distinct parentIds by id. One extra call per folder, not per field.
const folderNames = {};
const folderIds = [...new Set(customFields.map(f => f.parentId).filter(Boolean))];
for (const folderId of folderIds) {
  try {
    const { folder } = await fetchAll({ folder: `/locations/${locationId}/customFields/${folderId}` });
    folderNames[folderId] = folder?.customField?.name ?? folder?.name ?? null;
  } catch {
    folderNames[folderId] = null;
  }
}

const fieldEntries = {};
for (const field of customFields) {
  fieldEntries[field.fieldKey] = {
    id: field.id,
    name: field.name,
    folder: folderNames[field.parentId] ?? null,
    model: field.model,
    dataType: field.dataType,
    ...(field.picklistOptions?.length ? { options: field.picklistOptions } : {})
  };
}

// The current value is the point: an agent should be able to see what this
// account has already been configured with, and what is still blank.
const valueEntries = {};
for (const value of customValues) {
  const key = normalise(value.fieldKey);
  valueEntries[key] = {
    id: value.id,
    name: value.name,
    value: value.value ?? null,
    filled: Boolean(value.value && String(value.value).trim())
  };
}

fs.mkdirSync(REGISTRY, { recursive: true });
const target = path.join(REGISTRY, `${locationId}.json`);
fs.writeFileSync(target, JSON.stringify({
  locationId,
  syncedAt: new Date().toISOString(),
  counts: { customFields: customFields.length, customValues: customValues.length },
  customFields: fieldEntries,
  customValues: valueEntries
}, null, 2));

const byType = {};
for (const field of customFields) byType[field.dataType] = (byType[field.dataType] ?? 0) + 1;
const blank = Object.values(valueEntries).filter(v => !v.filled);

console.log(`wrote ${target}`);
console.log(`${customFields.length} custom fields, ${customValues.length} custom values`);
for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(count).padStart(3)}  ${type}`);
}
if (folderIds.length) {
  console.log(`folders: ${folderIds.map(id => folderNames[id] ?? id).join(', ')}`);
}
if (blank.length) {
  console.log(`\n${blank.length} custom value${blank.length === 1 ? '' : 's'} still blank:`);
  for (const value of blank) console.log(`  ${value.name}`);
}

if (has('print')) {
  console.log('\n--- custom fields ---');
  for (const [key, field] of Object.entries(fieldEntries)) {
    const options = field.options ? `  options=${JSON.stringify(field.options)}` : '';
    console.log(`  ${field.dataType.padEnd(15)} ${key}${options}`);
  }
  console.log('\n--- custom values ---');
  for (const [key, value] of Object.entries(valueEntries)) {
    console.log(`  ${(value.filled ? value.value : '(blank)').slice(0, 40).padEnd(42)} ${key}`);
  }
}
