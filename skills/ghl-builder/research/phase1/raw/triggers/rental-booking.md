# Trigger: Rental booking

- **UI name:** Rental booking · **Category:** Appointments
- **JSON `type`:** `rental_booking`
- **Screenshot:** `screenshots/b6-012-rental-booking.png`
- **Premium:** no
- **Runtime prerequisite:** Rentals configured; default trigger can still be saved in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Rental booking` | yes | `type`, `masterType` | |
| WORKFLOW TRIGGER NAME | text | free text | `Rental Booking` | yes | `name` | |
| Add filters | condition builder | location-dependent rental fields | none | no | `conditions[]` | Default saved node is conditionless; official docs do not enumerate filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id089> kind=trigger -->
```json
{
  "id": "<id089>",
  "active": false,
  "conditions": [],
  "type": "rental_booking",
  "masterType": "internal",
  "name": "Rental Booking",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Quirks and semantics

- Live panel wording says it fires when a Rental Booking is created or updated. The trigger-list article only says a rental reservation is booked and has no dedicated detail article.
- Saved in Draft with `active:false`; never published or executed.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000002292
