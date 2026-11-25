# Workflow type: Custom-object-based workflows

**Mapped live 2026-08-10** on a lab location
(a test workflow). Fixture object `ZZZ Spike Referral`
(`custom_objects.zzz_spike_referrals`, id `00000000000000000000000a`), Draft workflow
`00000000-0000-4000-8000-000000000170`. Never published.

This is a THIRD workflow enrollment type alongside Contact-based and Company-based. The
Phase 1 corpus captured its *existence* (the `add_associated_records_to_workflow` fixture
`ZZZ-SPIKE-b3-associated-destination`) but never mapped its trigger/action surface. This
file fills that gap.

---

## 1. Creation, and the prerequisite that hides it

`Create workflow` on the workflows list offers:

- Start from Scratch
- Select from Template
- **`<Object plural> based workflow`** — one entry PER custom object
- Company based workflow

**The custom-object entry does not exist until at least one custom object exists in the
sub-account.** Verified both directions: before creating the object the picker showed only
three options; immediately after creating it, `Zzz spike referrals based workflow` appeared.
If you go looking for this option in a fresh sub-account and conclude the feature is
missing, that is the trap.

The created workflow's name is prefixed with the object in parentheses, e.g.
`(Zzz spike referrals) New Workflow : 1786402660022`. That prefix is how you tell the
enrollment type from the list.

Route is the normal singular builder route: `/v2/location/{loc}/automation/workflow/{id}`.

---

## 2. Triggers (COMPLETE list, captured live)

The trigger picker is drastically reduced versus a contact workflow. Full contents:

| Category | Triggers |
|---|---|
| **Custom object** | `<Object singular> Created`, `<Object singular> Changed` |
| Events | Inbound webhook |
| Membership | Client portal file uploaded |
| Communities | Group joining request rejected; Member registered for group event; Group comment created; Group post created |
| Certificates | Certificates issued |
| Communication | TikTok - comment(s) on a video; Conversations SLA |
| Events management | Event checked in; Event registration |
| Google ads | Google lead form submitted |
| Date reminders | Custom date reminder |

**Absent entirely:** every contact trigger (Contact Created/Changed, Contact Tag, Form
Submitted, Birthday, Customer Replied, Appointment, Opportunity/Pipeline Stage, Invoice,
Order, Payment, Trigger Link, Email Events, Call Details…). There are ~14 triggers here
versus 92 in the contact context.

### Trigger filters CAN read the record's own fields

`<Object> Changed` → **Add filters** → the field dropdown renders a **`Fields`** group
listing the object's own custom fields (fixture showed `Referral Name`). So you can gate
enrollment on a record field value.

Trigger panel keeps the usual **"Save trigger"** button (bottom-right) — the trigger
equivalent of the two-save rule still applies.

---

## 3. Actions (COMPLETE palette, captured live)

Nine categories only:

**Custom objects**
- `Create <Object> or Associated Record`
- `Update <Object> or Associated Record`
- `Clear fields of <Object> or Associated Record`
- **`Find object record` (BETA)**
- `Add to notes`

**Send data:** Custom webhook · Google Sheets

**Internal:** If / else · Wait · Update custom value · Go to · Date/time formatter ·
Number formatter · **Math operation** · Add to workflow · Remove from workflow ·
Array formatter · Drip · Text formatter · Custom code

**External AI models:** GPT powered by OpenAI

**Agent Studio:** Invoke agent in agent studio

**AI Actions:** AI translate · AI summarize · AI intent detection · AI decision maker ·
AI extract data (BETA)

**Associations:** Add associated records to workflow · Remove associated records from workflow

**Conversation AI** (header present, no items enumerated) · **Voice AI:** Voice AI outbound call (BETA)

### What is NOT available — the load-bearing limitation

**There is no Communication category. No Send Email, no Send SMS, no Manual Action, no
internal notification, no Add Task, no contact-field actions, no opportunity actions,
no tag actions.**

A custom-object workflow **cannot message anybody and cannot create a task.** This is the
single most important constraint of the type. Record-scoped logic and outreach cannot live
in the same workflow.

---

## 4. If/else CAN read the enrolled record's fields ✅

**This is the headline finding and it contradicts what the contact-side catalog implies.**

If/else panel description: *"Fork the `<Object singular>` journey through this workflow
based on conditions."*

Condition field catalog ("All fields"), captured live:

- **`<Object singular>`** (expandable) → **the object's own fields**. Fixture drilled in and
  showed `Referral Name` and `Referral Value`. Breadcrumb reads `All fields > ZZZ Spike Referral`.
- `Workflow <Object singular>`
- `Date/Time`
- `Workflow trigger`
- `Custom values`
- (greyed until a producing action exists upstream) Inbound webhook trigger, Google Sheets
  lookup, Date/time formatter…

So: **inside a custom-object workflow, conditions on the record's own field values are
fully native.** In a *contact* workflow they remain impossible — the contact-side if/else
catalog has no custom-object category. The capability is real but context-bound.

---

## 5. Math operation CAN read/write custom object fields ✅

Also contradicts the contact-context finding. In a custom-object workflow:

- `SELECT FIELD` tree shows groups **`Date Fields`** and **`<Object singular>`**. Expanding
  the object group lists its numeric/monetary fields — fixture showed the `MONETORY` field
  `Referral Value` (screenshot-verified).
- Selecting it reveals `OPERATIONS`: `Operator` (default **Add**) + `Value`, an
  **`Add operator`** button for chaining, and an **optional** SAVE RESULT TO FIELD.
- Leaving the output blank writes back to the source field.

**Therefore native read-then-add accumulation on a custom object field IS possible**, so
long as the arithmetic happens in a custom-object-enrolled workflow. In a *contact*
workflow, Math operation's picker only offers contact fields and custom values, so the same
accumulation is NOT possible there.

Standard Math operation constraints still apply (from the contact-side capture): source and
destination data types must match, no compound expressions/PEMDAS (chain actions instead),
negative monetary results disallowed.

---

## 6. The two-context architecture (how to actually design with this)

The practical shape that falls out of the above:

| Need | Where it must live |
|---|---|
| Branch on a record's field value | **Custom-object workflow** (native if/else) |
| Accumulate a numeric/monetary record field | **Custom-object workflow** (native Math operation) |
| Send SMS / email / notification, create a task | **Contact workflow** (the object context has none) |
| Create/update a record from a contact's journey | **Contact workflow** (`create_custom_object` / `update_custom_object`) |

**Bridge between them:** `Add associated records to workflow`
(`add_associated_records_to_workflow`), which exists in BOTH contexts. Its WORKFLOW dropdown
only lists workflows whose enrollment type matches the selected associated object, so a
contact workflow can hand off to a record workflow and vice versa. Docs confirm availability
in Contact-, Company- and Custom-Object-based workflows.

So record-scoped computation is a hand-off, not an inline step: contact workflow → enroll
the associated record into a record workflow → record workflow branches/accumulates → (if
outreach is needed) enroll the associated contact back into a contact workflow.

---

## 7. Field types available on a custom object (UI-confirmed)

Captured from the Create custom field panel: **Single line, Multi line, Text box list,
Phone, Monetary, Dropdown (single), Dropdown (multiple), Radio select, Checkbox**, plus
Date (a `Date Fields` group appears in pickers). Matches the API enum `TEXT, LARGE_TEXT,
NUMERICAL, PHONE, MONETORY, CHECKBOX, SINGLE_OPTIONS, MULTIPLE_OPTIONS, DATE, TEXTBOX_LIST,
FILE_UPLOAD, RADIO`.

**There is no RELATION field type.** Record-to-record links are Associations (a separate
first-class construct), not a field on the object. The object creation dialog's own copy
says "Build with your own fields and associations", treating them as distinct.

### Field-creation gotchas (cost real time)

- **Folder name is REQUIRED** (`*`). The `Create custom field` button stays disabled until a
  folder is chosen, with no inline error explaining why. A default folder
  `<Object singular> Info` is auto-created with the object; pick it.
- `playwright-cli fill` on the name input **doubles the text** (`Referral ValueReferral
  Value`) because the Vue input already holds a value — the key preview shows the doubling
  (`referral_valuereferral_value`). Re-`fill` to correct it, and check the generated Key.
- **"Mark Primary Field as Unique (0 of 10)"** exists on the primary display field — a
  native uniqueness constraint, max 10 unique fields.

---

## 8. Snapshot-relevant constraints (unchanged, still load-bearing)

- **Max 3 custom objects per snapshot.** If the destination sub-account would exceed three
  after import, **no custom object is created at all** — silent, all-or-nothing. Confirmed
  in HighLevel's changelog. Location `<id041>` is already at exactly 3, so this
  is not hypothetical.
- What a snapshot **push** does to *existing custom object records* is still **undocumented
  and unverified**. HighLevel documents asset-level overwrite ("Existing assets (e.g.,
  workflows, campaigns) will be overwritten") and that Custom Values are never edited or
  deleted, but says nothing about record data. **Must be tested live**, including whether
  Associations survive a re-push (records can survive while relations are orphaned).

---

## 9. Automation notes for driving this UI

- The builder iframe is `client-app-automation-workflows.leadconnectorhq.com`. Field pickers
  are **portalled** and collapse on any re-render — a `snapshot` between opening and reading
  closes them. Do open-then-read in ONE `run-code` call, or screenshot instead.
- Picker groups are collapsed by default with a `▸` arrow; clicking the group **label** may
  not expand it — click the **arrow** (x ≈ label_x − 76). Coordinate clicks via
  `page.mouse.click` are the reliable path (same rule as the rest of this builder).
- `setTimeout` is not defined inside `run-code`; use `page.waitForTimeout`.
- Screenshots were decisive here — the DOM text scrape returned only group headers while the
  screenshot plainly showed the expanded leaves.
