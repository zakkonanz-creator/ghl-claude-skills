# User login

- **UI name:** User login · **Category:** Courses · **Priority:** LONG_TAIL (B4-27)
- **JSON `type`:** `user_log_in`
- **Screenshot:** `screenshots/b4-027-user-login.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `User login` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `User Login` | yes | `name` | |
| Additional filters | optional filters | none documented | no filters | no | inferred / uncaptured | Add filters is visible, but official docs list no filter. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id006> kind=trigger -->
```json
{"id":"<id006>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"user_log_in","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"User Login","schedule_config":{}}
```

## Official runtime semantics

- Legacy Membership portal only; it does not apply to the new Client Portal. It can fire on every successful login and has no documented rate limit. Source: [HighLevel Courses User Login (Legacy Portal)](https://help.gohighlevel.com/support/solutions/articles/155000003099).
