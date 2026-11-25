# Trigger: Shopify abandoned cart

- **Current UI name:** Shopify abandoned cart (deprecating soon) · **Category:** Ecommerce
- **JSON `type`:** `shopify_abandoned_cart`
- **Screenshot:** `screenshots/b6-024-shopify-abandoned-cart.png`
- **Premium:** no
- **Runtime prerequisite:** Shopify integration; default trigger can still be saved in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Shopify abandoned cart (deprecating soon)` | yes | `type`, `masterType` | Legacy `highlevel` trigger. |
| WORKFLOW TRIGGER NAME | text | free text | `Shopify Abandoned Cart (deprecating Soon)` | yes | `name` | Live default has inconsistent capitalization. |
| Duration (minutes) | number | minutes | 10 | yes | `conditions[]` field `duration` | Stored type is `number`. |
| Add filters | condition builder | Cart Value | none | no | `conditions[]` | No product-level targeting. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id085> kind=trigger -->
```json
{
  "id": "<id085>",
  "active": false,
  "conditions": [{"operator":"==","field":"duration","value":10,"title":"Duration (minutes)","type":"number"}],
  "type": "shopify_abandoned_cart",
  "masterType": "highlevel",
  "name": "Shopify Abandoned Cart (deprecating Soon)",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Deprecated for new recovery automations; use Ecommerce Stores → Abandoned Checkout. Existing workflows continue working after Shopify is connected.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000002618
