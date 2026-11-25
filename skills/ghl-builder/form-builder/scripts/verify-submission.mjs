// Independent verification: read the Submissions tab and confirm the values
// landed under the pre-existing field keys, not new duplicates.
import { connect, ownTab, goto, builderFrame, clickInFrame, ORIGIN, LOCATION, out } from './lib.mjs';
import { writeFileSync } from 'node:fs';

const FORM_ID = process.argv[2];
const { browser, context } = await connect();
const page = await ownTab(context, { urlMatch: `form-builder-v2/${FORM_ID}` });

const subs = [];
page.on('response', async res => {
  const u = res.request().url();
  if (/submission/i.test(u) && res.request().method() === 'GET') {
    try { subs.push({ url: u.slice(0, 140), body: (await res.text()).slice(0, 30000) }); } catch {}
  }
});

await goto(page, `${ORIGIN}/v2/location/${LOCATION}/form-builder-v2/${FORM_ID}`);
await page.waitForTimeout(11000);
const frame = await builderFrame(page);
await clickInFrame(page, frame, `fn:function(){
  var e=document.querySelectorAll('div,span,a,li,button');
  for(var i=0;i<e.length;i++) if((e[i].innerText||'').trim()==='Submissions' && e[i].children.length===0){
    var r=e[i].getBoundingClientRect(); if(r.width>0) return e[i]; }
  return null; }`);
await page.waitForTimeout(7000);
await page.screenshot({ path: new URL('../research/submissions-tab.png', import.meta.url).pathname, fullPage: true });

const text = await frame.evaluate(() => document.body.innerText.slice(0, 3000));
writeFileSync(new URL('../research/submissions.json', import.meta.url), JSON.stringify(subs, null, 2));
out({ submissionCalls: subs.map(s => s.url), pageText: text.slice(0, 1800) });
await browser.close();
