# Trigger: Order submitted

- **UI name:** Order submitted · **Category:** Payments
- **JSON `type`:** `order_submission`
- **Screenshot:** `screenshots/b6-003-order-submitted.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Order submitted` | yes | `type`, `masterType` | UI label differs from JSON type. |
| WORKFLOW TRIGGER NAME | text | free text | `Order Submitted` | yes | `name` | |
| Add filters | condition builder | order/product/source fields from the location commerce catalog | none | no | `conditions[]` | The representative default node was saved without filters. `Order Source = Calendar` is a material Service v2 special case. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id081> kind=trigger -->
```json
{
  "id": "<id081>",
  "active": false,
  "conditions": [],
  "type": "order_submission",
  "masterType": "highlevel",
  "name": "Order Submitted",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Quirks and semantics

- Fires only after a completed payment; failed/incomplete transactions do not fire it. Covers one-time purchases, payment links, recurring invoices, Stripe, and PayPal (PayPal recurring only with auto-pay off).
- Unlike Order Form Submission, it unlocks order custom values and Shopping Cart email data; both triggers can fire for one purchase.
- Service v2 booking orders require `Order Source = Calendar` to fire.
- Saved in Draft with `active:false`; never published.
- Official sources: https://help.gohighlevel.com/support/solutions/articles/155000004877 and https://help.gohighlevel.com/support/solutions/articles/155000004303
