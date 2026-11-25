# Action: Send live chat message

- **JSON `type`:** `live_chat_response` · **Screenshot:** `b1-026-send-live-chat-message.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | |
| MESSAGE | rich text | `attributes.liveChatResponse` | Required; stored as HTML |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000210 kind=action -->
```json
{
  "name": "Send live chat message",
  "type": "live_chat_response",
  "attributes": {
    "liveChatResponse": "<p style=\"margin:0px; padding-left: 0px!important;\">ZZZ spike live chat message</p>",
    "type": "live_chat_response"
  }
}
```

Sends through the website Live Chat widget channel. Pair with a Wait action when the workflow must pause for a chat reply. Draft only, never executed.
