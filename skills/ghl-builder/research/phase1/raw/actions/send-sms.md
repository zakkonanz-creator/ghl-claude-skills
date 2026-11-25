# Action: Send SMS

- **UI name:** Send SMS · **Category:** Communication · **Priority:** CORE
- **JSON `type`:** `sms`
- **Screenshot:** `screenshots/030-send-sms-panel.png`, saved `031-send-sms-saved.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path (`attributes.*`) | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | — | "SMS" | yes (node name) | `name` (top-level node field, not in attributes) | node label on canvas |
| TEMPLATES | dropdown (Select template) | **location-dependent**: SMS templates for the sub-account | (none) | no | `attributes.template_id` (+ `templatesource:"other"` when a saved template is chosen; then `body` may be null and content lives in the template store) | fetched from `GET /locations/{loc}/templates?type=sms` (template store) |
| MESSAGE | rich text (TipTap/ProseMirror) | free text + merge fields via toolbar (tag icon = custom values/merge fields, lightning = ?) | empty | effectively yes | `attributes.body` | merge fields like `{{contact.first_name}}` pass through as literal text |
| Add attachments | button → "Add files through URL" text input + "Upload from system" | URL or media library | none | no | `attributes.attachments` (array) | empty array `[]` when none |
| Write with AI | button | AI copy generator | — | — | (writes into `body`) | |
| Test phone number + Send test SMS | text input + button | — | — | no | (not persisted) | test-only |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000266 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000266",
  "order": 0,
  "name": "SMS",
  "type": "sms",
  "attributes": { "body": "harvest sms {{contact.first_name}}", "attachments": [] }
}
```

## Location-data-dependent fields
- **TEMPLATES** → SMS template store: `GET backend.leadconnectorhq.com/locations/{loc}/templates?type=sms&skip=0&limit=2000` (body at `template.body`). Resolve name→`template_id` at build time.

## Quirks
- `body` accepts merge fields verbatim. When a saved template is selected, GHL sets `template_id` + `templatesource:"other"` and `body`/`html` may be null (content in the template store) — per Phase-0 read-side schema.
- Minimal replayable attributes = just `{ body, attachments }`. `template_id` optional.
