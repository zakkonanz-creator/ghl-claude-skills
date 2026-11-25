# Action: Update conversation AI bot and status

- **JSON `type`:** `update_conversation_ai_status`
- **Screenshot:** `b1-030-update-conversation-ai-bot-and-status.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | |
| CHANGE ASSIGNED CONVERSATION AI BOT | bot select | `attributes.assignedEmployeeId` | Saved `keep-same`; other choices are location bots |
| UPDATE BOT'S STATUS TO | select | `attributes.status` | Active/Inactive; saved active |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000249 kind=action -->
```json
{
  "name": "Update conversation AI bot and status",
  "type": "update_conversation_ai_status",
  "attributes": {
    "assignedEmployeeId": "keep-same",
    "status": "active",
    "type": "update_conversation_ai_status"
  }
}
```

This action is non-blocking: it updates the per-contact assignment/status and immediately continues. When selecting a specific bot, that bot must have the relevant message channel enabled. Draft only, never executed.
