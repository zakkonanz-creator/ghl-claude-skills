import { writeSync } from 'node:fs';
import { mkdir, readFile, rmdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { accountForLocation, resolvePlaywrightPath } from './config.mjs';

export const API_BASE = 'https://backend.leadconnectorhq.com';
export const DEFAULT_CDP_URL = 'http://localhost:9222';
export const DEFAULT_CDP_LOCK_PATH = new URL('../../research/phase2/.cdp-lock', import.meta.url);
export const DEFAULT_CDP_PRIORITY_PATH = new URL('../../research/phase2/.cdp-priority', import.meta.url);

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function builderFrame(page) {
  return page.frames().find(frame => frame !== page.mainFrame() && (
    frame.url().includes('client-app-automation-workflows') || frame.url().includes('leadconnectorhq.com')
  ));
}

async function waitForBuilderFrame(page, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const frame = builderFrame(page);
    if (frame) return frame;
    await delay(500);
  }
  throw new Error('builder iframe did not load');
}

function forceDropBrowser(browser) {
  const connection = browser?._connection;
  const candidates = [
    browser?._transport, browser?._ws, browser?._webSocket,
    connection?._transport, connection?._ws, connection?._webSocket,
    connection?._transport?._ws
  ].filter(Boolean);
  for (const candidate of candidates) {
    try { candidate.removeAllListeners?.(); } catch {}
    try { candidate.onmessage = undefined; candidate.onclose = undefined; candidate.onerror = undefined; } catch {}
    try { candidate.terminate?.(); } catch {}
    try { candidate.destroy?.(); } catch {}
    try { candidate.close?.(); } catch {}
  }
  try { connection?.close?.('forced CDP disconnect'); } catch {}
  try { connection?.removeAllListeners?.(); } catch {}
  try { browser?._didClose?.(); } catch {}
  try { browser?.removeAllListeners?.(); } catch {}
}

export async function disconnectBrowser(browser, timeout = 5000) {
  if (!browser) return;
  // close() on a connectOverCDP browser only disconnects. Forcing the private
  // _shouldCloseConnectionOnClose flag made close() hang and left the process
  // unable to connectOverCDP again; the timeout below is the only fallback.
  let timer;
  await Promise.race([
    Promise.resolve().then(() => browser.close()).catch(() => {}),
    new Promise(resolve => {
      timer = setTimeout(() => {
        forceDropBrowser(browser);
        resolve();
      }, timeout);
    })
  ]);
  clearTimeout(timer);
}

export async function acquireCdpLock(lockPath = DEFAULT_CDP_LOCK_PATH, timeout = 300000, pollInterval = 2000, logWait = true, owner, priorityPath = DEFAULT_CDP_PRIORITY_PATH) {
  const directory = lockPath instanceof URL ? fileURLToPath(lockPath) : lockPath;
  const ownerFile = path.join(directory, 'owner');
  await mkdir(path.dirname(directory), { recursive: true });
  const started = Date.now();
  let reported = false;
  while (true) {
    const priorityOwner = await readFile(priorityPath, 'utf8').then(value => value.trim()).catch(error => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (priorityOwner && priorityOwner !== owner) {
      if (!reported && logWait) {
        writeSync(2, `waiting for cdp-priority held by ${priorityOwner}\n`);
        reported = true;
      }
      if (Date.now() - started >= timeout) throw new Error(`timed out waiting for CDP priority held by ${priorityOwner}`);
      await delay(pollInterval);
      continue;
    }
    try {
      await mkdir(directory);
      await writeFile(ownerFile, `${process.pid}\n`);
      let released = false;
      return async () => {
        if (released) return;
        released = true;
        await unlink(ownerFile).catch(error => {
          if (error.code !== 'ENOENT') throw error;
        });
        await rmdir(directory).catch(error => {
          if (error.code !== 'ENOENT') throw error;
        });
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const holder = await readFile(ownerFile, 'utf8').then(value => Number(value.trim())).catch(() => null);
      if (holder) {
        try {
          process.kill(holder, 0);
        } catch (holderError) {
          if (holderError.code === 'ESRCH') {
            await unlink(ownerFile).catch(() => {});
            await rmdir(directory).catch(() => {});
            continue;
          }
        }
      }
      if (!reported && logWait) {
        writeSync(2, `waiting for cdp-lock held by ${holder ?? 'unknown'}\n`);
        reported = true;
      }
      if (Date.now() - started >= timeout) throw new Error(`timed out waiting for CDP lock ${directory}`);
      await delay(pollInterval);
    }
  }
}

async function openCdpSocket(url, timeout, WebSocketImpl = WebSocket) {
  const socket = new WebSocketImpl(url);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try { socket.close(); } catch {}
      reject(new Error('raw CDP socket timed out'));
    }, timeout);
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener('error', () => {
      clearTimeout(timer);
      try { socket.close(); } catch {}
      reject(new Error('raw CDP socket failed'));
    }, { once: true });
  });
  return socket;
}

async function timedFetch(url, fetchImpl, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetchImpl(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function waitForTargetGone(cdpUrl, targetId, fetchImpl, timeout, pollInterval) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const remaining = timeout - (Date.now() - started);
    const response = await timedFetch(new URL('/json', cdpUrl), fetchImpl, Math.min(1000, remaining));
    if (response.ok) {
      const targets = await response.json();
      if (!targets.some(target => target.id === targetId)) return;
    }
    await delay(Math.min(pollInterval, Math.max(1, timeout - (Date.now() - started))));
  }
  throw new Error(`CDP target ${targetId} remained after close for ${timeout}ms`);
}

export async function preflightCdp(cdpUrl, timeout = 3000, {
  fetchImpl = fetch,
  WebSocketImpl = WebSocket,
  slowEvaluateTimeout = 10000,
  closePollTimeout = 5000,
  closePollInterval = 250
} = {}) {
  const [versionResponse, targetsResponse] = await Promise.all([
    timedFetch(new URL('/json/version', cdpUrl), fetchImpl, timeout),
    timedFetch(new URL('/json', cdpUrl), fetchImpl, timeout)
  ]);
  if (!versionResponse.ok || !targetsResponse.ok) throw new Error(`CDP preflight HTTP failure: version=${versionResponse.status} targets=${targetsResponse.status}`);
  const [{ webSocketDebuggerUrl }, targets] = await Promise.all([versionResponse.json(), targetsResponse.json()]);
  if (!webSocketDebuggerUrl) throw new Error('CDP preflight found no browser WebSocket URL');
  const socket = await openCdpSocket(webSocketDebuggerUrl, timeout, WebSocketImpl);
  let requestId = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timer);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });
  const request = (method, params = {}, sessionId, requestTimeout = timeout) => new Promise((resolve, reject) => {
    const id = ++requestId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`${method} timed out`));
    }, requestTimeout);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

  try {
    for (const target of targets.filter(candidate => candidate.type === 'page')) {
      let sessionId;
      try {
        ({ sessionId } = await request('Target.attachToTarget', { targetId: target.id, flatten: true }));
        try {
          await request('Runtime.evaluate', { expression: '1', returnByValue: true }, sessionId);
        } catch (error) {
          if (!/Runtime\.evaluate timed out/.test(error.message)) throw error;
          await request('Runtime.evaluate', { expression: '1', returnByValue: true }, sessionId, slowEvaluateTimeout);
        }
      } catch {
        await timedFetch(new URL(`/json/close/${target.id}`, cdpUrl), fetchImpl, timeout).catch(() => {});
        await waitForTargetGone(cdpUrl, target.id, fetchImpl, closePollTimeout, closePollInterval);
      } finally {
        if (sessionId) await request('Target.detachFromTarget', { sessionId }, undefined, 1000).catch(() => {});
      }
    }
  } finally {
    for (const waiter of pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error('raw CDP socket closed'));
    }
    pending.clear();
    socket.close();
  }
}

export async function claimPageOwnership(page, owner) {
  try {
    if (!page || page.isClosed?.()) return false;
  } catch {
    return false;
  }
  const desired = `phase2:${owner}`;
  return page.evaluate(value => {
    if (window.name && window.name !== value) return false;
    window.name = value;
    return true;
  }, desired).catch(() => false);
}

function safePageUrl(page) {
  try {
    if (!page || page.isClosed?.()) return null;
    return page.url();
  } catch {
    return null;
  }
}

export async function bootstrapOwnedPage(context, candidate, owner, timeout) {
  if (await claimPageOwnership(candidate, owner)) return candidate;
  const candidateUrl = safePageUrl(candidate);
  if (!candidateUrl) throw new Error(`cannot bootstrap ${owner}: source tab is unavailable`);
  const page = await context.newPage();
  try {
    if (!await claimPageOwnership(page, owner)) throw new Error(`new tab could not be claimed for ${owner}`);
    await page.goto(candidateUrl, { waitUntil: 'domcontentloaded', timeout });
    return page;
  } catch (error) {
    await page.close().catch(() => {});
    throw error;
  }
}

export async function selectOwnedPage(context, { locationId, owner, timeout, requestedIndex, appOrigin, warn = message => writeSync(2, `${message}\n`) }) {
  const locationMarker = `/location/${locationId}/`;
  const singularRoute = /\/automation\/workflow\/[^/?]+/;
  const allPages = context.pages();
  const validPages = allPages.filter(page => {
    const url = safePageUrl(page);
    return url?.startsWith(`${appOrigin}/`) && url.includes(locationMarker) && singularRoute.test(url);
  });
  const ownership = await Promise.all(validPages.map(async page => ({
    page,
    owner: await page.evaluate(() => window.name).catch(() => null)
  })));
  const owned = ownership.filter(entry => entry.owner === `phase2:${owner}`).map(entry => entry.page);
  if (owned.length > 1) throw new Error(`expected exactly one owned lab tab for ${owner}, found ${owned.length}`);
  if (owned.length === 1) return owned[0];

  let preferred;
  if (requestedIndex !== undefined) {
    const indexed = allPages[Number(requestedIndex)];
    const url = safePageUrl(indexed);
    if (url?.startsWith(`${appOrigin}/`) && url.includes(locationMarker) && singularRoute.test(url)) preferred = indexed;
    else warn(`GHL_AGENT_TAB_INDEX=${requestedIndex} is closed or invalid; falling back to claim-or-create`);
  }
  const candidates = [...new Set([preferred, ...validPages].filter(Boolean))];
  for (const candidate of candidates) if (await claimPageOwnership(candidate, owner)) return candidate;
  const source = candidates.find(candidate => safePageUrl(candidate));
  if (!source) {
    const page = await context.newPage();
    try {
      if (!await claimPageOwnership(page, owner)) throw new Error(`new tab could not be claimed for ${owner}`);
      await page.goto(`${appOrigin}/v2/location/${locationId}/automation/workflows`, { waitUntil: 'domcontentloaded', timeout });
      return page;
    } catch (error) {
      await page.close().catch(() => {});
      throw error;
    }
  }
  return bootstrapOwnedPage(context, source, owner, timeout);
}

export async function connectGhlClient({
  locationId,
  appOrigin,
  cdpUrl = DEFAULT_CDP_URL,
  playwrightPath = resolvePlaywrightPath(),
  owner = process.env.GHL_AGENT_OWNER,
  timeout = 45000,
  preflight = preflightCdp,
  cdpLockPath = DEFAULT_CDP_LOCK_PATH,
  cdpLockTimeout = 300000,
  cdpLockPollInterval = 2000,
  logLockWait = true,
  cdpPriorityPath = DEFAULT_CDP_PRIORITY_PATH
} = {}) {
  if (!locationId) throw new Error('locationId is required');
  appOrigin ??= accountForLocation(locationId)?.appOrigin;
  if (!appOrigin) throw new Error(`no app origin known for location ${locationId}; pass --app-origin or run \`node scripts/setup.mjs\``);
  const module = await import(pathToFileURL(playwrightPath).href);
  const chromium = module.chromium ?? module.default?.chromium;
  if (!chromium) throw new Error(`chromium export not found in ${playwrightPath}`);
  const releaseLock = await acquireCdpLock(cdpLockPath, cdpLockTimeout, cdpLockPollInterval, logLockWait, owner, cdpPriorityPath);
  let handedOff = false;
  try {
    await preflight(cdpUrl);
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      let browser;
      let ready = false;
      try {
        browser = await chromium.connectOverCDP(cdpUrl, { timeout });
        const client = await initializeClient({ browser, locationId, appOrigin, owner, timeout, releaseLock });
        ready = true;
        handedOff = true;
        return client;
      } catch (error) {
        lastError = error;
      } finally {
        if (!ready) await disconnectBrowser(browser);
      }
      await delay(1500);
    }
    throw lastError;
  } finally {
    if (!handedOff) await releaseLock();
  }
}

async function initializeClient({ browser, locationId, appOrigin, owner, timeout, releaseLock }) {
  const context = browser.contexts()[0];
  if (!context) throw new Error('debug Chrome has no browser context');

  if (!owner) throw new Error('GHL_AGENT_OWNER is required for live access; tag exactly one owned tab with ?phase2Agent=<owner>');
  const requestedIndex = process.env.GHL_AGENT_TAB_INDEX;
  const page = await selectOwnedPage(context, { locationId, appOrigin, owner, timeout, requestedIndex });

  let authorization;
  let captured = {};
  const sniff = request => {
    const headers = request.headers();
    if (headers.authorization && request.url().includes('backend.leadconnectorhq.com')) {
      authorization = headers.authorization;
      // Accumulate rather than replace. Not every authorized request carries
      // every header — `token-id` in particular is absent from some of them —
      // so overwriting the whole object meant a later, thinner request could
      // erase a good capture. That surfaced much later and far away, as
      // "authenticated session did not expose token-id metadata" from a tool
      // that had nothing to do with the request that lost it.
      for (const key of ['source', 'channel', 'version', 'token-id']) {
        if (headers[key]) captured[key] = headers[key];
      }
    }
  };
  page.on('request', sniff);
  try {
    await page.goto(page.url(), { waitUntil: 'domcontentloaded', timeout }).catch(() => {});
    const started = Date.now();
    // Wait for the token-id too, not just any authorized request: several
    // callers need it, and giving up as soon as `authorization` appears is what
    // made its presence depend on which request happened to be seen first.
    // Bounded separately so a session that genuinely never sends it costs a
    // couple of extra seconds rather than the whole timeout.
    const tokenIdGrace = Math.min(timeout, 5000);
    while (!authorization && Date.now() - started < timeout) await delay(500);
    const sawAuth = Date.now();
    while (!captured['token-id'] && Date.now() - sawAuth < tokenIdGrace) await delay(250);
  } finally {
    page.off('request', sniff);
  }
  if (!authorization) throw new Error('could not sniff a live builder bearer token');

  const frame = await waitForBuilderFrame(page, Math.min(timeout, 8000)).catch(() => page.mainFrame());
  const headers = { 'content-type': 'application/json', authorization, source: 'WEB_USER', channel: 'APP', version: '2021-07-28' };
  for (const [key, value] of Object.entries(captured)) if (value) headers[key] = value;

  async function apiFetch(method, url, body) {
    const result = await frame.evaluate(async ({ method, url, body, headers }) => {
      try {
        const response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
        return { status: response.status, text: await response.text() };
      } catch (error) {
        return { status: 0, text: '', error: String(error) };
      }
    }, { method, url, body, headers });
    if (result.error) throw new Error(`${method} ${url}: ${result.error}`);
    let parsed;
    try { parsed = result.text ? JSON.parse(result.text) : null; } catch { parsed = result.text; }
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`${method} ${url} returned HTTP ${result.status}: ${String(result.text).slice(0, 1000)}`);
    }
    return parsed;
  }

  const getWorkflow = async workflowId => {
    const result = await apiFetch('GET', `${API_BASE}/workflow/${locationId}/${workflowId}?includeScheduledPauseInfo=true`);
    return result.workflow ?? result;
  };
  const getTriggers = async workflowId => {
    const result = await apiFetch('GET', `${API_BASE}/workflow/${locationId}/trigger?workflowId=${encodeURIComponent(workflowId)}`);
    return result.triggers ?? result;
  };
  const getStepsJson = async workflowOrId => {
    const workflow = typeof workflowOrId === 'string' ? await getWorkflow(workflowOrId) : workflowOrId;
    if (!workflow?.fileUrl) return { templates: workflow?.workflowData?.templates ?? [] };
    const response = await fetch(workflow.fileUrl);
    if (!response.ok) throw new Error(`steps file returned HTTP ${response.status}`);
    return response.json();
  };
  let disconnected = false;
  const disconnect = async () => {
    if (disconnected) return;
    disconnected = true;
    try {
      await disconnectBrowser(browser);
    } finally {
      await releaseLock();
    }
  };

  return { browser, context, page, frame, headers, apiFetch, getWorkflow, getTriggers, getStepsJson, disconnect, locationId, appOrigin };
}
