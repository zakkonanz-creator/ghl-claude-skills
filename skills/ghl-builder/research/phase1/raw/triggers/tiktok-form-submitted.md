# Trigger: TikTok form submitted

- **JSON `type`:** `tik_tok_form_submitted` · **Screenshot:** `screenshots/b2-018-tiktok-form-submitted.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `TikTok Form Submitted` | yes | `name` | |
| In Form | integration-backed picker | connected TikTok forms | none | officially mandatory | `conditions[]` | Lab allowed an empty Draft save; connected-form JSON remains uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id036> kind=trigger -->
```json
{"id":"<id036>","active":false,"conditions":[],"type":"tik_tok_form_submitted","masterType":"highlevel","name":"TikTok Form Submitted","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Official docs require an `In Form` selection for an executable trigger. Source: https://help.gohighlevel.com/support/solutions/articles/155000003262
