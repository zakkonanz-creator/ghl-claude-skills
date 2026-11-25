# Trigger: Customer replied

- **UI name:** Customer replied · **Category:** Events · **Priority:** CORE
- **JSON `type`:** `customer_reply`
- **Screenshot:** `screenshots/codex-005-customer-replied.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Customer replied` | yes | `type:"customer_reply"`, `masterType:"highlevel"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Customer Replied` | yes | `name` | |
| FILTERS → field | hierarchical dropdown | `Doesn't have tag`; `Has Attachments`; `Has tag`; `Intent type`; `Message body`; `Replied to workflow`; `Reply channel`; Custom field → `zzz_spike_field` | none | no | `conditions[]` | |
| Reply channel | select | `All in one chat`, `Call`, `Chat widget`, `Email`, `Facebook messenger`, `GMB messaging`, `Instagram DM`, `Live chat`, `SMS`, `TikTok`, `WhatsApp` | none | yes when selected | `conditions[].field:"message.type"`, `operator:"=="`, numeric `value` | Captured SMS = `2`. |

Other filters use tag membership, boolean attachment, intent/message text, workflow selector, or selected custom-field operator/value controls. Tags, workflows, and custom fields are location-dependent.

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id086> kind=trigger -->
```json
{
  "id": "<id086>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "message.type",
      "value": 2,
      "title": "Reply channel",
      "type": "select"
    }
  ],
  "type": "customer_reply",
  "masterType": "highlevel",
  "name": "Customer Replied",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Has/doesn't-have tag → location tag catalog.
- Replied to workflow → location workflow list.
- Custom field → location contact custom-field catalog.
- Reply channel and Has Attachments are static enums.

## Quirks

- Channel labels map to numeric message-type values; the capture proves SMS = `2`.
- The trigger may be saved with no filter to accept replies on every supported channel.
