// Capture the location's custom field catalogue (the builder loads it for
// "Add Object Fields") and list the contact fields a form can map to.
import { connect, ownTab, goto, clickInFrame, builderFrame, ORIGIN, LOCATION, out } from './lib.mjs';
import { writeFileSync } from 'node:fs';

const FORM_ID = process.argv[2];
if (!FORM_ID) { out({ error: 'usage: node fetch-custom-fields.mjs <formId>' }); process.exit(1); }
const { browser, context } = await connect();
const page = await ownTab(context, { urlMatch: `form-builder-v2/${FORM_ID}` });

let catalogue = null;
page.on('response', async res => {
  const u = res.request().url();
  if (/customFields\/search/.test(u) && /documentType=field/.test(u)) {
    try {
      const j = JSON.parse(await res.text());
      if (j.customFields && (!catalogue || j.customFields.length > catalogue.length)) catalogue = j.customFields;
    } catch {}
  }
});

await goto(page, `${ORIGIN}/v2/location/${LOCATION}/form-builder-v2/${FORM_ID}`);
await page.waitForTimeout(11000);
const frame = await builderFrame(page);
await clickInFrame(page, frame, `fn:function(){
  var e=document.querySelectorAll('div,span,button,li');
  for(var i=0;i<e.length;i++) if((e[i].innerText||'').trim()==='Add Object Fields' && e[i].children.length===0){
    var r=e[i].getBoundingClientRect(); if(r.width>0) return e[i]; }
  return null; }`).catch(() => {});
await page.waitForTimeout(6000);

if (!catalogue) { out({ error: 'catalogue not captured' }); await browser.close(); process.exit(1); }
writeFileSync(new URL('../research/custom-fields.json', import.meta.url), JSON.stringify(catalogue, null, 2));

const contactFields = catalogue.filter(f => f.model === 'contact');
out({
  total: catalogue.length,
  contactCount: contactFields.length,
  contactFields: contactFields.map(f => ({ id: f._id, key: f.fieldKey, name: f.name, dataType: f.dataType }))
});
await browser.close();
