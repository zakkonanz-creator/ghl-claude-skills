#!/usr/bin/env node
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { CHROME_PROFILE_DIR, CONFIG_PATH, REPO_ROOT, findLoginScript, loadConfig, resolvePlaywrightPath, saveConfig } from './lib/config.mjs';
import { API_BASE, DEFAULT_CDP_URL, connectGhlClient } from './lib/ghl-client.mjs';
import { resolveLocationDescriptor } from './lib/location.mjs';
import { listAgencyAccounts, probeSession } from './lib/agency.mjs';

// Optional default lab sub-account (a throwaway location for test builds).
// Only accepted when this user's own session can reach it.
const DEFAULT_LAB = process.env.GHL_BUILDER_LAB_LOCATION_ID ?? 'none';
const CHROME_COMMAND = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="${CHROME_PROFILE_DIR}" &`;

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
const assumeYes = process.argv.includes('--yes');
const rl = readline.createInterface({ input: stdin, output: stdout });
const say = line => stdout.write(`${line}\n`);

async function ask(question, fallback = '') {
  if (assumeYes) return fallback;
  const answer = (await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)).trim();
  return answer || fallback;
}

async function cdpReachable() {
  try {
    const response = await fetch(new URL('/json/version', DEFAULT_CDP_URL), { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

function accountFromOrigin(appOrigin, locations) {
  const origin = new URL(appOrigin).origin;
  const key = new URL(origin).hostname.replace(/^app\./, '').split('.')[0];
  return { account: key, loginUrl: `${origin}/`, appOrigin: origin, locations };
}

async function promptAccount() {
  const origin = await ask('Platform URL you log in at (e.g. https://app.yourbrand.com)');
  if (!origin) throw new Error('an app origin is required');
  const ids = await ask('Sub-account (location) IDs you will build in, comma-separated');
  const locations = ids.split(',').map(id => id.trim()).filter(Boolean);
  if (!locations.length) throw new Error('at least one location id is required');
  return accountFromOrigin(origin, locations);
}

async function collectAccounts(existing) {
  if (argument('origin')) {
    const locations = (argument('locations') ?? '').split(',').map(id => id.trim()).filter(Boolean);
    return [accountFromOrigin(argument('origin'), locations)];
  }
  const known = Object.values(existing);
  if (known.length) {
    say(`\nExisting config at ${CONFIG_PATH}:`);
    for (const account of known) say(`  ${account.account}: ${account.appOrigin}  locations=${account.locations.join(', ')}`);
    if ((await ask('Keep these accounts? (y/n)', 'y')).toLowerCase().startsWith('y')) return known;
  } else if (findLoginScript()) {
    const imported = Object.values(await listAgencyAccounts());
    if (imported.length) {
      say('\nghl-login is installed; importing its accounts:');
      for (const account of imported) say(`  ${account.account}: ${account.appOrigin}  locations=${account.locations.join(', ')}`);
      if ((await ask('Use these? (y/n)', 'y')).toLowerCase().startsWith('y')) return imported;
    }
  }
  const accounts = [await promptAccount()];
  while ((await ask('Add another platform login? (y/n)', 'n')).toLowerCase().startsWith('y')) accounts.push(await promptAccount());
  return accounts;
}

async function ensureLoggedIn(account) {
  for (;;) {
    const probe = await probeSession(account.appOrigin);
    if (probe.loggedIn) return true;
    say(`\nNo authenticated tab for ${account.appOrigin} (${probe.reason}).`);
    say(`In the debug Chrome, open ${account.loginUrl} and log in.`);
    if (findLoginScript()) say(`(or, from Claude Code: node scripts/switch-agency.mjs --account ${account.account} — ghl-login signs in for you)`);
    if (assumeYes) return false;
    if ((await ask('Press Enter once you are logged in, or type "skip"')).toLowerCase() === 'skip') return false;
  }
}

// Each id must belong to the agency this user's session is signed into; the
// location resolver already enforces that. Unreachable ids are dropped, not
// written, so nothing in config points at a sub-account the engine cannot use.
async function validateLocations(account) {
  const client = await connectGhlClient({ locationId: account.locations[0], appOrigin: account.appOrigin });
  const valid = [];
  try {
    for (const locationId of account.locations) {
      try {
        await resolveLocationDescriptor(client, locationId);
        const detail = await client.apiFetch('GET', `${API_BASE}/locations/${locationId}`);
        const name = (detail.location ?? detail).name ?? '';
        say(`  ✓ ${locationId}  ${name}`);
        valid.push(locationId);
      } catch (error) {
        say(`  ✗ ${locationId}  ${error.message.split('\n')[0]}`);
      }
    }
  } finally {
    await client.disconnect();
  }
  return valid;
}

async function main() {
  process.env.GHL_AGENT_OWNER ??= `ghl-builder-setup-${process.pid}`;
  say('GHL builder — setup\n');

  const [major] = process.versions.node.split('.').map(Number);
  if (major < 20) throw new Error(`Node ${process.versions.node} found; 20 or newer is required`);
  say(`✓ Node ${process.versions.node}`);

  try {
    say(`✓ Playwright at ${resolvePlaywrightPath()}`);
  } catch (error) {
    throw new Error(`${error.message}\n  Run: cd ${REPO_ROOT} && npm install`);
  }

  while (!(await cdpReachable())) {
    say(`\nNo debug Chrome on ${DEFAULT_CDP_URL}. Start one (it keeps its own profile, so you log in once):\n\n  ${CHROME_COMMAND}\n`);
    if (assumeYes) throw new Error('debug Chrome is not running');
    await ask('Press Enter when Chrome is running');
  }
  say('✓ Debug Chrome reachable');
  say(findLoginScript() ? '✓ ghl-login found; it will log in for you when a session expires' : '· ghl-login not installed; you log in by hand when a session expires');

  const config = loadConfig();
  const accounts = await collectAccounts(config.accounts);
  const validated = {};
  for (const account of accounts) {
    say(`\nChecking ${account.appOrigin} …`);
    if (!(await ensureLoggedIn(account))) { say(`  skipped ${account.appOrigin}`); continue; }
    const locations = await validateLocations(account);
    if (locations.length) validated[account.account] = { ...account, locations };
    else say(`  no reachable sub-accounts for ${account.appOrigin}; skipped`);
  }
  if (!Object.keys(validated).length) throw new Error('no usable accounts; nothing written');

  const reachable = Object.values(validated).flatMap(account => account.locations);
  say('\nLab: a throwaway sub-account where builds skip the confirmation prompt.');
  say('Everything created there is named ZZZ-SPIKE-*. Every other sub-account always confirms first.');
  const labAnswer = argument('lab') ?? await ask(`Lab sub-account id, or "none"`, DEFAULT_LAB);
  let labLocationId = null;
  if (labAnswer.toLowerCase() !== 'none') {
    if (reachable.includes(labAnswer)) labLocationId = labAnswer;
    else say(`  ${labAnswer} is not among your reachable sub-accounts; no lab configured. Every build will ask for confirmation.`);
  }

  saveConfig({ ...config, accounts: validated, labLocationId });
  say(`\nWrote ${CONFIG_PATH}`);
  for (const account of Object.values(validated)) say(`  ${account.account}: ${account.appOrigin}  locations=${account.locations.join(', ')}`);
  say(`  lab: ${labLocationId ?? 'none (every build confirms)'}`);
  say(`\nNext: ask Claude Code to build a workflow. If it cannot find the engine, set GHL_BUILDER_REPO=${REPO_ROOT}`);
  return 0;
}

try {
  process.exit(await main());
} catch (error) {
  process.stderr.write(`SETUP FAILED: ${error.message}\n`);
  process.exit(1);
} finally {
  rl.close();
}
