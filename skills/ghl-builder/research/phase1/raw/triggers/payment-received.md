# Trigger: Payment received

- **UI name:** Payment received · **Category:** Payments
- **JSON `type`:** `payment_received`
- **Screenshot:** `screenshots/b6-004-payment-received.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Payment received` | yes | `type`, `masterType` | |
| WORKFLOW TRIGGER NAME | text | free text | `Payment Received` | yes | `name` | |
| Add filters | condition builder | Payment Source; Global Product; Payment Status; Calendar | none | no | `conditions[]` | Default saved node is conditionless. Source enum: Calendar, External, Form, Funnel, Invoice, Manual Payment, Memberships, Website. Payment Status: Success or Failed. Products/calendars are location-dependent. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id082> kind=trigger -->
```json
{
  "id": "<id082>",
  "active": false,
  "conditions": [],
  "type": "payment_received",
  "masterType": "highlevel",
  "name": "Payment Received",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Location-data-dependent fields

- Global Product and Calendar filters resolve against the location's product and calendar catalogs; exact endpoints were not exercised for the conditionless representative save.

## Quirks and semantics

- Gateway-agnostic and includes recurring charges. Downstream custom values include Payment Amount and Transaction ID.
- Saved in Draft with `active:false`; never published.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000003534
