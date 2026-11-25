# Action: Send Email

- **UI name:** Send email · **Category:** Communication · **Priority:** CORE
- **JSON `type`:** `email`
- **Screenshot:** `screenshots/038-send-email-panel.png`, saved `040-send-email-saved.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path (`attributes.*`) | Notes |
|---|---|---|---|---|---|---|
| Action Name * | text | — | "Email" | **yes** (starred) | `name` (node field) | |
| From Name | text (+ merge-field tag) | free text / merge fields | empty → Default Values | no | `attributes.from_name` | "If From Name/Email empty → sent using Default Values" |
| From Email | text (+ merge-field tag) | free text / merge fields | empty → Default Values | no | `attributes.from_email` | |
| Cc / Bcc | buttons → text inputs | emails | hidden until clicked | no | `attributes.cc` / `attributes.bcc` (when set) | |
| Subject * | text (+ merge-field tag) | free text / merge fields | empty | **yes** (starred) | `attributes.subject` | |
| Pre-Header (Preview Text) | text (+ merge-field tag) | free text | empty | no | `attributes.preHeader` | preview text |
| **Create email** | **radio (3 modes)** | **"Quick compose" / "From smart builder" / "Select existing template"** | Quick compose | — | see below | mode-switching (no mode key saved for Quick compose) |
| MESSAGE / body | rich text (TipTap) — Quick compose mode | free HTML + merge fields | empty | yes (compose mode) | `attributes.html` | GHL wraps in styled `<p style="…verdana…16px…">` |
| Template picker | dropdown — **"Select existing template"** mode | **location-dependent** email templates | — | yes (template mode) | `attributes.template_id` (+ `templatesource:"other"`; `html` null) | from email template store |
| Add attachments | button | URL / media | none | no | `attributes.attachments` (array) | |
| Write with AI | button | AI copy | — | — | writes `html` | |
| Test emails + Send test mail | text + button | — | — | no | (not persisted) | test-only |

### Conditional variants ("Create email" radio) — CORRECTED from live panel
The three real options are **"Quick compose" / "From smart builder" / "Select existing template"** (there is NO "custom-message" mode — my earlier list was wrong):
- **Quick compose** (default): inline rich-text body → `attributes.html`. (Verified saved node has NO mode key — quick-compose just writes `html`.)
- **From smart builder**: opens GHL's drag-drop email builder → produces styled `html` (and/or a builder ref; exact payload uncaptured — needs a smart-builder save).
- **Select existing template**: pick a saved email template → `attributes.template_id` (+ `templatesource:"other"`); `html` null (content in template store). This is the template mode (NOT "From smart builder").

### Additional settings (below "Create email") — was missing from the field table
The panel has an **"Additional settings"** section: **Track clicks**, **UTM tracking**, **Add tags**, **Preference type**. These map to the captured `attributes.trackingOptions.{hasTrackingLinks, hasUtmTracking, hasTags}` (and `sourceId`). "Preference type" has no confirmed JSON mapping yet (uncaptured).

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000267 kind=action -->
```json
{
  "name": "Email", "type": "email", "order": 1,
  "attributes": {
    "isCloned": false,
    "fieldDefaults": {},
    "trackingOptions": { "hasTrackingLinks": false, "hasUtmTracking": false, "hasTags": false, "sourceId": "<wfId>:<uuid>" },
    "conditions": [],
    "html": "<p style=\"margin:0px;font-family:verdana,geneva,sans-serif;font-size:16px; padding-left: 0px!important;\">Harvest email body</p>",
    "subject": "Harvest subject {{contact.first_name}}",
    "attachments": []
  }
}
```
(When From Name/Email/preHeader are set they appear as `from_name`, `from_email`, `preHeader`. `assignedOwners` (`["contact_owner"]`/`["opportunity_owner"]`) appears when sender = owner — confirmed in production corpus `a production workflow`, which also shows the follower flags **`alsoNotifyContactFollowers`** / **`alsoNotifyOpportunityFollowers`** (bool) alongside it.)

## Location-data-dependent fields
- **Template mode** → email template store: `GET backend.leadconnectorhq.com/locations/{loc}/templates?type=email&skip=0&limit=2000` (body at `template.html`). Resolve name→`template_id`.
- **From Name/Email** default values come from location email settings (`GET /workflow/{loc}/email/location-email-provider`).

## Quirks
- `html` must match GHL's native `<p style="…">` shape or existing styling flattens (Phase-0 §3 body-edits rule). Merge fields wrapped in `<span class="custom-variable-highlight">` when inserted via UI, but plain `{{...}}` in html also works.
- `trackingOptions.sourceId` = `<workflowId>:<uuid>` — GHL-generated; safe to omit/let server fill on create (present after save).
- Subject + (body OR template) are the minimum required.
