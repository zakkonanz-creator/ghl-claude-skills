#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { listAgencyAccounts, switchAgency } from './lib/agency.mjs';
import { acquireCdpLock } from './lib/ghl-client.mjs';

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  try {
    if (process.argv.includes('--list')) {
      process.stdout.write(JSON.stringify(await listAgencyAccounts(), null, 2) + '\n');
      return 0;
    }
    const locationId = argument('location');
    const account = argument('account');
    if (!locationId && !account) throw new Error('usage: node scripts/switch-agency.mjs --location <id> [--code <digits>]');
    const lockPath = process.env.GHL_CDP_LOCK_PATH;
    const priorityPath = process.env.GHL_CDP_PRIORITY_PATH;
    const release = await acquireCdpLock(lockPath, 300000, 2000, true, process.env.GHL_AGENT_OWNER ?? 'ghl-builder-agency-switch', priorityPath);
    let result;
    try {
      result = await switchAgency({ locationId, account, code: argument('code') });
    } finally {
      await release();
    }
    if (result.exitCode !== 0) {
      process.stderr.write(result.stderr || result.stdout);
      return result.exitCode;
    }
    process.stdout.write(JSON.stringify({ status: result.status, agency: result.agency, ...(result.message ? { message: result.message } : {}), login_output: result.stdout }, null, 2) + '\n');
    return result.status === 'authentication_unconfirmed' || result.status === 'manual_login_required' ? 1 : 0;
  } catch (error) {
    process.stderr.write(`SWITCH AGENCY FAILED: ${error.message}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main());
