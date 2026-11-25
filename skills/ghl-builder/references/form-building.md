# Building GHL Forms (form-builder-v2)

Everything here was verified live in a real location (2026-08-11, extended 2026-08-13)
unless marked otherwise. Written for an agent mid-task: facts first, traps prominent.

The headline: **a form is ONE JSON document and the save is a single full-document POST.**
You do not have to assemble a form by drag-and-drop. Compose the JSON and inject it.

**Read these three before you compose anything.** Each cost a real build an hour or more:

- **§5.9 — `custom: true` silently blocks ALL saves.** The single most expensive trap here.
- **§5.10 — how to actually confirm a save.** The Save button's state is not a signal, and
  error toasts hide inside the builder iframe.
- **§8.1 — four false negatives** that make a perfectly good form look broken.

---

## 1. Navigation

| Thing | Path |
|---|---|
| Forms list | `{origin}/v2/location/{loc}/form-builder/main` |
| A form | `{origin}/v2/location/{loc}/form-builder-v2/{formId}` |
| Builder iframe | `https://leadgen-apps-form-survey-builder.leadconnectorhq.com/form-builder-v2/{formId}` |
| Public form | `https://api.leadconnectorhq.com/widget/form/{formId}` |
| Tabs in builder | Edit · Settings · Submissions · Notifications · Analytics |

Use `/form-builder-v2/` (not `/form-builder/{id}`). `/form-builder/main` is the list page.

**White-label host caveat:** the public form renders on `api.leadconnectorhq.com`. A
white-label `link.<domain>` equivalent may fail TLS (`ERR_CERT_AUTHORITY_INVALID`) if that
host has no valid cert; test before promising a branded form URL.

### 1.1 Creating a form from scratch

There is no create endpoint you can call directly (§2). Drive the list page UI and let the
app issue its own authenticated create:

1. Go to the forms list: `{origin}/v2/location/{loc}/form-builder/main`.
2. Click **`Create form`** (top right). DOM-confirmed label — the button enumeration returned
   exactly one candidate, `"Create form"` at `(1115.7, 190.5)`. It is **not** "Add Form".
3. A **`Create new form`** modal appears offering **`Start from Scratch`** (already selected)
   and **`From templates`**. For a composed-JSON build you want Start from Scratch.
   *(These three strings were read from a screenshot, not from DOM text — the programmatic
   scrape returned only nav chrome. Treat the exact casing as unverified; match loosely.)*
4. Click **`Create`** — DOM-confirmed by exact-equality match on `innerText === 'Create'`.

The app fires `POST https://services.leadconnectorhq.com/forms/` → **`201`**, and the browser
navigates to `/form-builder-v2/{newId}`. The new `_id` is in the response body; capture it
with a `page.on('response')` listener rather than parsing it out of the URL:

```json
{"form":{"dateAdded":"2026-08-13T23:21:38.198Z","deleted":false,"name":"Form 65",
  "formData":{},"version":5,"locationId":"...","productType":"form",
  "source":"landing_page","_id":"<id043>"}}
```

Note the form is auto-named (`Form 65`) — set the real name in your first injected save.

> **TRAP: a synthetic `el.click()` does not work on these controls.** Neither the
> `Create form` button nor the modal's `Create` button responds to `element.click()` inside
> `page.evaluate`. Read the element's coordinates and issue a **real Playwright mouse click**
> (`page.mouse.click(x, y)`). These controls are on the **top-level page**, not in the
> builder iframe, so find them with `page.evaluate`, not `frame.evaluate`.

**A brand-new form is genuinely empty: `formData: {}`.** There is nothing in it to copy a
field shape from, so learn shapes from an existing form on the same location (§3.1) before
you compose.

---

## 2. There is no public API — but there IS an internal one

`POST /forms/` on the public API returns **401 "route not yet supported by the IAM Service"**.
That is a *wrong path*, not a permissions problem: no token or scope change fixes it, and
chasing scopes is a guaranteed dead end.

The builder itself uses `services.leadconnectorhq.com/forms/...` authenticated with a
**`token-id` header (NOT `Authorization: Bearer`)**, plus `source: WEB_USER`, `channel: APP`,
`version: 2021-07-28`.

| Call | Purpose |
|---|---|
| `GET /forms/?skip=0&limit=20&locationId=..&type=form&productType=form` | list forms |
| `GET /forms/{id}` | read the form document |
| `POST /forms/{id}` | **save the whole document** → `201` |
| `GET /forms/themes?locationId=..`, `/forms/default-colors`, `/forms/theme-style/{id}` | theming |

Custom field catalogue (for mapping):
`GET /locations/{loc}/customFields/search?parentId=&skip=0&limit=10000&documentType=field&model=all&query=&includeStandards=true`

### TRAP: you cannot replay these with `fetch()`

A hand-rolled `fetch()` fails with `TypeError: Failed to fetch` **even from inside the builder
iframe** — you cannot set `token-id`, so CORS preflight rejects it. Do not burn time on
header-guessing.

### The workaround that works: hijack the builder's own save

Let the page issue its own authenticated request and swap the body:

```js
await page.route('**/services.leadconnectorhq.com/forms/**', async route => {
  if (route.request().method() !== 'POST') return route.continue();
  const doc = JSON.parse(route.request().postData());
  doc.formData.form.fields = myFields;              // compose whatever you want
  await route.continue({ postData: JSON.stringify(doc) });
});
// then dirty the form in the UI and click the top-bar Save
```

Verified `201`, and the change survives a full reload. Always read back with `GET /forms/{id}`
and verify — never trust the writer.

---

## 3. Document shape

```
{ name, formData: { form: { ...~40 keys... }, recurringProductId, recurringProductCurrency,
                    recurringProducts, emailNotifications, autoResponder,
                    parentFolderId, parentFolderName, language } }
```

`formData.form` keys worth knowing: `fields[]`, `conditionalLogic`, `formAction`
(`actionType`, `redirect_url`, `thankyouText` = the on-submit message), `stickyContact`,
`currentThemeId`, `layout`, `style`, `formSubmissionEvent`, `fbPixelId`.

A standard field:

```json
{ "label": "First Name", "tag": "first_name", "hiddenFieldQueryKey": "first_name",
  "type": "text", "typeLabel": "Text", "placeholder": "Enter your first name",
  "required": false, "standard": true, "fieldWidthPercentage": 100 }
```

Field `type`s seen: `text`, `email`, `phone`, `html`, `submit`, `h1`, `terms_and_conditions`,
`large_text`, `radio`, `checkbox`, `date`, `single_options`, `group`.
A **newly created** form's `formData` is genuinely `{}` (§1.1) — nothing to copy from.
(An older note here said `{ lastUpdatedAt }`; the observed create response is a bare `{}`.
Either way: empty, so learn shapes elsewhere.)

### 3.1 Learn a correct shape by reading a form that already works

The fastest way to get conventions right for a new form on a location is to **read an
existing form's document from that same location** and copy the field shapes verbatim. You do
not need to solve auth to do it — just open the form in the builder and capture the app's own
`GET`:

```js
let doc = null;
page.on('response', async res => {
  if (res.request().method() === 'GET' && res.request().url().includes('/forms/' + REF_ID)) {
    try { doc = await res.json(); } catch {}
  }
});
await goto(page, `${ORIGIN}/v2/location/${LOCATION}/form-builder-v2/${REF_ID}`);
await page.waitForTimeout(15000);
const form = doc.form.formData.form;   // .fields[], .address, .conditionalLogic, ...
```

This is how the working address, `single_options`, and custom-field shapes in §3.2 were
obtained. Prefer it over guessing, and prefer it over the palette-drag probe below, which has
a destructive side effect.

Reading one sibling form yielded, in a single shot: the complete `type` vocabulary in use on
that location, the exact `h1` section-header shape (inline-styled HTML label, `tag: "header"`,
`standard: true`, `weight: 400`), the hidden shared-field convention, and the document
scaffolding (`formAction`, `stickyContact`, `layout`, `currentThemeId`).

> **Pick the reference form for the element you need, not for its subject.** The obvious
> sibling form here contained **zero** `SINGLE_OPTIONS` fields — its equivalent field was a
> `radio` — so it could not teach the dropdown shape and actively seeded a wrong assumption.
> That shape had to come from a different form that actually used one. Check the reference
> contains your element type before trusting it.

**The other way — drag the real palette element and capture what the builder writes.** When
no existing form uses the element you need, drop it natively onto a scratch canvas, intercept
the save, and read the `fields[]` entry the builder itself produced. This is how the address
group shape was decoded.

> **Do not judge the drop by counting canvas wrappers.** In the address probe the
> `.smooth-dnd-draggable-wrapper` count was unchanged (`before: 51, after: 51`) while the
> saved document went from 51 to **55** fields. The POST body is the truth; the DOM count is
> not.

> ⚠️ **Dragging a CHOICE element creates a REAL account custom field as a side effect.**
> Dragging `Single Dropdown` produced `contact.single_dropdown_46gmp`
> (ID `<id044>`) — an actual account field, not just a form element. Its shape
> is exactly the one you must **not** copy onto an existing field: it carries
> `custom: true`, `category: "choiceElements"`, `typeLabel`, `customEdited`,
> `__pendingClone` (§5.9).
>
> The builder **cleans the field up if the drag is never persisted** (a later audit found
> `orphanCustomFields: []`). But a probe that saves in order to capture the POST body **does**
> persist it, and the orphan then trips the duplicate-name guard on a later save. So: after
> any choice-element probe that saved, check the custom-field catalogue and delete what you
> made. Standard elements such as `Address` create no custom field.

### 3.2 Field shapes that are verified to render

All of these were composed into a 56-field form, saved, and confirmed rendering on the live
public URL (43/43 inputs present).

| Shape | The rule |
|---|---|
| **Existing custom field** | `Id`, `id`, and `tag` **all** hold the custom field ID; `fieldKey` is `contact.<key>`; carry `dataType`, `model`, `parentId` (the field's folder), and `picklistOptions` for choice types. **Omit `custom` and `category`** — see §7. |
| **SINGLE_OPTIONS** | `type: "single_options"` plus `picklistOptions`. Needs **no** `custom`, `category`, or `typeLabel`. Renders as a Vue multiselect combobox, not a `<select>`. |
| **DATE** | `type: "date"` plus `format: "YYYY-MM-DD"` and `separator: "-"`. Both keys are copied from a working live field and render correctly; **whether they are strictly required is unverified** (no negative test was run). Include them. |
| **Address** | Three parts, all required — see below. |

A custom field bound by ID (this exact shape renders):

```json
{ "Id": "<id045>", "id": "<id045>", "tag": "<id045>",
  "fieldKey": "contact.tier_list", "dataType": "SINGLE_OPTIONS", "type": "single_options",
  "model": "contact", "name": "Tier List", "label": "Tier", "customFieldLabel": "Tier List",
  "picklistOptions": ["Tier 1","Tier 2","Tier 3","Out of Area"],
  "parentId": "<id046>", "locationId": "...",
  "hiddenFieldQueryKey": "tier_list", "documentType": "field",
  "required": false, "standard": false, "active": false, "edit": false,
  "allowCustomOption": false, "fieldWidthPercentage": 50, "placeholder": "", "position": 50 }
```

For a `DATE` field, the same shape plus:

```json
{ "type": "date", "dataType": "DATE", "format": "YYYY-MM-DD", "separator": "-" }
```

Two details that bite:

- `parentId` is **the custom field's own folder**, not the form or any form container.
- `hiddenFieldQueryKey` is normally `fieldKey` minus the `contact.` prefix, but it is **not
  always a clean slug** — live values include `"bcr._estimator"` and `"target_start:"`,
  mirroring punctuation from the original field label. Read the real value rather than
  deriving it, because conditional logic references fields by this exact string (§5.4).

#### The ADDRESS GROUP — needs all three pieces

This is the subtle one. **Providing only the group placeholder, or only the nested children,
renders NOTHING.** A working address requires all three of:

1. A minimal **group placeholder** in `fields[]`:

```json
{ "type": "group", "tag": "group_address", "hiddenFieldQueryKey": "group_address",
  "label": "Property Address", "title": "Street Address", "placeholder": "Address",
  "required": false, "standard": true, "active": false }
```

2. The **four children flattened into `fields[]`**, immediately after the group placeholder.
   Each carries `category: "address"`:

```json
{ "category": "address", "tag": "address", "hiddenFieldQueryKey": "address",
  "label": "Street Address", "title": "Address", "placeholder": "Address",
  "type": "text", "typeLabel": "Text", "required": false, "standard": true,
  "hideInLeftSideBar": true }
```

   …then the same for `city`, `state`, and `postal_code` (`title` values `City`, `State`,
   `Postal Code`).

3. A **top-level `formData.form.address`** object carrying the same children:

```json
{ "autoCompleteEnabled": true, "label": "Property Address",
  "placeholder": "Search address", "required": false,
  "children": [ /* the same four child objects */ ] }
```

Only the first child takes `hideInLeftSideBar: true`. This dual representation (flattened in
`fields[]` **and** nested under `formData.form.address`) is what a live form that renders an
address actually stores — read one back with §3.1 if you need to re-confirm it.

---

## 4. Capability table

| # | Question | Answer | Status |
|---|---|---|---|
| 1 | Hidden fields bound to URL query params? | **Yes, natively.** Every field has `hiddenFieldQueryKey`; `?<key>=value` on the public URL prefills it. It is not a special field type and the field need not be hidden. Exposed in field settings as **Query Key**. | **verified** |
| 2 | Can custom JavaScript be attached? | **Yes** — the `Html` palette element (Customized group). Editor is titled "CUSTOM JAVASCRIPT / HTML". Script is stored in the field's `html` property and **executes on the live public form**. | **verified** |
| 3 | Must the JS be ES5? | ES5 (`var`, `function`, IIFE, `setInterval`, `setTimeout`) definitely runs. Whether ES6+ is rejected was **not** tested. Prefer ES5. | **partly unverified** |
| 4 | Does custom JS survive a snapshot? | **Still unverified — and it is the highest-value open question if a form ships in a snapshot.** Cannot be answered by API: `snapshots.json` exposes only `GET /snapshots/`, `POST /snapshots/share/link` and two status routes — **there is no create-snapshot endpoint**, so building one is an agency-UI action. A location-scoped Private Integration Token also gets `401` on `/snapshots/` because snapshots are agency-level. **To test:** create a snapshot of a location containing a form with an `Html` element carrying a `<script>`, load it into a fresh sub-account, then open the new form and check `fields[n].html` still contains the script tag AND that it executes on that location's public form URL. Assume nothing until that round-trip is done: if the script is stripped, any client install silently ships without whatever the script enforced. | **unverified** |
| 5 | Custom value merged into form copy? | **Yes.** `{{custom_values.<key>}}` inside an `Html` element renders the real value on the live form (confirmed: the merge produced the stored sentence, not the raw token). Merging into a *condition* was not tested. | **verified for copy; unverified for conditions** |
| 6 | Genuinely read-only field (visible, submitted, not editable)? | No "read-only" toggle exists; settings offer only **Required** and **Hidden**. Display-only text is achievable with an `Html` element (renders, but is not a submitted value). | **verified (no native option)** |
| 7 | Conditional display driven by a selection, cumulatively? | **Yes** — `Show/Hide Fields` conditions, referencing fields by query key, executed top-down, with an array of targets per rule. 5 cumulative blocks need 4 rules. | **verified** |
| 8 | Prefill a field from the referrer's contact record? | `Sticky Contact` (Settings) auto-fills returning visitors on the **same device+browser** only. That is not contact-link prefill. URL parameters are the reliable mechanism. | **verified** |
| 9 | Does a hidden/conditionally-hidden **required** field block submission? | **No.** A form with 5 required phone fields, of which 3 were conditionally hidden, submitted successfully (HTTP 201). Hidden required fields are excluded from validation. | **verified** |

---

## 5. Recipes

### 5.1 Capture a URL query parameter

Nothing to build. Every field already has `hiddenFieldQueryKey` (defaults from the field key;
editable in field settings as **Query Key**). Then:

```
https://api.leadconnectorhq.com/widget/form/{formId}?first_name=Jane&referral_1_name=Bob
```

Verified: `?first_name=QSPROBE` produced `<input name="first_name" value="QSPROBE">`.

To carry a value the user must not edit, add the field and switch on **Hidden** in its settings.

**Embedding caveat:** an embedded form renders in an iframe and does **not** inherit the parent
page's query string. Prefer the standalone form URL unless you have proven otherwise on a real link.

### 5.2 Map a field to an EXISTING contact custom field

Left palette → **`Add Object Fields`** tab (not `Quick Add`). Groups: `CONTACT`,
`GENERAL INFO`, `ADDITIONAL INFO`. Each row shows the label and `contact.<key>`.

The JSON it produces — reuse this shape to compose fields directly:

```json
{ "fieldKey": "contact.referral_1_name", "model": "contact", "dataType": "TEXT",
  "id": "<id047>", "Id": "<id047>", "tag": "<id047>",
  "name": "Referral 1 Name", "label": "Referral 1 Name", "type": "text",
  "hiddenFieldQueryKey": "referral_1_name", "required": false, "standard": false,
  "fieldWidthPercentage": 100, "active": false, "edit": false, "documentType": "field",
  "locationId": "...", "parentId": "...", "position": 1550, "placeholder": "" }
```

- `tag`, `id`, `Id` all hold the **custom field ID**, not the key.
- `fieldKey` (`contact.<key>`) is the actual binding. `standard: false` marks a custom field.
- Get IDs from the `customFields/search` call above.
- **Never create a new custom field with a similar name.** The form will capture data no
  automation reads and look perfectly fine while being broken.
- ☠️ **Omit `custom` and `category`.** On an existing account field those flags make the
  builder try to re-create it and block every subsequent save. See §5.9 — this is the most
  expensive trap in this document. Choice-type and address shapes are in §3.2.

### 5.3 Attach custom JavaScript

1. Drag **`Html`** (Customized group) onto the canvas. It auto-selects and opens its panel.
2. Click **`Edit HTML`** → CodeMirror opens ("CUSTOM JAVASCRIPT / HTML").
3. Set the code: `document.querySelector('.CodeMirror').CodeMirror.setValue(code)`
4. **`Yes, Save`** (code panel) → top-bar **`Save`** → **`Proceed`** on the `Alert!` modal.
5. Canvas then shows a grey **`Script Added!`** chip instead of the markup.

**Tick "Don't show again" before clicking Proceed.** The `Alert!` modal otherwise reappears on
*every* form-level save for the rest of the project, and each appearance is a chance for the save
to silently stall. Ticking it once suppresses it for that user/browser. Always click Proceed
*conditionally* (the modal may legitimately be absent), and never let a missing checkbox block
the save:

```js
// Tick "Don't show again" first, THEN Proceed. Checkbox is best-effort.
async function dismissScriptAlert(page, frame) {
  const present = await frame.evaluate(() =>
    [...document.querySelectorAll('button')]
      .some(b => (b.innerText||'').trim() === 'Proceed' && b.getBoundingClientRect().width > 0));
  if (!present) return 'absent';
  try {
    // label text -> nearest checkbox control (Naive UI: .n-checkbox-box)
    await clickCoord(page, frame, `[...document.querySelectorAll('*')]
      .filter(e => e.children.length===0 && /Don't show again/i.test(e.innerText||''))[0]`);
  } catch {}
  await clickCoord(page, frame, `[...document.querySelectorAll('button')]
    .find(b => (b.innerText||'').trim()==='Proceed')`);
}
```

Write ES5. The block is stored verbatim in `fields[n].html`.

### 5.4 Conditional show/hide

Entry point: **`button#open-conditional-logic`**, top-LEFT icon bar of the Edit tab (next to `+`).
Types: Redirect to URL · Display custom message · Disqualify lead · **Show/Hide Fields**.

Saved as `formData.form.conditionalLogic` (an **array**, `null` when unused):

```json
[{ "conditions": [ { "selectedField": "first_name",
                     "selectedOperation": "isEqualTo",
                     "inputValue": "TESTVALUE" } ],
   "outcome": { "type": "showHideFields", "value": "referral_1_name", "hideType": "Hide" },
   "conditionalOperation": "then" }]
```

- Fields are referenced by **`hiddenFieldQueryKey`** — not by ID, not by `contact.*` fieldKey.
- `hideType`: `Hide` | `Show`. `conditionalOperation`: `then` (`and` / `or` join extra clauses).
- Rules run **top-down**.
- **Prefer `Show` rules over `Hide` rules for progressive disclosure.** With Hide rules the
  document's default state is "everything visible", so every optional field flashes on first
  paint before the rules evaluate, and correctness depends on a default being applied in time.
  Set those fields `hidden: true` in the document and use `Show` rules to reveal them: the
  default is then correct with no scripting, and the rule count is identical
  (choose 3 → show blocks 1,2,3 rather than hide 4,5).
- **A field named in ANY `Show` rule is hidden while no rule matches.** Being `hidden: false`
  in the document does not save it. So never put your always-visible content in a Show rule:
  leave it out of the conditional logic entirely, and it stays visible.
- **The conditional engine only reacts to TRUSTED events.** A synthetic
  `input.click()` / `dispatchEvent(new Event('change'))` updates nothing — visibility does not
  change. You therefore cannot pre-satisfy a rule from injected JS to reveal something on load.
  Design the default state in the document instead of scripting your way to it.
- **`outcome.value` accepts an ARRAY of query keys** — one rule can target many fields:
  `"value": ["referral_1_name", "phone"]`. **Verified end to end**, not just persisted: on the
  live form the targeted fields flipped to hidden while a control field stayed visible. This
  matters a lot for cumulative show/hide — 5 blocks need ~4 rules, not ~60.
- Operators (UI labels are **Title Case**): `Is Equal To`, `Is Not Equal To`, `Contains`,
  `Does Not Contain`, `Starts With`, `Ends With`, `Is Empty`, `Is Filled`
  → `isEqualTo`, `isNotEqualTo`, `contains`, `doesNotContain`, `startsWith`, `endsWith`,
  `isEmpty`, `isFilled`. Bundles also mention `greaterThan`, `lessThan`, `before`, `after`,
  `between` (likely numeric/date only).

Stable control ids inside the editor:

| Control | id |
|---|---|
| If-field | `#selectedField-0` (index per clause) |
| Operator | `#selectedOperation-0` |
| Value | `input[placeholder="Please Type a value here"]` |
| Show or Hide | `#showHideFieldType` |
| Target field(s) | `#selectedFieldShowHide` (a multi-select) |

### 5.5 Field settings

Click a field → hover toolbar appears on it (**gear / duplicate / trash**). A plain click only
*selects*; the **gear** opens the panel:

`Label` · `Label Alignment` · `Placeholder` · `Short Label` · `Query Key` · `Field Width %` ·
`Required` toggle · `Hidden` toggle · `Advanced Settings`

### 5.6 View submissions

`Submissions` tab in the builder, or Forms list → `Submissions`. Confirm values landed under the
**pre-existing** field keys, not new duplicates — that is the check that catches a form which
"works" but writes where nothing reads.

### 5.7 What a submission actually looks like

```
POST https://backend.leadconnectorhq.com/forms/submit?formId={id}&locationId={loc}   → 201
```

multipart, with a `formData` JSON part plus `locationId`, `formId` and a Cloudflare
`turnstileNonInteractiveToken`. The response returns the created `contactId` and echoes the
stored `formData`.

**Custom field values are keyed by custom field ID, standard/param fields by query key:**

```json
{ "referrer_id_param": "ATTRIB-123",          // plain field -> query key
  "<id047>": "Alice Adams",      // custom field -> field ID
  "<id048>": "+12025550111",     // phone normalised to E.164
  "eventData": { "url_params": { ... } } }    // the full query string is captured here too
```

Two useful details: **phone numbers are normalised to E.164** on submit, and the whole query
string is preserved under `eventData.url_params` independently of any field binding.

Verify in the UI at the builder's **Submissions** tab — it lists one column per field under the
readable field name, which is the quickest way to prove values landed in the *pre-existing*
fields rather than duplicates.

### 5.8 Settings tab (what exists)

On Submit action (Message / Redirect) with rich-text message + styling, Facebook Pixel ID and
events, and toggles: Save progress, Generate submission document, **Sticky Contact**,
Create Conversation on Submission, Enable Timezone, GDPR font.

**There is NO custom JS or CSS panel in Settings.** Code only comes from the `Html` element.

---

## 5.9 ☠️ `custom: true` silently blocks ALL saves

**Read this before composing a single field.** It cost one build over an hour.

When you place an **existing account custom field** on a form, the field object must **NOT**
carry `custom: true` — nor `category`, `customEdited`, or `__pendingClone`. That flag tells
the builder *the form owns this field*, so on **every** save it first fires:

```
POST https://services.leadconnectorhq.com/locations/{locationId}/customFields/
     {"name":"Tier List","fieldKey":"contact.tier_list",...}
→ 400 {"statusCode":400,
       "message":"A custom field already uses this name. Please choose a different name.",
       "meta":{"existingId":"<id049>"},"error":"Bad Request"}
```

Three properties make this brutal to diagnose:

- **The create fires BEFORE the form POST**, from the builder's own in-memory state. Your
  `page.route` handler never sees it, so **intercepting or rewriting the form payload can
  never fix it.**
- **The form POST then never happens at all.** You observe zero network activity and it looks
  exactly like the Save button is inert.
- **It persists in the saved document**, so it re-fires on every subsequent save until the
  element is removed from the canvas.

It also creates a junk duplicate custom field with a **malformed key**. Passing
`fieldKey: "contact.tier_list"` produced **`contact.contacttier_list`** — the dot is stripped
and the `contact.` prefix re-applied — leaving two account fields with the identical name
`Tier List` and only the key to tell them apart.

### The fix

Interception cannot help; you must clear the builder's state through the UI.

1. Open the form in the builder and **select the offending element on the canvas**.
2. Click its **trash** button in the hover toolbar (gear / duplicate / trash — trash is last).
3. **Save.** Confirm `createAttempts` is empty and the form POST returns 2xx.
4. Re-add the field with a clean shape: reference it by `fieldKey` + `id`/`Id`/`tag` and
   **omit `custom` and `category` entirely** (§3.2).

Verified working outcome after the canvas delete:

```json
{ "tierStillOnCanvas": 0,
  "posts": [{ "status": 201 }],
  "createAttempts": [],
  "proof": { "ok": true, "errors": [], "postedOk": 1, "recordedToasts": [] } }
```

Belt and braces — strip the flags before injecting, so a shape copied from a probe cannot
reintroduce them:

```js
fields.forEach(f => {
  delete f.custom; delete f.category; delete f.customEdited; delete f.__pendingClone;
});
```

**This strip is prevention, not a cure.** It cannot rescue a document that is already
poisoned: the create fires from the builder's in-memory state before your handler runs, so
the proven way out of an existing block is the canvas delete above. (Injecting a save with
the offending field simply *omitted* was also attempted as an alternative on the theory that
no create would then be tried; the canvas delete is what was actually confirmed to clear it,
so prefer that. **Unverified** whether the omit-and-save route works on its own.)

---

## 5.10 Reading toasts, and actually confirming a save

### Toasts render INSIDE the builder iframe

The error toast does **not** render on the top-level page, and it **auto-dismisses**. Both
facts independently blind you: querying the page returns "none" while a real error is on
screen, and a post-hoc query after the save misses it even in the right context.

Install a `MutationObserver` on `document.documentElement` in **both** the page and the frame,
plus a 250 ms polling backstop. This exact recorder reads the error verbatim every time:

```js
const TOAST_RECORDER = `(function(){
  if (window.__tw) return 'already';
  window.__tw = []; var seen = {};
  function grab(txt, src){
    txt = (txt||'').trim();
    if (!txt || txt.length > 400) return;
    if (!/already uses this name|already exist|Retry again|Error|failed|duplicate|success|saved/i.test(txt)) return;
    if (seen[txt]) return; seen[txt] = 1;
    window.__tw.push({ src: src, text: txt.replace(/\\s+/g,' ').slice(0,240) });
  }
  function scanAll(src){
    var n = document.querySelectorAll('.n-message, .n-notification, [class*=toast], [class*=message], [class*=notification], [role=alert]');
    for (var i=0;i<n.length;i++) grab(n[i].innerText, src);
  }
  new MutationObserver(function(ms){
    for (var i=0;i<ms.length;i++){
      var a = ms[i].addedNodes;
      for (var j=0;j<a.length;j++){
        if (a[j].nodeType!==1) continue;
        grab(a[j].innerText, 'mutation');
        var d = a[j].querySelectorAll ? a[j].querySelectorAll('*') : [];
        for (var k=0;k<d.length;k++) grab(d[k].innerText, 'mutation-child');
      }
    }
  }).observe(document.documentElement, {childList:true, subtree:true});
  setInterval(function(){ scanAll('poll'); }, 250);
  return 'installed';
})()`;
// install in BOTH: await page.evaluate(TOAST_RECORDER); await frame.evaluate(TOAST_RECORDER);
```

Install it **before** clicking Save. With the page-only version the result was
`TOAST_FROM_PAGE: []` while the frame held
`"Error, Retry again A custom field already uses this name. Please choose a different name."`

### ⚠️ The Save button's disabled state is NOT a save signal

An earlier version of this doc claimed a successful save greys out the Save button. **That is
false on this builder** — it stays enabled even immediately after a clean load with no
changes. Do not use it as a signal in either direction.

**A save is confirmed only by BOTH:**

1. a `POST` to `services.leadconnectorhq.com/forms/` returning **2xx**, and
2. **zero** error toasts captured from the iframe.

```js
export async function assertSaved(page, frame, posts) {
  const recorded = await readToasts(page, frame);
  const errors = recorded.filter(t => /error|already|failed|duplicate|retry/i.test(t.text));
  const posted = Array.isArray(posts) ? posts.filter(p => p.status >= 200 && p.status < 300).length : null;
  return { ok: errors.length === 0 && posted > 0, errors, postedOk: posted, recordedToasts: recorded };
}
```

### The silent no-op: Save fires nothing and reports no error

**Clicking a canvas item only SELECTS it** and often does not dirty the document, so Save is
inert: no POST, no toast, no error — and an injection that reports `injected: null` because
the route handler was never reached. Reliable ways to dirty the document:

- **Drag a palette element onto the canvas** — always dirties it.
- Select a field, open its **gear**, and type into the **Label** input.
- Select a canvas item, then `page.keyboard.press('Space')` + `Backspace`.

Confirm the document is dirty before clicking Save, and treat `injected: null` as a failed
save, not a successful one.

### Panels that cover the Save button

- **A drop opens a wide settings panel on the right that physically covers the top-right Save
  button.** A coordinate click then lands on the panel instead of Save. Press `Escape` /
  close the panel before saving.
- The most reliable Save click is Playwright's own locator, which resolves cross-origin
  iframe coordinates correctly where hand-computed frame-relative coordinates did not:

```js
await frame.locator('button:has-text("Save")').first().click({ timeout: 10000 });
```

- The left **`Form Element`** palette panel should be closed when not needed — it blocks
  screenshots and the user's view of the canvas (`closePalette` helper). **But it must be
  OPEN if you intend to drag from it.**

---

## 5.11 The build pipeline that works

Proven end to end on a 56-field form with 8 conditional rules (43/43 inputs verified on the
live URL). Compose → inject → verify:

```js
// 1. CREATE a blank form (§1.1) and capture its _id.
// 2. COMPOSE the whole document as plain JSON (see §3.2 shapes).
//    Strip custom/category from every mapped field (§5.9).
// 3. INJECT by hijacking the builder's own save.
await page.route('**/services.leadconnectorhq.com/forms/**', async route => {
  if (route.request().method() !== 'POST') return route.continue();
  const doc = JSON.parse(route.request().postData());
  if (!doc || !doc.formData) return route.continue();
  doc.name = formName;
  doc.formData.form.fields = fields;
  doc.formData.form.conditionalLogic = rules;
  doc.formData.form.address = ADDRESS_BLOCK;          // only if the form has an address
  doc.formData.form.layout = 2;                       // two-column desktop (§5.12)
  doc.formData.form.mobileLayout = 1;                 // single-column on phones
  doc.formData.form.formAction = { ...doc.formData.form.formAction,
    actionType: '2', redirect_url: '', thankyouText: THANKYOU };
  await route.continue({ postData: JSON.stringify(doc) });
});
await page.goto(builderUrl); await page.waitForTimeout(14000);
// 4. Install the toast recorder in BOTH page and frame, BEFORE saving (§5.10).
// 5. Close any covering settings panel / palette (§5.10).
// 6. DIRTY the canvas so Save actually fires — a bare click only selects (§5.10).
// 7. Click Save via frame.locator('button:has-text("Save")').
// 8. dismissScriptAlert(): tick "Don't show again", then Proceed (conditionally).
// 9. CONFIRM: POST 2xx AND zero error toasts. Never trust the button state.
// 10. VERIFY: reload, read GET /forms/{id}, diff against what you composed.
// 11. VERIFY AGAIN on the live public URL — a correct document does not mean a
//     correct form. Watch for the false negatives in §8.
```

Helpers for this pipeline (shared Playwright helpers, read-back, custom-field catalogue
capture, submission check) live at `$REPO/form-builder/scripts/`. Those scripts read the
target from `GHL_BUILDER_LOCATION_ID` and resolve its origin from `config.json`. The
compose and build steps are per form: write them for your form from the recipe above.

---

## 5.12 Two-column layout (and: which settings are just document properties)

**Set `formData.form.layout = 2`.** That is the whole change — no UI needed.

| Value | Columns |
|---|---|
| `1` | Single Column |
| `2` | Two Column |
| ? | **`Single Line`** is a third dropdown option; its numeric value was **not** tested — **unverified** |

There is a separate **`formData.form.mobileLayout`** on the same scale. Ship
`layout: 2` with `mobileLayout: 1` so the form does not squeeze on phones. `formData.form.width`
(`800` here) sits in the same UI section.

```js
doc.formData.form.layout = 2;        // Two Column on desktop
doc.formData.form.mobileLayout = 1;  // stay single-column on phones
```

Verified: after saving with `layout: 2`, a `GET` read back `layout: 2, mobileLayout: 1`, and
the live public form rendered **8 rows with two fields side by side** (up from 0).

The equivalent UI path, if you ever need it: the **`Styles & Options`** button (the sliders
icon at the **far right** of the builder toolbar row, roughly `x=1160 y=74` in a 1200px-wide
iframe) → **`Styles`** tab (siblings: `Themes`, `Advanced`) → **`Layout`** section →
**`Columns`** dropdown → Save.

### The general principle: document property, or genuine UI action?

Several things that look like UI-only settings are **plain document properties**, so composing
them into the injected JSON is faster and more reliable than clicking through panels. But not
everything is, and guessing wrong wastes a lot of time. The distinction:

| Category | How to change it | Examples |
|---|---|---|
| **Plain document property** — the UI is just an editor for a value in the JSON | **Inject it.** Set it in the intercepted save; it persists. | `layout`, `mobileLayout`, `width`, `fields[]`, `conditionalLogic`, `formAction` / `thankyouText`, `stickyContact` |
| **Driven by the builder's in-memory state** — the app fires its own request *before* your intercepted save | **UI action required.** Injection cannot fix it. | Removing a field poisoned by `custom: true` (§5.9) |

When unsure, read the document back (§3.1) and look for the property. If the setting is
represented in `formData.form`, inject it. The full `formData.form` key list observed on a
live form:

```
address, backgroundColor, ..., desktopImageLayout, emailNotificationsConfig,
enableSaveExitConfirmation, enableTimezone, fbPixelId, fieldCSS, fieldStyle, fields,
formAction, formLabelVisible, formSubmissionEvent, fullScreenMode,
generateSubmissionDocument, height, imageCornerRadius, imageFieldSpacing, imageFocusPoint,
inputStyleType, isGDPRCompliant, layout, mobileFieldCSS, mobileImageLayout, mobileLayout,
opportunitySettings, pageViewEvent, payment, showImage, showSubmissionInConversationsFeed,
stickyContact, style, submitMessageStyle, surveyImageSettings, width
```

---

## 5.13 `dataType` is immutable: the delete-and-recreate blast radius

A custom field's `dataType` **cannot be changed by update**. Changing a field from `RADIO` to
`CHECKBOX` (or any other type) means **delete and recreate** — and that quietly breaks
several things at once. Worked example from a real build:

| | Before | After |
|---|---|---|
| `dataType` | `RADIO` | `CHECKBOX` |
| `fieldKey` | `contact.dcr_project_type` | `contact.dcr_project_type` — **survived** |
| `id` | `<id050>` | `<id099>` — **changed** |

**Recreate under the IDENTICAL name.** The key is derived from the name, so an identical name
preserves `fieldKey` and every reference *by key* keeps resolving. A different name silently
mints a different key and orphans everything.

Observed consequences, all of which had to be repaired by hand:

- **The field vanished from the form.** Forms embed fields **by id**, so the form's field
  count dropped **56 → 55** with no error anywhere. It had to be re-added with the new id.
- **Its companion field was left orphaned.** The conditional `Show` rule that revealed
  "Project Type Other" pointed at the *removed* controlling field, so the dependent field
  could never be revealed again. **Any rule whose CONTROLLING field is recreated must be
  re-pointed**, not just rules that target it.
- **The opportunity-side mirror had to be recreated too** (`opportunity.dcr_project_type`,
  id `<id051>`) to keep contact and opportunity types matched.
- **Cached field maps went stale.** An on-disk map still held the dead `RADIO` id, so
  anything composed from it silently referenced a nonexistent field. **Re-read the live
  catalogue after any recreate; never trust a cached map.**

### Before you delete, inventory

1. Every **form** embedding the field **by id** (read each form document and grep the id).
2. Every **conditional rule** referencing it — as a **controlling** field *and* as a target.
3. The **opportunity-side mirror**, if the field is paired across models.
4. Any **cached field-map files** on disk.

Then: recreate under the identical name → re-point every reference to the **new id** →
re-read the live catalogue → re-verify on the live form (§8).

## 6. Automation notes

> **`form-builder/scripts/lib.mjs` bypasses every shared-browser protection.** Line 10 calls
> `chromium.connectOverCDP('http://localhost:9222')` directly, with **no CDP lock, no dead-renderer
> preflight, and no tab ownership**. Consequences: it hangs indefinitely if any tab has a dead
> renderer (the failure the preflight exists to prevent), it can race another agent's `switch-agency`,
> and it neither claims nor respects `window.name` ownership markers.
>
> Prefer the workflow engine's `connectGhlClient` when a form task can use it. If you must run
> `form-builder` directly, confirm no other agent is in a live browser phase first. Pre-existing
> gap, flagged not fixed.

The builder is a **cross-origin iframe**. Standard `frame.click()` is unreliable: read
coordinates inside the frame and click from the top-level page.

```js
const box = await frame.evaluate(() => {
  const el = document.querySelector(SEL);
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
await page.mouse.click(box.x, box.y);
```

Find the frame by URL substring `leadgen-apps-form-survey-builder`. Allow ~10-12s after
`goto` before the builder is usable.

### Dragging from the palette

The palette is **SortableJS / Vue-Draggable**, *not* HTML5 drag-and-drop.

```js
await page.mouse.move(src.x, src.y);
await page.mouse.down();
await page.waitForTimeout(200);
await page.mouse.move(src.x + 6, src.y + 6);        // cross the drag threshold
for (let i = 1; i <= 25; i++) {                      // many small steps
  await page.mouse.move(src.x + (dst.x-src.x)*(i/25), src.y + (dst.y-src.y)*(i/25));
  await page.waitForTimeout(40);
}
await page.waitForTimeout(600);                      // hover so the drop registers
await page.mouse.up();
```

Palette item = `.gui__builder-card` (label `.gui__builder-card--label`).
Canvas item = `.smooth-dnd-draggable-wrapper`. Count these before/after to confirm the drop.

---

## 7. Traps (the expensive ones)

| Trap | Symptom | Fix |
|---|---|---|
| **HTML5 drag does nothing** | mousedown → move → mouseup adds no element, no error. Looks like a bad selector. | It is SortableJS. `[draggable="true"]` count is **0**, so there is nothing to feature-detect. Use the stepped pointer drag above. |
| **Palette item off-screen** | `getBoundingClientRect()` returns `y: 1895` on an 878px viewport; drag starts nowhere. | `scrollIntoView({block:'center'})` **then re-read** coordinates. Coordinates read before scrolling are stale. |
| **Drop target below the fold** | Drop silently no-ops; item count unchanged; nothing errors. | Drop on the last item where `top > 90 && bottom < innerHeight - 20`, not simply the last item. |
| **Script save never fires** | Everything looks right on screen; **zero** POST requests. | An `Alert!` modal ("Third-party scripts…") appears on the **form-level** save (not the code-panel save). **Tick "Don't show again", then click `Proceed`** — otherwise it returns on every save and each one can stall. Because it can then be absent, always click Proceed *conditionally*. |
| **Unsaved drop vanishes** | Element added, then gone after reload. | Adding to the canvas is not a save. Always run the full save chain. |
| **Conditional logic never persists** | Condition appears in the list; no network write. | **Two nested modals, each with its own `Save`**: condition editor → conditions list → then top-bar form Save. Miss the middle one and nothing is written. |
| **Wrong dropdown option clicked** | Operator list comes back full of field names. | Naive UI keeps *every* closed select's options mounted. Scope matches to a `.n-base-select-menu` with non-zero width/height. |
| **Option text never matches** | `Is equal to` finds nothing. | Labels are Title Case: `Is Equal To`. |
| **Object-field search finds nothing** | Card is not in the DOM after typing in the search box. | Groups are **collapsed** Naive UI accordions. Expand `.n-collapse-item__header` first (expanded = `--active` modifier). Click the header element itself — clicking the text leaf or its parent row does nothing. |
| **`POST /forms/` 401** | "route not yet supported by the IAM Service". | Wrong path, **not** a scope problem. No token change helps. Use the browser/internal route. |
| **`fetch()` replay blocked** | `TypeError: Failed to fetch`, even inside the builder iframe. | Auth is a `token-id` header you cannot set. Hijack the builder's own request instead. |
| **Duplicate custom fields** | Form saves fine; automations never see the data. | Map via `Add Object Fields` to existing `contact.*` keys. Verify in Submissions. |
| **Field after Submit never renders** | Field exists in the document and in the builder canvas, but is `absent` from the live form DOM (no `[name=...]` element at all). | `fields[]` order is render order, and the `submit` field terminates the form. Keep every input **before** the `submit` field; a dropped element lands at the end by default. |
| **Custom fields are not addressable by name** | `[name="referral_1_phone"]` matches nothing, though the field clearly renders. | On the live form a custom field's `name` is its **custom field ID** (`<id048>`). The readable key is usually in **`data-q`** — but **not always** (§8.1). Prefer `[data-q="<queryKey>"]`, and fall back to `[name="<fieldId>"]` before concluding anything is missing. |
| **☠️ `custom: true` blocks ALL saves, silently** | Save looks inert: zero network activity, no form POST, no visible error. Persists across reloads. | The flag makes the builder try to CREATE the field on every save → `400 "A custom field already uses this name"`, fired **before** the form POST and from its own in-memory state, so `page.route` cannot fix it. **Remove the element from the canvas in the UI, save, then re-add it without `custom`/`category`.** Full detail in §5.9. |
| **Error toast appears to be absent** | Toast check returns "none" while the user is looking at a real red error on screen. | The toast renders **inside the builder iframe**, not on the top-level page, and auto-dismisses. Install a MutationObserver recorder in **both** contexts *before* saving (§5.10). |
| **"Greyed-out Save = saved"** | Save button never greys out, so this signal reads "unsaved" forever — or is trusted and reads a failure as success. | **False on this builder**: the button stays enabled even on a clean load with no changes. Confirm a save only by POST 2xx **and** zero error toasts. |
| **Save fires nothing at all** | No POST, no toast, no error; an injection route handler is never reached (`injected: null`). | Clicking a canvas item only **selects** it and often does not dirty the document. Dirty it by dragging a palette element, or typing in a field's Label via the gear panel (§5.10). |
| **Save click lands on nothing** | Coordinate click on Save appears to do nothing right after adding an element. | Dropping an element opens a wide settings panel on the right that **covers** the Save button. Close it first, and prefer `frame.locator('button:has-text("Save")').click()` over hand-computed coordinates. |
| **Address renders as nothing at all** | No street/city/state/postal inputs on the live form, though the group is in the document and the save returned 201. | The address needs **three** pieces: group placeholder **plus** the four children flattened into `fields[]` **plus** the top-level `formData.form.address`. Group-only and nested-children-only were both verified to render nothing (§3.2). |
| **Palette drag creates a real custom field** | A later save fails with a duplicate-name error naming a field nobody deliberately made. | Dragging a **choice** element (`Single Dropdown`, etc.) creates an actual account custom field as a side effect. It self-cleans if never persisted, but a probe that saves persists it. Audit and delete after choice-element probes (§3.1). |
| **A field silently disappears from a form** | Field count drops by one after someone edits a custom field; no error anywhere. | The field's `dataType` was changed, which requires delete + recreate, which **changes its id**. Forms embed by id. Re-add with the new id, and re-point any conditional rule that used it as a controlling field (§5.13). |
| **Hunting the UI for a setting that is just JSON** | Time lost clicking through Styles panels to set columns, width, etc. | Most look-like-UI settings are plain `formData.form` properties — inject them (`layout: 2` for two-column). Only state the builder holds in memory before your intercepted save needs a real UI action (§5.12). |
| **Injected script gives up and can never retry** | `filled 0 field(s)` on a form that is demonstrably on screen; re-running changes nothing. | The run-once guard was latched at IIFE entry, before success. Latch it only after populating, poll 250 ms × 120, and gate on bulk presence rather than one named field (§8.2). |
| **Choice field renders as a TEXT BOX in the builder** | The live form shows radio options, but the builder canvas shows a plain text input, no options list, no default control. | The underlying **custom field's `dataType` wins**. Options injected into the form document are ignored unless the field itself is a choice type. Fix: make the custom field `RADIO` / `SINGLE_OPTIONS` so it carries its own `picklistOptions`. `dataType` is **immutable**, so this means delete + recreate — read §5.13 first, it breaks more than you expect. |
| **Recreating a custom field breaks references** | Keys survive; IDs do not. | `fieldKey` is derived from the **name** at creation, so recreating under the identical name regenerates the same key and every spec/workflow reference still resolves. But the **id changes**, and forms embed fields **by id** — so the field silently vanishes from every form. Full checklist in §5.13. |
| **RADIO create returns 400** | `"Either options or picklistOptionsImage should exists and should not be empty"`. | On **create**, RADIO takes **`options`** (plain string array), *not* `picklistOptions` — even though it is **returned** as `picklistOptions` on read. (The `ghl-api` docs table has this backwards.) |
| **A radio option cannot be preselected** | No default survives anywhere. | **There is no native default-option setting.** Verified dead ends: the builder-canvas radio is rendered `disabled`; the custom-field editor's per-row checkbox is a bulk **delete** selector ("N rows selected" + Delete, leaves "Update field" disabled); the editor's Live preview radios do become `checked` but never enable "Update field"; `defaultValue` in the form document is ignored; and no default property exists on the field via the API (legacy, `Version: v3`, or search). **Design around it:** keep the first block outside all conditional rules so it is always visible, and make the selector **not required** — a required radio with no default blocks anyone who accepts the default. |
| **Radios never report checked** | `input.checked` stays `false` even after a real trusted click, so "is an option selected?" always answers no. | Seen while the field was the wrong dataType (options rendered with **no `name` attribute**, Vue owning state). With a true `RADIO` custom field, `checked` behaves normally. If it does not, judge selection by its **side effect** (which fields became visible). |
| **Stale answers on a "fresh" load** | A newly opened form already has options selected; tests pass or fail based on a previous run. | `Save progress for forms` (Settings) restores prior answers behind a **"Submission in progress — would you like to continue?"** modal. Click **`Start over`** to test clean (or `Continue` to resume deliberately). Always handle this before asserting anything. **The modal also disguises itself as a JS bug: see §8.3.** |
| **`TypeError: Illegal invocation` from a `page.evaluate()` value-setter** | Looks like a realm / prototype / cross-context native-setter bug, so you go rewrite the setter. The page loaded fine and the full field count is present, so the form reads as ready. | **The setter is fine; the resume modal overlay is covering the field.** Field count stays full while the overlay is up, so a presence check passes and interaction still fails. Detect `/Submission in progress|unfinished submission/i` in the `/widget/form/` frame and click `Start over` first (§8.3). |
| **RADIO field reports `NO_ELEMENT`** | `[name="<contactFieldId>"]` matches nothing for a radio that clearly renders, while `TEXT` and `CHECKBOX` resolve by `name` fine. Looks like a flaky selector or a missing field. | RADIO is **not** addressable by `name`; the correlation is systematic (14 of 14 failures on one run were exactly the RADIO rows). The field ID lives in the **`id`** attribute instead. Use `input[type=radio][data-q="<fieldKey>"][value="<Option>"]` with `{force: true}` (§8.5). |
| **Every `data-q` lookup misses, built from a field-ID map** | Selectors assembled programmatically from a field-ID-keyed map match nothing, though hand-written ones work. | **`data-q` carries the fieldKey, not the contact field ID** (0 of 14 IDs appeared in any `data-q` on the probed form). Build a field ID to fieldKey mapping before generating selectors (§8.5). |
| **Conditional dependents look "missing" in pass two** | Driver field appears set, but its dependents are absent from the DOM, so you go hunting for a bad selector. | The driver was set with a **synthetic** `el.click()` / `dispatchEvent`; the conditional engine only responds to **trusted** events, so no reveal fired. The fault is in pass one, not the selector. Use a real Playwright click on drivers (§8.4). |
| **Backtick inside injected code breaks the build** | Composer throws `Unexpected identifier`, pointing at code that looks fine. | Injected HTML/JS usually lives in a JS **template literal**. A stray backtick — even inside a `//` comment — terminates the string early. Keep backticks out of injected-code blocks entirely. |
| **Date field stays empty, or submits the wrong date** | Typing into the date field "works": the click lands, the keystrokes land, nothing throws, but `inputValue()` is `""` and the payload carries an empty value or the picker's own default. A test can pass while the intended date was never on screen. | It is a `vue-date-pick` widget, not a text or native date input, so **typed input is ignored** (`fill`, `pressSequentially`, select-all + retype all leave it empty). A day-cell click alone is **not committed** either: the footer's `button.vdpActionButton--primary` (**Confirm**) is required. Select month and year via the real `<select>` elements, click the day by `aria-label`, click Confirm, then **assert `inputValue()`** (§8.6). |

---

## 8. How to test a form end to end

A form that saves is not a form that works.

1. **Read the document back** (`GET /forms/{id}`) and diff against what you intended.
2. **Open the public URL with real query parameters** —
   `https://api.leadconnectorhq.com/widget/form/{formId}?ref=abc123&fname=Jane`.
   Opening the form directly and typing into it does **not** test parameter capture: it passes
   while the mechanism is entirely broken, because there is no parameter to lose.
3. **Check custom JS actually ran** on the live form, not in the builder preview:
   `page.on('console', ...)` plus a DOM marker your script sets.
4. **Submit and inspect the submission** — confirm values landed under the pre-existing field
   keys, not new duplicates.
5. **Test the negative cases**: conditionally hidden required fields must not block submission;
   validation must reject what it is supposed to reject; and an *absent* parameter renders
   nothing rather than an empty label.
6. **Start over, every time.** If `Save progress` is on, a repeat visit restores the previous
   run's answers behind a modal. Click `Start over` or your "clean" test is not clean. The
   modal does not announce itself as a blocker: the form renders and the field count is full
   behind it, so automation reads "ready" and then fails with a misleading `TypeError`. Read
   §8.3 before debugging any interaction failure, and §8.4 for the correct open-a-form order.

### 8.1 ⚠️ Four false negatives that produce bogus "field missing" reports

A naive verifier reported fields missing and types wrong across **~6 rebuild attempts** while
the form was rendering perfectly the whole time. Every one of these is a flaw in the
detection method, not a form defect. Rule out all four before reporting any defect.

**1. Not every field has `data-q`.** Some expose nothing readable, and the input's `name` is
the raw custom field ID. Observed on a real build: of 43 inputs, every `text`, `email`,
`radio`, `checkbox`, `large_text`, and `date` field carried `data-q` — and the one
`single_options` field carried **none**, findable only as
`[name="<id045>"]`:

```json
{ "key": "tier_list", "type": "single_options", "present": true,
  "byQ": 0, "byId": 1, "byName": 0 }
```

> **Before declaring a field missing, check ALL THREE:** `[data-q="<key>"]`,
> `[name="<fieldId>"]`, and a raw `document.body.innerHTML` search for the key and the ID.

*(n=1 for `single_options`, so "SINGLE_OPTIONS never emits `data-q`" is a reasonable working
assumption but not proven; the three-way check makes it moot either way.)*

**2. Choice and date widgets are Vue components that report `type="text"`.** Never judge a
field's type by its `type` attribute — judge by classes and role:

| Field | How it actually renders |
|---|---|
| `single_options` | `input.multiselect__input`, `placeholder="Select an option"`, inside `div.multiselect.multi_select_form` with `role="combobox"`, `aria-expanded`, and `aria-owns="listbox-<fieldId>"` |
| `date` | `input.vdpInput.date-picker-custom-style`, `placeholder="YYYY - MM - DD"` (note the spaces around the dashes), inside `div.vdpWithInput.vdpComponent` |

**3. Fields hidden by a `Show` rule sit in a container with class `d-none` at load — and
that is CORRECT.** Verify they **exist**, not that they are visible. Seeing exactly the
expected set in `d-none` is positive confirmation the conditional logic saved properly: one
build's sweep returned exactly 9, being the 8 `Show`-rule targets plus one deliberately
hidden field. DOM shape: `input.form-control` → `div.flex-col` → `div.form-builder--item` →
`div.d-none.field-container`.

**4. Multiselect options come back DOUBLED.** Querying `.multiselect__option, li` matches
both the `li` and its inner `.multiselect__option` span:

```json
["Tier 1","Tier 1","Tier 2","Tier 2","Tier 3","Tier 3","Out of Area","Out of Area",
 "No elements found. Consider changing the search query.","No elements found. …",
 "List is empty.","List is empty."]
```

Dedupe before comparing, and strip the empty-state strings (`No elements found…`,
`List is empty.`) — a naive count reads **12** for **4** real options. Also note options do
not exist in the DOM until the control is opened: a closed multiselect returns `null`.

### 8.2 Injected test scripts: the run-once-guard race

A custom JS block that polls for the form and gives up on the first negative tick will
**latch its own run-once guard and can never retry**. The buggy shape:

```js
(function () {
  if (window.__ranGuard) { return; }
  window.__ranGuard = true;        // <-- latched BEFORE any success
```

Symptom: `filled 0 field(s) - form never rendered`, on a form that was already there. Timing
measurement showed the form mounting 81 fields in **~5 ms** — the script gave up on a form
that had rendered long before. *"Not yet" and "never" are different states.*

The fix, in four parts:

- **Two flags.** A `Started` flag stops two concurrent pollers from the same page load; the
  `Ran` guard is latched **only after something was actually populated**, and `Started` is
  released on failure so a retry is still possible:

```js
if (filled.length) { window.__ranGuard = true; }
else { window.__startedGuard = false; }
```

- **Poll patiently:** every 250 ms for 30 s (`MAX_TRIES = 120`).
- **Gate readiness on a condition true only when the form is genuinely usable** — bulk
  presence plus an anchor that is last in DOM order (`count > 20 && anchor`). Do **not** gate
  on a single named field: it can be removed from the form, which makes the poll
  unsatisfiable forever.
- **Log diagnostic numbers on the give-up path**, not a bare message: tick count, elapsed
  seconds, how many `[data-q]` elements were seen versus needed, and whether the anchor was
  present. A bare "form never rendered" is undiagnosable without a code read.

### 8.3 ⚠️ The resume modal is a false "form is ready"

*Extends §7 "Stale answers on a 'fresh' load" with the diagnostic half. That row tells you the
modal exists; this one tells you how it disguises itself, which is why it still costs an hour.*

Reopening a public form widget URL for a contact or opportunity that has an unfinished saved
submission renders the form **and** puts a modal overlay on top of it:

```
Title:   Submission in progress
Body:    You have an unfinished submission. Would you like to continue?
Buttons: [Start over]  [Continue]
```

**Why this is a false negative and not an obvious error.** The page loads normally. Nothing
throws on navigation. `document.querySelectorAll('input,textarea,select')` still returns the
**full** field count (88 on the verified run), so a readiness check built on "are the fields
there?" reports ready. The fields are simply behind the overlay, so every interaction fails
instead, and it fails in a shape that points at the wrong suspect:

> **Misleading symptom: `TypeError: Illegal invocation`, thrown from inside a
> `page.evaluate()` value-setter.** That reads like a realm or prototype bug (wrong `this`,
> a cross-context native setter, a Playwright/JS-engine problem), so the natural response is
> to go rewrite the setter. The setter is fine. An overlay is covering the field. **Check for
> the resume modal before debugging any `Illegal invocation` on a form widget page.**

**Detect it inside the form frame** (not necessarily the main frame):

```js
/Submission in progress|unfinished submission/i.test(document.body.innerText)
```

**Pick the right frame.** The form widget lives in its own frame, and the page also carries a
separate Turnstile challenge iframe that contains **0** inputs. Select by URL substring rather
than assuming the main frame:

```js
const f = page.frames().find(fr => fr.url().includes('/widget/form/')) || page.mainFrame();
```

**Dismiss by button text.** The two buttons are not interchangeable:

| Button | What it does | When to use it |
|---|---|---|
| **`Start over`** | Discards the saved partial submission; gives a clean empty form. | **Default for any deterministic test run.** |
| **`Continue`** | Resumes the prior partial answers. | Only when resuming is the thing you are deliberately testing. **It silently contaminates a test with leftover values from an earlier attempt: a field you never set can arrive already populated, and the run then passes or fails on data you did not control.** |

Verified dismissal:

```js
const f = page.frames().find(fr => fr.url().includes('/widget/form/')) || page.mainFrame();
await f.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /start over/i.test(x.innerText));
  if (b) b.click();
});
await page.waitForTimeout(6000);
```

Verified before and after on the same page: with the overlay up, interaction fails while all
88 inputs are still present in the DOM; after `Start over`, **76 of 88** inputs are visible and
interactable. (The remainder are conditionally hidden, which is expected and correct; see §8.1
note 3.)

Also useful on this form: a **"Show empty fields (N)"** button, which reveals unfilled fields
so you can enumerate and inspect them.

### 8.4 Reopening a form for automation: the correct order

Run these in order. Steps 3 and 5 are the ones that get skipped, and each one fails silently.

1. **Navigate** to the widget URL.
2. **Select the `/widget/form/` frame** by URL substring. Do not assume the main frame, and do
   not grab the Turnstile challenge iframe (it has 0 inputs).
3. **Detect and dismiss the resume modal**, preferring `Start over` (§8.3). Do this *before*
   any readiness assertion: the field count is full while the overlay is still up, so a
   readiness check passes and every later interaction fails.
4. **Then** enumerate and interact with fields.
5. **On a conditional form, fill in two passes.** Set the fields that **drive** conditional
   reveals first, wait for the reveal, then set the revealed dependents. A single-pass fill
   silently misses conditionally hidden fields because they are **not in the DOM yet** at the
   time the pass runs. This is a stronger condition than §8.1 note 3: that note covers fields
   that exist but sit in a `d-none` container, whereas an unrevealed dependent may have no
   element to match at all.

   > **⚠️ The driver fields specifically must be set with REAL Playwright clicks.** The
   > conditional engine only responds to trusted events, so an in-page `el.click()` or
   > `dispatchEvent` on a driver **silently fails to reveal its dependents**: the value may even
   > appear set, but no reveal fires. This compounds into a misdiagnosis, because pass two then
   > finds the dependents absent and the obvious conclusion is "my selector is wrong" or "the
   > field is missing", when the real fault is back in pass one. **If dependents look missing,
   > verify the driver was clicked for real before touching the selector.** (Verified the hard
   > way on a live run.) See also the trusted-events note under the Playwright table below.

### 8.5 RADIO: query by `data-q`, never by `[name="<fieldId>"]`

Most inputs on a form widget **are** addressable by the contact custom field ID used as the
`name` attribute. Verified working that way:

| Type | Shape |
|---|---|
| `TEXT` / `LARGE_TEXT` | One element, `[name="<contactFieldId>"]`. |
| `CHECKBOX` | A **group** of elements sharing `name="<contactFieldId>"`, each with a distinct `.value`, and ids shaped `<OptionLabel>_<fieldId>_<index>_<formIdPrefix>` (e.g. `Interior_<id099>_0_KOzlA7ZN`). Select by clicking the element whose `.value` matches the desired option label. |

**RADIO is the exception.** Querying `[name="<contactFieldId>"]` returned **zero** elements for
every RADIO field. On the verified run, 14 of 34 planned fields failed with `NO_ELEMENT`, and
all 14 were exactly the RADIO-typed rows. A perfect correlation across 14 fields is a
systematic rendering difference, not a flaky selector, so **do not retry `[name=...]` for a
RADIO and do not conclude the field is missing.**

**The crux: the field ID is there, it is just not in `name`.** A RADIO does carry its contact
field ID, in the **`id`** attribute, in the same family of shape already documented for
CHECKBOX: `<Option>_<fieldId>_<index>_<formId>`. So the rule is not "RADIO hides its field ID",
it is **"RADIO exposes the field ID via `id`, and is queried via `data-q`"**. Verbatim element
from the live probe:

```html
<input id="Full Home_<id100>_0_<id043>" value="Full Home"
       type="radio" data-q="dcr_areas_included" data-required="false">
```

**Both selectors, in preference order:**

```js
input[type=radio][data-q="<fieldKey>"][value="<Option>"]   // preferred
input[type=radio][id^="<Option>_<fieldId>"]                // fallback, evidence-backed
```

**⚠️ `data-q` holds the fieldKey, NOT the field ID.** In the element above, `data-q` is
`dcr_areas_included` (the fieldKey) while the contact field ID `<id100>` appears
only inside `id`. On the probed form, **0 of 14** contact field IDs appeared inside any `data-q`
value, which is precisely why an ID-based match finds nothing. **If you are driving a form from
a field-ID-keyed map, you need a field ID to fieldKey mapping first**, or every `data-q` lookup
you build from that map will miss.

**Verified (live form `<id043>`, 2026-08-21, read-only DOM probe).** 36 radio
inputs on the form, **36 of 36** carrying `data-q`, across **14** distinct `data-q` values
matching exactly the 14 RADIO rows in the field map. Zero exceptions on that form.

**Remaining caveat.** `data-q` is confirmed universal for RADIO **on the probed form**, not
proven universal platform-wide: §8.1 note 1 found a `single_options` field carrying none, so
that observation still stands for other types. If you ever meet a RADIO without `data-q`, reach
for the `id`-prefix fallback above first, then probe rather than guess, and **verify the shape
you discover before trusting it**:

- Dump `outerHTML` of the container for a known RADIO field and read the actual attributes.
- Check whether the radios render as styled `div` / `span` / `label` widgets wrapping a hidden
  underlying input.
- Check for a `role="radio"` / `aria-checked` pattern.

Related: judge selection state by its **side effect** (which fields became visible), not by
`input.checked`, which can stay `false` (§7, "Radios never report checked").

### 8.6 DATE fields are a Vue datepicker and need a Confirm click

A `date` field on a form widget is **not** a native date input and **not** a plain text input.
It renders as a text input owned by a `vue-date-pick`-style component:

```html
<input type="text" class="vdpInput date-picker-custom-style"
       placeholder="YYYY - MM - DD" data-q="<fieldKey>">
```

**Every typed-input approach silently fails.** All three of these left `inputValue()` as the
empty string `""`, with nothing thrown:

- `pressSequentially('2026-11-05')`
- `fill('2026-11-05')`
- select-all, `Backspace`, then `fill(...)`

**The failure mode is the dangerous part**, and it is exactly the class of false negative §8.1
warns about, only inverted: here it manufactures a false **pass**. The click lands, the
keystrokes land, the locator resolves, no error is raised, and the field simply stays empty. On
submit the platform then sends either an empty value or the picker's own default date, so a test
can report success while the intended value was never on screen. On the verified run this put
two wrong dates into the submitted payload (`Target Start: = 2026-08-23`,
`Target Completion = 2026-08-28`) instead of the intended `2026-11-05` / `2026-12-19`, and it
read as a harness quirk rather than a data bug.

**Clicking the day cell is not enough either.** Clicking `button.vdpCellButton` on its own still
leaves the input empty. The picker has a footer with two buttons, and the selection is only
committed by the primary one:

| Selector | Button |
|---|---|
| `button.vdpActionButton.vdpActionButton--secondary` | Cancel |
| `button.vdpActionButton.vdpActionButton--primary` | **Confirm** (required) |

**The working sequence.** `fr` is the `/widget/form/` frame (select it and clear the resume
modal first, §8.3, §8.4):

```js
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const [Y,M,D] = '2026-11-05'.split('-').map(Number);
const el = fr.locator(`[data-q="${fieldKey}"]`).first();
await el.click({force:true});
await page.waitForTimeout(1300);
// month/year are real <select> elements, not arrow buttons
await fr.locator('select[aria-label="Month"]').first().selectOption(String(M-1));  // 0-indexed
await fr.locator('select[aria-label="Year"]').first().selectOption(String(Y));
// day cells carry an aria-label of the form "Nov 5, 2026" (no zero padding)
await fr.locator(`button.vdpCellButton[aria-label="${MONTHS[M-1]} ${D}, ${Y}"]`).first().click({force:true});
await fr.locator('button.vdpActionButton--primary', {hasText:/confirm/i}).first().click({force:true});
// THEN verify, never assume
const got = await el.inputValue();   // "2026-11-05"
```

After Confirm, `inputValue()` returns `"2026-11-05"`. Before Confirm it returns `""`.

Details worth recording, because each one cost time:

- The month `<select>` (`aria-label="Month"`) is **0-indexed**: value `"10"` is November.
- The year `<select>` (`aria-label="Year"`) spans **1850 to 2150**, so navigating by the
  next-month arrow is hopeless. Use the selects.
- The day-cell `aria-label` is **not zero-padded**: `"Nov 5, 2026"`, not `"Nov 05, 2026"`.
- Cells outside the current month carry class `outOfRange` alongside `selectable`. Prefer the
  `aria-label` match over positional or text matching.
- **Always assert `inputValue()` equals the intended date after Confirm**, and fail loudly on a
  mismatch, rather than trusting that the clicks worked. That assertion is the whole difference
  between a silent wrong-value bug and a caught error.

**Payload gotcha when you check the result.** The submitted payload on this form carried
near-duplicate date keys differing only by trailing punctuation or whitespace: `Target Start`
versus `Target Start:` (trailing colon), and `Target Completion` versus `Target Completion`
with a **trailing space**. Match payload date keys exactly, including any trailing colon or
space; a loose match will read the wrong one of the pair.

**Verified (live form `<id043>`, 2026-08-21).**

### Driving the live form from Playwright

| Need | How |
|---|---|
| **Before any of the below** | Select the `/widget/form/` frame, then dismiss the resume modal (`Start over`). A full field count does **not** mean the form is interactable (§8.3, §8.4) |
| Any field | Try `[data-q="<queryKey>"]` first, then `[name="<fieldId>"]` — `data-q` is **not** universal (§8.1) and custom fields use their ID as `name`. Exception: `[name=<fieldId>]` **never** resolves a RADIO (§8.5) |
| Radio option | `input[type=radio][data-q="<fieldKey>"][value="<Option>"]`, clicked with `{force: true}`. Fallback `input[type=radio][id^="<Option>_<fieldId>"]`. Not reachable by `[name="<fieldId>"]` at all, and `data-q` is the **fieldKey**, not the field ID (§8.5) |
| Conditional **driver** field | A **real** Playwright click, never `el.click()` / `dispatchEvent`. A synthetic click fires no reveal, and the dependents then look "missing" in pass two (§8.4) |
| Checkbox option | Group of elements sharing `name="<fieldId>"`, each with a distinct `.value`; click the one whose `.value` matches the option label. Ids follow `<OptionLabel>_<fieldId>_<index>_<formIdPrefix>` (§8.5) |
| Conditional dependents | Two-pass fill: set the driving fields, wait for the reveal, then set the dependents. Unrevealed dependents are not in the DOM yet (§8.4) |
| Dropdown (`single_options`) | Not a native `<select>`. The `[name=<fieldId>]` input is only the **searchbox** — setting its value fills the search box and selects nothing. Open the host `.multiselect` (`mousedown`), wait for options to mount (they may live in a detached listbox found via the host's `aria-owns`), then click the matching `.multiselect__option`. |
| Date field | Not a text input and not a native date input: it is a `vue-date-pick` widget, and typed input is silently ignored. Click `[data-q="<fieldKey>"]` to open the picker, `selectOption` on `select[aria-label="Month"]` (**0-indexed**) and `select[aria-label="Year"]`, click `button.vdpCellButton[aria-label="<Mon> <D>, <YYYY>"]` (no zero padding), then click `button.vdpActionButton--primary` (**Confirm**, required to commit). **Then assert `inputValue()`** matches the intended date, otherwise a wrong or empty date submits silently (§8.6) |
| Submit | `button[type=submit], button.button-element` |
| Selection state | The **side effect** (what became visible). `input.checked` is always false. |

Use **real** Playwright clicks. Synthetic `el.click()` / `dispatchEvent` will not drive
conditional logic, because the engine only responds to trusted events.
