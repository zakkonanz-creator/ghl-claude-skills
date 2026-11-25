# Trigger: Shopify order fulfilled

- **Current UI name:** Shopify order fulfilled (deprecating soon) · **Category:** Ecommerce
- **JSON `type`:** `shopify_order_fulfilled`
- **Screenshot:** `screenshots/b6-025-shopify-order-fulfilled.png`
- **Premium:** no
- **Runtime prerequisite:** Shopify integration; default trigger can still be saved in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Shopify order fulfilled (deprecating soon)` | yes | `type`, `masterType` | Legacy `highlevel` trigger. |
| WORKFLOW TRIGGER NAME | text | free text | `Shopify Order Fulfilled (deprecating Soon)` | yes | `name` | Live default has inconsistent capitalization. |
| Add filters | condition builder | legacy Shopify fulfillment fields | none | no | `conditions[]` | Official article does not enumerate filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id075> kind=trigger -->
```json
{
  "id": "<id075>",
  "active": false,
  "conditions": [],
  "type": "shopify_order_fulfilled",
  "masterType": "highlevel",
  "name": "Shopify Order Fulfilled (deprecating Soon)",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Deprecated; migrate to unified Ecommerce Stores → Order Fulfilled with Order Source External and Sub-Source Shopify.
- Saved in Draft with `active:false`; never published. Sources: https://help.gohighlevel.com/support/solutions/articles/155000002292 and https://help.gohighlevel.com/support/solutions/articles/155000007390
