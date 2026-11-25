# Trigger: Coupon code applied

- **UI name:** Coupon code applied · **Category:** Documents & contracts / Ecommerce
- **JSON `type`:** `coupon_code_applied`
- **Screenshot:** `screenshots/b6-014-coupon-code-applied.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Coupon Code Applied` | yes | `name` | |
| Add filters | condition builder | Coupon Code/Name/Type/Value; Order Value Before Discount; Product Collection/Type/In Order; Source | none | no | `conditions[]` | Coupon type: Amount or Percentage; product type: One Time or Recurring. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id008> kind=trigger -->
```json
{
  "id": "<id008>",
  "active": false,
  "conditions": [],
  "type": "coupon_code_applied",
  "masterType": "internal",
  "name": "Coupon Code Applied",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires when a coupon is applied at checkout regardless of completion, including abandoned checkouts; scheduled orders do not fire it. Products cannot be tracked if checkout is abandoned mid-process.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000005641
