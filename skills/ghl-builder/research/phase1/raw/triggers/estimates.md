# Trigger: Estimates

- **UI name:** Estimates · **Category:** Documents & contracts / Payments
- **JSON `type`:** `estimate_update`
- **Screenshot:** `screenshots/b6-018-estimates.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Estimates` | yes | `name` | |
| Add filters | condition builder | Status; Estimate Value; Estimate Template | none | no | `conditions[]` | Status: Sent, Viewed, Accepted, Declined, Invoiced; filters are combinable. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id095> kind=trigger -->
```json
{
  "id": "<id095>",
  "active": false,
  "conditions": [],
  "type": "estimate_update",
  "masterType": "internal",
  "name": "Estimates",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- `Invoiced` means the estimate was converted to an invoice. The official article's filter-description section contains visible placeholder/editing errors.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000003704
