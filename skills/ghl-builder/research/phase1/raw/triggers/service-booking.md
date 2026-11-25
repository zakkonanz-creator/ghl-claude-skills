# Trigger: Service booking

- **UI name:** Service booking · **Category:** Appointments
- **JSON `type`:** `service_booking`
- **Screenshot:** `screenshots/b6-013-service-booking.png`
- **Premium:** no
- **Runtime prerequisite:** Services v2 enabled; default trigger can still be saved in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Service booking` | yes | `type`, `masterType` | |
| WORKFLOW TRIGGER NAME | text | free text | `Service Booking` | yes | `name` | |
| Add filters | condition builder | Appointment Status; Created By; Modified By; In Service; In Category; In Location; Has Tag | none | no | `conditions[]` | Status values: Unconfirmed, Confirmed, Showed, No Show, Cancelled, Invalid. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id087> kind=trigger -->
```json
{
  "id": "<id087>",
  "active": false,
  "conditions": [],
  "type": "service_booking",
  "masterType": "internal",
  "name": "Service Booking",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Quirks and semantics

- Fires once per booking, not once per appointment; a multi-service checkout fires once total. Live panel says created or updated.
- Only Update Appointment Status and Create Appointment Note are supported appointment actions downstream. Service details are exposed as custom values.
- Saved in Draft with `active:false`; never published or executed.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000006140
