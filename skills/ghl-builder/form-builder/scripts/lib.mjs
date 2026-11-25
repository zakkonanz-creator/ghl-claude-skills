// Shared Playwright/CDP helpers for form builds.
// Connects to the already-authenticated debug Chrome on :9222.
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { accountForLocation, resolvePlaywrightPath } from '../../scripts/lib/config.mjs';

const { chromium } = await import(pathToFileURL(resolvePlaywrightPath()).href);

export const LOCATION = process.env.GHL_BUILDER_LOCATION_ID;
if (!LOCATION) throw new Error('GHL_BUILDER_LOCATION_ID is required for form scripts');
export const ORIGIN = process.env.GHL_BUILDER_APP_ORIGIN ?? accountForLocation(LOCATION)?.appOrigin;
if (!ORIGIN) throw new Error(`no app origin known for location ${LOCATION}; run node scripts/setup.mjs`);
export const OWNER = process.env.GHL_AGENT_OWNER || 'form-build';

// Where read-back and capture scripts write their output (git-ignored).
export const RESEARCH_DIR = new URL('../research/', import.meta.url);
mkdirSync(RESEARCH_DIR, { recursive: true });

export async function connect() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  return { browser, context };
}

// Reuse a tab stamped with our owner name, otherwise open one. Never touch
// another owner's tab. Pass {urlMatch} to prefer an existing tab already on
// the right page (e.g. to resume with a modal still open).
export async function ownTab(context, { urlMatch } = {}) {
  if (urlMatch) {
    for (const page of context.pages()) {
      if (page.url().includes(urlMatch)) return page;
    }
  }
  for (const page of context.pages()) {
    const name = await page.evaluate(() => window.name).catch(() => null);
    if (name === OWNER) return page;
  }
  const page = await context.newPage();
  await page.evaluate(o => { window.name = o; }, OWNER).catch(() => {});
  return page;
}

// Close every extra tab we opened on a URL, keeping one.
export async function closeExtraTabs(context, urlMatch, keep = 1) {
  const matches = context.pages().filter(p => p.url().includes(urlMatch));
  for (const p of matches.slice(keep)) await p.close().catch(() => {});
  return matches.length;
}

export async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(o => { window.name = o; }, OWNER).catch(() => {});
}

// The form builder v2 lives in a cross-origin iframe on
// leadgen-apps-form-survey-builder.leadconnectorhq.com
export async function builderFrame(page, maxWait = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    for (const frame of page.frames()) {
      if (frame.url().includes('leadgen-apps-form-survey-builder')) {
        const ready = await frame
          .evaluate(() => document.readyState === 'complete' && !!document.body)
          .catch(() => false);
        if (ready) return frame;
      }
    }
    await page.waitForTimeout(750);
  }
  throw new Error('builder frame not found');
}

// Cross-origin iframes need coordinate clicks driven from the top-level page.
export async function clickInFrame(page, frame, selectorOrFn, arg) {
  const box = await frame.evaluate(({ sel, a }) => {
    let el = null;
    if (sel.startsWith('fn:')) {
      // eslint-disable-next-line no-new-func
      el = new Function('arg', 'return (' + sel.slice(3) + ')(arg)')(a);
    } else {
      el = document.querySelector(sel);
    }
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  }, { sel: selectorOrFn, a: arg ?? null });
  if (!box || box.w === 0) throw new Error('clickInFrame: no element for ' + selectorOrFn.slice(0, 80));
  await page.mouse.click(box.x, box.y);
  return box;
}

// The "Alert!" third-party-script modal appears on every form-level save once
// the form contains a <script>. Tick "Don't show again" BEFORE Proceed so it
// stops appearing for this user/browser, then Proceed.
// Returns 'dismissed' | 'suppressed+dismissed' | 'absent'.
export async function dismissScriptAlert(page, frame) {
  const present = await frame.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => (b.innerText || '').trim() === 'Proceed'
      && b.getBoundingClientRect().width > 0));
  if (!present) return 'absent';

  let suppressed = false;
  try {
    await clickInFrame(page, frame, `fn:function(){
      var t=[...document.querySelectorAll('*')].filter(function(e){
        return e.children.length===0 && /Don't show again/i.test(e.innerText||'');
      })[0];
      if(!t) return null;
      // The clickable control is the checkbox itself, or the label row.
      var row = t.parentElement || t;
      var cb = row.querySelector('input[type=checkbox], .n-checkbox-box, .n-checkbox');
      var el = cb || t;
      var r = el.getBoundingClientRect();
      return r.width>0 ? el : t; }`);
    await page.waitForTimeout(600);
    suppressed = await frame.evaluate(() => {
      const cb = document.querySelector('input[type=checkbox]:checked, .n-checkbox--checked');
      return !!cb;
    });
  } catch { /* checkbox is optional; never block the save on it */ }

  await clickInFrame(page, frame, `fn:function(){
    var b=document.querySelectorAll('button');
    for(var i=0;i<b.length;i++) if((b[i].innerText||'').trim()==='Proceed'){
      var r=b[i].getBoundingClientRect(); if(r.width>0) return b[i]; }
    return null; }`);
  await page.waitForTimeout(2500);
  return suppressed ? 'suppressed+dismissed' : 'dismissed';
}

// "Save progress for forms" (Settings) makes a returning visitor land on a
// "Submission in progress — would you like to continue?" modal that RESTORES
// the previous answers. For testing this is poison: a "fresh" load silently
// carries the last run's state. Always Start over unless resuming on purpose.
// Returns 'start over' | 'continue' | 'absent'.
export async function clearSavedProgress(page, choice = 'Start over') {
  const btn = await page.evaluate(label => {
    const b = [...document.querySelectorAll('button')]
      .find(x => (x.innerText || '').trim() === label && x.getBoundingClientRect().width > 0);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, choice);
  if (!btn) return 'absent';
  await page.mouse.click(btn.x, btn.y);
  await page.waitForTimeout(2500);
  return choice.toLowerCase();
}

export function out(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}
