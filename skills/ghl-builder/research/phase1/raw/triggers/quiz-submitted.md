# Trigger: Quiz submitted

- **JSON `type`:** `quiz_submitted` · **Screenshot:** `screenshots/b2-015-quiz-submitted.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Quiz Submitted` | yes | `name` | |
| Quiz Name | operator + location quiz picker | Is; Is empty; Is not; Is not empty | none | yes | `conditions[]` | `Is not empty` saved as `has_value`. |
| Add filters | conditional builder | Overall Score; Category Score; quiz score Custom Field | none | no | `conditions[]` | Exact score-range JSON uncaptured; UI prevents min > max. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id068> kind=trigger -->
```json
{"id":"<id068>","active":false,"conditions":[{"operator":"has_value","field":"quizId","title":"Quiz Name","type":"select_with_pagination","id":"quizId"}],"type":"quiz_submitted","masterType":"internal","name":"Quiz Submitted","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Filters include Quiz Name, Overall Score (including Between), Category Score, and custom fields. Source: https://help.gohighlevel.com/support/solutions/articles/155000004437
