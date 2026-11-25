# Trigger: Coupon code redeemed

- **UI name:** Coupon code redeemed · **Category:** Documents & contracts / Ecommerce
- **JSON `type`:** `coupon_code_redeemed`
- **Screenshot:** `screenshots/b6-016-coupon-code-redeemed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Coupon Code Redeemed` | yes | `name` | |
| Add filters | condition builder | Contact Email/Tag; Coupon Code/Name/Type/Value; Order Value; Product Collection/Type/In Order; Redemption Count; Source | none | no | `conditions[]` | Twelve documented filter categories. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id009> kind=trigger -->
```json
{
  "id": "<id009>",
  "active": false,
  "conditions": [],
  "type": "coupon_code_redeemed",
  "masterType": "internal",
  "name": "Coupon Code Redeemed",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires only when redemption succeeds in a completed transaction. Multiple coupons in one order are evaluated independently.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000005658
