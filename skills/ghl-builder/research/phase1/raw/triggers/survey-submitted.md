# Trigger: Survey submitted

- **JSON `type`:** `survey_submission` · **Screenshot:** `screenshots/b2-017-survey-submitted.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Survey Submitted` | yes | `name` | |
| Add filters | conditional builder | Survey is (blank = any); Disqualified true/false | none | no | `conditions[]` | Saved empty; exact conditional JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id025> kind=trigger -->
```json
{"id":"<id025>","active":false,"conditions":[],"type":"survey_submission","masterType":"highlevel","name":"Survey Submitted","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Survey answer content cannot be evaluated directly; use fields/tags written by the survey. Source: https://help.gohighlevel.com/support/solutions/articles/155000003259
