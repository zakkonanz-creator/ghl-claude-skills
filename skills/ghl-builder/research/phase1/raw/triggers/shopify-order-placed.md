# Trigger: Shopify order placed

- **UI name:** Shopify order placed · **Category:** Ecommerce
- **JSON `type`:** `shopify_order_placed`
- **Screenshot:** `screenshots/b6-026-shopify-order-placed.png`
- **Premium:** no
- **Runtime prerequisite:** Shopify integration; default trigger can still be saved in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Shopify order placed` | yes | `type`, `masterType` | Legacy `highlevel` trigger. |
| WORKFLOW TRIGGER NAME | text | free text | `Shopify Order Placed` | yes | `name` | |
| Add filters | condition builder | Cart Value | none | no | `conditions[]` | Only filter documented by the thin official article. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id055> kind=trigger -->
```json
{
  "id": "<id055>",
  "active": false,
  "conditions": [],
  "type": "shopify_order_placed",
  "masterType": "highlevel",
  "name": "Shopify Order Placed",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires on new order creation in a connected Shopify store and remains active/non-deprecated, unlike the two legacy Shopify triggers.
- Saved in Draft with `active:false`; never published. Sources: https://help.gohighlevel.com/support/solutions/articles/155000003255 and https://help.gohighlevel.com/support/solutions/articles/155000002292
