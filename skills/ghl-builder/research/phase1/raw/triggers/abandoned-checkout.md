# Trigger: Abandoned checkout

- **UI name:** Abandoned checkout · **Category:** Ecommerce
- **JSON `type`:** `abandoned_checkout`
- **Screenshot:** `screenshots/b6-021-abandoned-checkout.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Abandoned Checkout` | yes | `name` | |
| Duration (in mins) | number | positive minutes | blank | yes | `conditions[]` field `duration` | Captured 15, numeric value. |
| Add filters | condition builder | Cart Value; Country; Global Products; Order Source; Sub-Source; Store Name | none | no | `conditions[]` | Order source HighLevel/External; Shopify sub-source. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id092> kind=trigger -->
```json
{
  "id": "<id092>",
  "active": false,
  "conditions": [
    {"operator":"==","field":"duration","value":15,"title":"Duration (in mins)","type":"numerical","id":"duration"}
  ],
  "type": "abandoned_checkout",
  "masterType": "internal",
  "name": "Abandoned Checkout",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Requires items plus a valid email and no payment within the duration window; carts without an email are never abandoned. Unlike the legacy Shopify trigger, it supports product/SKU targeting.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000007380
