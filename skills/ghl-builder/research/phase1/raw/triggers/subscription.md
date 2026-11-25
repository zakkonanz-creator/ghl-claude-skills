# Trigger: Subscription

- **UI name:** Subscription · **Category:** Documents & contracts / Payments
- **JSON `type`:** `subscription`
- **Screenshot:** `screenshots/b6-020-subscription.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Subscription` | yes | `name` | |
| Add filters | condition builder | Global Products; Status; Custom Fields | none | no | `conditions[]` | Status: Active, Canceled, Expired, Incomplete, Incomplete Expired, Overdue, Scheduled, Trial, Unpaid. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id058> kind=trigger -->
```json
{
  "id": "<id058>",
  "active": false,
  "conditions": [],
  "type": "subscription",
  "masterType": "internal",
  "name": "Subscription",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires when a subscription is created or its status changes. `Incomplete Expired` is a failed first payment; `Overdue` remains active. Stripe term-end events appear as Canceled, not Expired.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000003536
