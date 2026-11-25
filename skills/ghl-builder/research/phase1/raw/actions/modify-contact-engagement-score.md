# Action: Modify contact engagement score

- **UI name:** Modify contact engagement score · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `contact_engagement_score`
- **Screenshot:** `screenshots/b3-013-modify-contact-engagement-score.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Modify contact engagement score` | yes | `name` | Canvas label. |
| ADJUSTMENT | select | `Add`, `Subtract` | `Add` | yes | `attributes.operator` | Stored title-cased. |
| POINTS | numeric/text input | integer/number | empty | yes | `attributes.points` | Saved as JSON number. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000262 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000262",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 0,
  "attributes": {
    "operator": "Add",
    "points": 5,
    "type": "contact_engagement_score",
    "__customInputs__": {}
  },
  "name": "Modify contact engagement score",
  "type": "contact_engagement_score",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000185"
}
```

## Runtime semantics

- Only Add and Subtract are supported; there is no set-to-value operation.
- Engagement Scoring must be configured in the sub-account for score fields to appear in downstream conditions. No documented score minimum or maximum exists.
