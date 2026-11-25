# Trigger: Appointment status

- **UI name:** Appointment status · **Category:** Appointments · **Priority:** CORE
- **JSON `type`:** `appointment`
- **Screenshot:** `screenshots/codex-007-appointment-status.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Appointment status` | yes | `type:"appointment"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Appointment Status` | yes | `name` | |
| WHO SHOULD BE ENROLLED INTO THE WORKFLOW? | three-card/radio choice | `Contact only`; `Contact and guests`; `Guests only` | `Contact only` | yes | synthetic condition `field:"contactMode"`, `operator:"is-any-of"`, array `value` | Captured contact + guest. |
| Event type | select | `Any`, `Normal`, `Recurring` | `Normal` | yes; present by default | `field:"appointment.eventType"`, `operator:"=="`, value `normal`/`recurring` (Any removes/relaxes the condition) | |
| Add filters → field | dropdown | `Appointment status is`; `Created by/modified by`; `Has tag`; `In calendar`; Custom field → `zzz_spike_field` | none | no | additional `conditions[]` | |
| Appointment status is | select | `new`, `confirmed`, `cancelled`, `Showed`, `No-show`, `invalid` | none | yes when selected | `field:"appointment.status"`, `operator:"=="` | Captured `confirmed`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id094> kind=trigger -->
```json
{
  "id": "<id094>",
  "active": false,
  "conditions": [
    { "operator": "==", "field": "appointment.eventType", "value": "normal", "title": "Event type", "type": "select" },
    { "operator": "is-any-of", "field": "contactMode", "value": ["contact", "guest"], "type": "input" },
    { "operator": "==", "field": "appointment.status", "value": "confirmed", "title": "Appointment status is", "type": "select" }
  ],
  "type": "appointment",
  "masterType": "highlevel",
  "name": "Appointment Status",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In calendar → location calendar catalog (`GET` calendar resources for the location).
- Created by/modified by → location users.
- Has tag → location tags.
- Custom field → contact custom fields.

## Quirks

- Enrollment mode is represented as a condition even though it is a top-level card choice in the UI.
- Status labels preserve UI capitalization, but stored values are lower-case status enums such as `confirmed`.
