# Trigger: Order fulfilled

- **UI name:** Order fulfilled · **Category:** Ecommerce
- **JSON `type`:** `ecommerce_order_fulfilled_trigger`
- **Screenshot:** `screenshots/b6-022-order-fulfilled.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Order Fulfilled` | yes | `name` | |
| Add filters | condition builder | Order Source; Sub-Source; Fulfilled Products; Cart Value; Shipping Carrier; Tracking Number | none | no | `conditions[]` | Store/External source; Shopify sub-source; product contains-any/is-none-of. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id093> kind=trigger -->
```json
{
  "id": "<id093>",
  "active": false,
  "conditions": [],
  "type": "ecommerce_order_fulfilled_trigger",
  "masterType": "internal",
  "name": "Order Fulfilled",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires on Fulfilled, not Delivered, for native stores and Shopify. Partial fulfillment fires once per fulfilled item group, so split shipments can fire multiple times. WooCommerce is not supported.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000007390
