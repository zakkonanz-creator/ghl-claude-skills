# Trigger: Refund

- **UI name:** Refund · **Category:** Documents & contracts / Payments
- **JSON `type`:** `refund`
- **Screenshot:** `screenshots/b6-019-refund.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Refund` | yes | `name` | |
| Add filters | condition builder | Refund Status; Refund Type; Amount; Source | none | no | `conditions[]` | Status Successful/Failed; type Full/Partial; sources include Calendar, Communities, Payment Link, Invoices, Manual. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id022> kind=trigger -->
```json
{
  "id": "<id022>",
  "active": false,
  "conditions": [],
  "type": "refund",
  "masterType": "internal",
  "name": "Refund",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Refund must be initiated inside HighLevel; a refund issued directly in Stripe does not fire it. Supported in-app processors include Stripe, Authorize.net, and NMI.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000003537
