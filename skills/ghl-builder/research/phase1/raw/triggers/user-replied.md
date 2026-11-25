# Trigger: User replied

- **JSON `type`:** `user_replied` · **Screenshot:** `screenshots/b2-020-user-replied.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `User Replied` | yes | `name` | |
| Add filters | conditional builder | panel-defined optional filters | none | no | `conditions[]` | Saved empty; no official per-filter article exists. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id014> kind=trigger -->
```json
{"id":"<id014>","active":false,"conditions":[],"type":"user_replied","masterType":"internal","name":"User Replied","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Fires when a team member replies/messages a contact; useful for human-takeover tracking and stopping automation. Official changelog: https://ideas.gohighlevel.com/changelog/workflow-trigger-user-replied
