# Trigger: Customer booked appointment

- **UI name:** Customer booked appointment · **Category:** Appointments · **Priority:** CORE
- **JSON `type`:** `customer_appointment`
- **Screenshot:** `screenshots/codex-008-customer-booked-appointment.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Customer booked appointment` | yes | `type:"customer_appointment"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Customer Booked Appointment` | yes | `name` | |
| WHO SHOULD BE ENROLLED INTO THE WORKFLOW? | three-card/radio choice | `Contact only`; `Contact and guests`; `Guests only` | `Contact only` | yes | `contactMode` synthetic condition | Captured Guests only. |
| FILTERS → field | dropdown | `Has tag`; `In calendar`; Custom field → `zzz_spike_field` | none | no | `conditions[]` | |
| Has tag → tag | searchable multiselect | location tag names | none | yes when used | `field:"contact.tags"`, `operator:"index-of-true"`, `id:"has-tag"`, selected tag name | Captured `zzz-spike-tag`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id066> kind=trigger -->
```json
{
  "id": "<id066>",
  "active": false,
  "conditions": [
    { "operator": "is-any-of", "field": "contactMode", "value": ["guest"], "type": "input" },
    { "operator": "index-of-true", "field": "contact.tags", "value": "zzz-spike-tag", "title": "Has tag", "type": "select", "id": "has-tag" }
  ],
  "type": "customer_appointment",
  "masterType": "highlevel",
  "name": "Customer Booked Appointment",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In calendar → location calendar catalog.
- Has tag → location tag catalog; tag name is stored.
- Custom field → location contact custom fields.

## Quirks

- The panel warns that guests added after the appointment is booked will not be enrolled.
- Contact mode is serialized as an `is-any-of` condition.
