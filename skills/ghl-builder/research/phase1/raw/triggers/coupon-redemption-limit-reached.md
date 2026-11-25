# Trigger: Coupon redemption limit reached

- **UI name:** Coupon redemption limit reached · **Category:** Documents & contracts / Ecommerce
- **JSON `type`:** `coupon_redemption_limit_reached`
- **Screenshot:** `screenshots/b6-017-coupon-redemption-limit-reached.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Coupon Redemption Limit Reached` | yes | `name` | |
| Add filters | condition builder | Coupon Code; Coupon Name; Coupon Type; Redemption Limit | none | no | `conditions[]` | Coupon type Amount/Percentage; redemption limit supports numeric operators. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id005> kind=trigger -->
```json
{
  "id": "<id005>",
  "active": false,
  "conditions": [],
  "type": "coupon_redemption_limit_reached",
  "masterType": "internal",
  "name": "Coupon Redemption Limit Reached",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires at the maximum, after the final transaction completes successfully; it does not fire while approaching the limit.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000005660
