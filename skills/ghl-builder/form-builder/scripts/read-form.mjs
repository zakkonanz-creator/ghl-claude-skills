// Read the saved form document back by intercepting the builder's own
// GET /forms/{id}. This is the independent verifier: never trust the writer.
import { connect, ownTab, goto, ORIGIN, LOCATION, out } from './lib.mjs';
import { writeFileSync } from 'node:fs';

const FORM_ID = process.argv[2];
if (!FORM_ID) { out({ error: 'usage: node read-form.mjs <formId>' }); process.exit(1); }
const OUT = process.argv[3] || `../research/read-${FORM_ID}.json`;

const { browser, context } = await connect();
const page = await ownTab(context, { urlMatch: `form-builder-v2/${FORM_ID}` });

let doc = null;
page.on('response', async res => {
  const r = res.request();
  if (r.method() === 'GET' && new RegExp(`services\\.leadconnectorhq\\.com/forms/${FORM_ID}$`).test(r.url())) {
    try { doc = JSON.parse(await res.text()); } catch {}
  }
});

await goto(page, `${ORIGIN}/v2/location/${LOCATION}/form-builder-v2/${FORM_ID}`);
await page.waitForTimeout(12000);

if (!doc) { out({ error: 'no form document captured' }); await browser.close(); process.exit(1); }
writeFileSync(new URL(OUT, import.meta.url), JSON.stringify(doc, null, 2));

const form = doc.form && doc.form.formData && doc.form.formData.form;
out({
  name: doc.form && doc.form.name,
  version: doc.form && doc.form.version,
  fieldCount: form ? form.fields.length : null,
  fields: form ? form.fields.map(f => ({ type: f.type, label: String(f.label).slice(0, 45), qk: f.hiddenFieldQueryKey })) : null
});
await browser.close();
