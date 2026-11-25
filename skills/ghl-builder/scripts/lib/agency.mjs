import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { accountForLocation, findLoginScript, loadConfig, resolvePlaywrightPath } from './config.mjs';
import { DEFAULT_CDP_URL, disconnectBrowser, preflightCdp } from './ghl-client.mjs';

// Login resolution order, in every flow that needs a session:
//   1. an already-authenticated tab on the account's origin in the debug Chrome
//   2. the ghl-login skill, if it is installed on this machine
//   3. otherwise the user logs in by hand and re-runs
// Only step 2 depends on ghl-login; the account -> origin mapping never does.

function runLogin(script, args) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [script, ...args], {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;
    let killTimer;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(killTimer);
      resolve(result);
    };
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      killTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
    }, Number(process.env.GHL_LOGIN_TIMEOUT_MS ?? 90000));
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => finish({ exitCode: 1, stdout, stderr: stderr + error.message + '\n' }));
    child.on('close', code => finish(timedOut
      ? { exitCode: 1, stdout, stderr: stderr + `ghl-login timed out after ${process.env.GHL_LOGIN_TIMEOUT_MS ?? 90000}ms\n` }
      : { exitCode: code ?? 1, stdout, stderr }));
  });
}

export async function listAgencyAccounts() {
  const { accounts } = loadConfig();
  if (Object.keys(accounts).length) return accounts;
  const script = findLoginScript();
  if (!script) return {};
  const run = await runLogin(script, ['accounts']);
  if (run.exitCode !== 0) throw new Error(run.stderr || run.stdout || 'ghl-login accounts failed');
  return JSON.parse(run.stdout);
}

export async function resolveAgency({ locationId, account } = {}) {
  const accounts = await listAgencyAccounts();
  if (account) {
    const match = accounts[String(account).toLowerCase()];
    if (!match) throw new Error(`unknown account: ${account} (run \`node scripts/setup.mjs\`)`);
    if (locationId && !match.locations.includes(locationId)) throw new Error(`location ${locationId} is not mapped to account ${match.account}`);
    return match;
  }
  const matches = Object.values(accounts).filter(candidate => candidate.locations.includes(locationId));
  if (matches.length !== 1) throw new Error(matches.length ? `location ${locationId} maps to multiple accounts` : `location ${locationId} is not in the account mapping (run \`node scripts/setup.mjs\`)`);
  return matches[0];
}

// True when some tab on the origin is past the login screen. Never opens or
// navigates a tab: the user or ghl-login owns that.
export async function probeSession(appOrigin, { cdpUrl = DEFAULT_CDP_URL, timeout = 15000 } = {}) {
  const { chromium } = await import(pathToFileURL(resolvePlaywrightPath()).href);
  await preflightCdp(cdpUrl);
  const browser = await chromium.connectOverCDP(cdpUrl, { timeout });
  try {
    const pages = browser.contexts()[0]?.pages() ?? [];
    const onOrigin = pages.filter(page => page.url().startsWith(`${appOrigin}/`));
    if (!onOrigin.length) return { loggedIn: false, reason: 'no_tab' };
    for (const page of onOrigin) {
      const loggedIn = await page.evaluate(() => {
        const text = (document.body?.innerText || '').slice(0, 400);
        const loginField = document.querySelector('input[type="email"], input[type="password"]');
        return !loginField && !/sign into your account|sign in|verify security code|verification/i.test(text);
      }).catch(() => false);
      if (loggedIn) return { loggedIn: true };
    }
    return { loggedIn: false, reason: 'login_screen' };
  } finally {
    await disconnectBrowser(browser);
  }
}

export async function switchAgency({ locationId, account, code } = {}) {
  const agency = await resolveAgency({ locationId, account });
  const loginUrl = agency.loginUrl ?? `${agency.appOrigin}/`;
  if (!code) {
    const probe = await probeSession(agency.appOrigin);
    if (probe.loggedIn) return { exitCode: 0, stdout: '', stderr: '', agency, status: 'authenticated' };
  }
  const script = findLoginScript();
  if (!script) {
    return {
      exitCode: 0, stdout: '', stderr: '', agency,
      status: 'manual_login_required',
      message: `No authenticated tab for ${agency.appOrigin}. In the debug Chrome (port 9222), open ${loginUrl}, log in, then re-run.`
    };
  }
  if (!code) {
    const status = await runLogin(script, ['status', '--account', agency.account]);
    if (status.exitCode === 0 && /LOGGED_IN=true/.test(status.stdout)) {
      return { ...status, agency, status: 'authenticated' };
    }
    if (/ghl-login timed out/.test(status.stderr)) return { ...status, agency };
  }
  const args = code ? ['code', '--code', code, '--account', agency.account] : ['start', '--account', agency.account];
  const run = await runLogin(script, args);
  if (run.exitCode !== 0) return { ...run, agency };
  return {
    ...run,
    agency,
    status: code ? (/LOGGED_IN=true/.test(run.stdout) ? 'authenticated' : 'authentication_unconfirmed') : 'awaiting_2fa'
  };
}

export { accountForLocation };
