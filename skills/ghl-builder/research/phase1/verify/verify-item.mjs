#!/usr/bin/env node
// verify-item.mjs — mechanical PASS/FAIL check that a documented trigger/action
// matches what is REALLY saved in GHL. Reviewer-runnable.
//
// Usage:
//   node verify-item.mjs --doc <raw-file.md> [--workflow <id>] [--node <nodeId>] [--kind action|trigger]
//
// The doc's "## Verified JSON" block carries the workflowId/nodeId in a metadata
// comment (see VERIFY-PROTOCOL.md), so --workflow/--node are usually inferred from
// the doc and optional on the CLI (CLI overrides the doc).
//
// Read paths (no writes):
//   - actions:  workflow detail -> fileUrl (Firebase steps JSON, auth-free curl) -> templates[] -> node by id
//   - triggers: GET /workflow/{loc}/trigger?workflowId={id} (needs a Bearer; sniffed
//               from the debug Chrome's builder iframe, read-only) -> trigger by id
//
// Output: field-level diff table + PASS/FAIL; evidence JSON saved under evidence/.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const LOC = process.env.GHL_BUILDER_LOCATION_ID || '<locationId>'; // lab by default; any location the session can reach
const B = 'https://backend.leadconnectorhq.com';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EVID = path.join(HERE, 'evidence');

// ---------- args ----------
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }
const docPath = arg('doc');
if (!docPath) { console.error('ERROR: --doc <raw-file.md> is required'); process.exit(2); }
const docText = fs.readFileSync(docPath, 'utf8');

// ---------- parse the "## Verified JSON" block + metadata ----------
// Format (strict — see VERIFY-PROTOCOL.md):
//   ## Verified JSON
//   <!-- verify: workflowId=<id> nodeId=<id> kind=action|trigger -->
//   ```json
//   { ...the exact saved node/trigger object as documented... }
//   ```
function parseDoc(text) {
  const h = text.indexOf('## Verified JSON');
  if (h < 0) return { error: 'no "## Verified JSON" heading found — doc is not verifiable (see VERIFY-PROTOCOL.md)' };
  const after = text.slice(h);
  const meta = {};
  const mm = after.match(/<!--\s*verify:\s*([^>]*?)-->/);
  if (mm) for (const kv of mm[1].trim().split(/\s+/)) { const [k, v] = kv.split('='); if (k) meta[k] = v; }
  const jm = after.match(/```json\s*([\s\S]*?)```/);
  if (!jm) return { error: '"## Verified JSON" heading has no ```json fenced block' };
  let doc;
  try { doc = JSON.parse(jm[1]); }
  catch (e) { return { error: 'documented JSON did not parse: ' + e.message }; }
  return { meta, doc };
}

// ---------- fetch reality ----------
async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url.slice(0, 80));
  return await r.text();
}

async function getActionNode(workflowId, nodeId, api) {
  // detail -> fileUrl (auth-free) -> templates[]
  const detailRaw = api
    ? (await api.call('GET', `${B}/workflow/${LOC}/${workflowId}?includeScheduledPauseInfo=true`)).body
    : null;
  if (!detailRaw) throw new Error('need --api (builder auth) to read workflow detail for the fileUrl');
  const detail = JSON.parse(detailRaw);
  const wf = detail.workflow || detail;
  if (!wf.fileUrl) throw new Error('workflow has no fileUrl');
  const steps = JSON.parse(await fetchText(wf.fileUrl)); // Firebase — auth-free
  const node = (steps.templates || []).find(t => t.id === nodeId);
  if (!node) throw new Error('node ' + nodeId + ' not in steps file (have: ' + (steps.templates || []).map(t => t.id).slice(0, 40).join(',') + ')');
  return { node, source: wf.fileUrl };
}

async function getTrigger(workflowId, triggerId, api) {
  if (!api) throw new Error('trigger verification needs --api (Bearer) to GET /trigger');
  const body = (await api.call('GET', `${B}/workflow/${LOC}/trigger?workflowId=${workflowId}`)).body;
  const arr = JSON.parse(body);
  const t = arr.find(x => x.id === triggerId);
  if (!t) throw new Error('trigger ' + triggerId + ' not found (have: ' + arr.map(x => x.id).join(',') + ')');
  return { node: t, source: `GET /workflow/${LOC}/trigger?workflowId=${workflowId}` };
}

// ---------- diff ----------
// Walk the DOCUMENTED object; for each leaf key path assert it exists in REALITY
// with matching type; flag value mismatches (informational unless --strict-values).
// Placeholder doc values (<...>, "..."), and keys the doc explicitly omits, are tolerated.
function isPlaceholder(v) {
  return typeof v === 'string' && (/^<.*>$/.test(v.trim()) || v.trim() === '...' || v.includes('<') && v.includes('>'));
}
function typeOf(v) { return Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v; }

function diff(docObj, realObj, base = '', out = []) {
  for (const k of Object.keys(docObj)) {
    const dp = base ? base + '.' + k : k;
    const dv = docObj[k];
    const has = realObj && Object.prototype.hasOwnProperty.call(realObj, k);
    if (!has) { out.push({ path: dp, status: 'MISSING', doc: JSON.stringify(dv).slice(0, 40), real: '—' }); continue; }
    const rv = realObj[k];
    if (dv && typeof dv === 'object' && !Array.isArray(dv) && rv && typeof rv === 'object' && !Array.isArray(rv)) {
      diff(dv, rv, dp, out); continue;
    }
    if (typeOf(dv) !== typeOf(rv) && !(isPlaceholder(dv))) {
      out.push({ path: dp, status: 'TYPE', doc: typeOf(dv), real: typeOf(rv) }); continue;
    }
    // arrays: shallow — compare length + element type of first
    if (Array.isArray(dv)) {
      const okType = typeOf((dv[0] ?? null)) === typeOf((rv[0] ?? null)) || dv.length === 0 || rv.length === 0;
      out.push({ path: dp, status: okType ? 'OK' : 'TYPE', doc: 'array[' + dv.length + ']', real: 'array[' + rv.length + ']' });
      continue;
    }
    if (isPlaceholder(dv)) { out.push({ path: dp, status: 'OK', doc: '<placeholder>', real: typeOf(rv) }); continue; }
    const match = JSON.stringify(dv) === JSON.stringify(rv);
    out.push({ path: dp, status: match ? 'OK' : 'VALUE', doc: JSON.stringify(dv).slice(0, 40), real: JSON.stringify(rv).slice(0, 40) });
  }
  return out;
}

// ---------- optional builder auth (only needed for detail/trigger reads) ----------
async function makeApi() {
  // Reuse the debug-Chrome bearer via a tiny CDP attach, read-only. Optional.
  try {
    const PW = process.env.PLAYWRIGHT_PATH || fileURLToPath(new URL('../../../node_modules/playwright/index.mjs', import.meta.url));
    const mod = await import(pathToFileURL(PW).href);
    const chromium = mod.chromium || (mod.default && mod.default.chromium);
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const ctx = browser.contexts()[0];
    const page = ctx.pages().find(p => p.url().includes('/v2/location/')) || ctx.pages()[0];
    let auth = null, hdrs = {};
    const sniff = req => { const h = req.headers(); if (h['authorization'] && req.url().includes('backend.leadconnectorhq.com')) { auth = h['authorization']; hdrs = { source: h['source'], channel: h['channel'], version: h['version'], 'token-id': h['token-id'] }; } };
    page.on('request', sniff);
    page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
    const s = Date.now(); while (!auth && Date.now() - s < 30000) await new Promise(r => setTimeout(r, 1000));
    page.off('request', sniff);
    if (!auth) return null;
    const H = { 'content-type': 'application/json', authorization: auth, source: 'WEB_USER', channel: 'APP' };
    for (const [k, v] of Object.entries(hdrs)) if (v) H[k] = v;
    if (!H.version) H.version = '2021-07-28';
    const frame = page.frames().find(f => f.url().includes('leadconnectorhq')) || page.mainFrame();
    const call = (m, u, b) => frame.evaluate(async ({ m, u, b, H }) => { try { const r = await fetch(u, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined }); return { status: r.status, body: await r.text() }; } catch (e) { return { error: String(e) }; } }, { m, u, b, H });
    return { call };
  } catch (e) { return null; }
}

// ---------- main ----------
(async () => {
  const parsed = parseDoc(docText);
  if (parsed.error) { console.log('FAIL — ' + parsed.error); process.exit(1); }
  const kind = arg('kind', parsed.meta.kind || 'action');
  const workflowId = arg('workflow', parsed.meta.workflowId);
  const nodeId = arg('node', parsed.meta.nodeId);
  if (!workflowId || !nodeId) { console.log('FAIL — workflowId/nodeId missing (put them in the <!-- verify: --> comment, or pass --workflow/--node)'); process.exit(1); }

  const api = await makeApi(); // may be null for pure action reads (fileUrl is auth-free but detail needs auth)
  let real, source;
  try {
    ({ node: real, source } = kind === 'trigger' ? await getTrigger(workflowId, nodeId, api) : await getActionNode(workflowId, nodeId, api));
  } catch (e) { console.log('FAIL — could not fetch reality: ' + e.message); process.exit(1); }

  const rows = diff(parsed.doc, real);
  const bad = rows.filter(r => r.status === 'MISSING' || r.status === 'TYPE');
  const valueMismatch = rows.filter(r => r.status === 'VALUE');
  const pass = bad.length === 0;

  // report
  const pad = (s, n) => (s + '').padEnd(n).slice(0, n);
  console.log('\n' + pad('FIELD PATH', 44) + pad('STATUS', 9) + pad('DOC', 42) + 'REAL');
  console.log('-'.repeat(120));
  for (const r of rows) console.log(pad(r.path, 44) + pad(r.status, 9) + pad(r.doc, 42) + r.real);
  console.log('-'.repeat(120));
  console.log(`doc-node ${kind} ${nodeId} in workflow ${workflowId}`);
  console.log(`source: ${source}`);
  console.log(`keys checked: ${rows.length} | missing/type-mismatch: ${bad.length} | value-mismatch (informational): ${valueMismatch.length}`);
  console.log(pass ? '\n✅ PASS — every documented key exists in reality with a matching type.'
                   : '\n❌ FAIL — ' + bad.length + ' documented key(s) missing or type-mismatched vs the real saved node.');

  // evidence
  fs.mkdirSync(EVID, { recursive: true });
  const slug = path.basename(docPath).replace(/\.md$/, '');
  const evFile = path.join(EVID, slug + '.json');
  fs.writeFileSync(evFile, JSON.stringify({ doc: docPath, kind, workflowId, nodeId, source, pass, rows, realNode: real }, null, 1));
  console.log('evidence: ' + evFile);

  process.exit(pass ? 0 : 1);
})();
