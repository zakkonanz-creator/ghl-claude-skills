# Trigger: Coupon code expired

- **UI name:** Coupon code expired · **Category:** Documents & contracts / Ecommerce
- **JSON `type`:** `coupon_code_expired`
- **Screenshot:** `screenshots/b6-015-coupon-code-expired.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Coupon Code Expired` | yes | `name` | |
| Add filters | condition builder | Coupon Code; Coupon Name; Coupon Type (Amount, Percentage) | none | no | `conditions[]` | No date or redemption filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id013> kind=trigger -->
```json
{
  "id": "<id013>",
  "active": false,
  "conditions": [],
  "type": "coupon_code_expired",
  "masterType": "internal",
  "name": "Coupon Code Expired",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires when the scheduled expiration date is reached and the coupon becomes inactive; a failed attempt to redeem an already expired coupon does not fire it.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000005661
