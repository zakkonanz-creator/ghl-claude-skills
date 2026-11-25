# Action: Custom Webhook (Webhook)

- **UI name:** Custom webhook · **Category:** Send data · **Priority:** CORE
- **JSON `type`:** `custom_webhook` · **Screenshot:** `099-webhook-panel.png`
- **Premium:** ⚠️ **YES — "premium action, additional charges per execution"** (configuring/saving in Draft is free; only execution bills). Not blocked for build.

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| EVENT | dropdown | CUSTOM (default) [+ others] | `attributes.event` | |
| METHOD | dropdown | POST (default) / GET / PUT / PATCH / DELETE | `attributes.method` | |
| URL | text (+merge) | free URL | `attributes.url` | merge fields OK |
| AUTHORIZATION | dropdown | None (default) [+ Basic / Bearer / API key…] | `attributes.authorization.{type, data}` | |
| HEADERS | repeatable "Add item" (key/value) | free | `attributes.headers` (array) | |
| QUERY PARAMETERS | repeatable "Add item" | free | `attributes.parameters` (array) | |
| CONTENT TYPE | dropdown (below fold) | application/json (default) | `attributes.body.contentType` | |
| BODY | raw editor / key-value | JSON with merge fields | `attributes.body.rawData` (string) / `body.keyValueData` (array) | default template pre-fills contact fields |
| (Save response toggle) | toggle | on/off | `attributes.saveResponse` + `webhookResponse.selectedContact` | store response into contact |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000239 kind=action -->
```json
{ "id": "00000000-0000-4000-8000-000000000239",
  "order": 8,
  "name": "Custom webhook", "type": "custom_webhook",
  "attributes": {
    "event": "CUSTOM", "method": "POST",
    "url": "https://example.com/zzz-spike-webhook",
    "body": { "contentType": "application/json",
      "rawData": "{\n  \"id\": \"{{contact.id}}\", ... }",
      "keyValueData": [] },
    "headers": [], "parameters": [],
    "authorization": { "type": "NONE", "data": null },
    "saveResponse": false,
    "webhookResponse": { "selectedContact": "" } },
  "parentKey": "00000000-0000-4000-8000-000000000172" }
```

## Quirks
- Premium (execution-billed) — safe to configure/save in Draft.
- Default `body.rawData` pre-populates a JSON contact payload; merge fields pass through.
- Not location-data-dependent.
