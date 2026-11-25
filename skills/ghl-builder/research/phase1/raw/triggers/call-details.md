# Trigger: Call details

- **UI name:** Call details · **Category:** Events
- **JSON `type`:** `call_status`
- **Screenshot:** `screenshots/b2-001-call-details.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | Native trigger catalog | `Call details` | yes | `type`, `masterType` | Shared trigger control. |
| WORKFLOW TRIGGER NAME | text | Free text | `Call Details` | yes | `name` | Canvas label. |
| FILTERS → field | searchable dropdown | Call direction; Call status; Custom disposition; In workflow; location custom fields | none | no | `conditions[].field` | Live panel catalog. Official docs additionally describe number-pool/phone-number filters; those were not exposed in this lab panel and are uncaptured. |
| Call direction → value | dropdown | Incoming; Outgoing | none | yes when filter selected | `conditions[].value` | Incoming saved as `inbound`; outgoing is inferred as `outbound`. |
| Call status → value | multiselect | Call-result statuses such as completed, busy, canceled, voicemail, no-answer | none | yes when filter selected | `conditions[].value[]` | Exact catalog not captured in this saved variant; production corpus shows `contains-any`. |
| Custom disposition | value picker | Location/call-dependent disposition values | none | yes when selected | `conditions[]` | Uncaptured conditional variant. |
| In workflow | workflow picker | Location workflow catalog | none | yes when selected | `conditions[].field="workflow.id"`, `value` | Production corpus verified ID storage. |
| Custom field | location custom-field picker | `zzz_spike_field`, `zzz-spike-number` observed | none | yes when selected | `conditions[]` | Location-dependent; exact per-type operators uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id052> kind=trigger -->
```json
{
  "id": "<id052>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "message.direction",
      "value": "inbound",
      "title": "Call direction",
      "type": "select"
    }
  ],
  "type": "call_status",
  "masterType": "highlevel",
  "name": "Call Details",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000177",
      "type": "add_to_workflow"
    }
  ],
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Runtime semantics and quirks

- Fires when call information is logged or updated and the configured conditions match; it does not fire indiscriminately for every call. Each call is evaluated independently and may qualify for multiple workflows.
- Official filter coverage includes direction, status, number pool, phone number, and custom disposition. Source: https://help.gohighlevel.com/support/solutions/articles/48001212511
- Production corpus checked before capture: real `call_status` triggers confirm `message.direction`/`==` and `call_status`/`contains-any`, plus workflow IDs under `workflow.id`.
- Saved in Draft; `active:false`. Never published or executed.
