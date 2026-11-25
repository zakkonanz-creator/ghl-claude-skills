# Action: Edit conversation

- **UI name:** Edit conversation · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `edit_conversation`
- **Screenshot:** `screenshots/b3-009-edit-conversation.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Edit conversation` | yes | `name` | Canvas label. |
| MARK AS READ OR UNREAD | clearable select | `Mark as Read`, `Mark as Unread`, cleared/None | `Mark as Read` | no | `attributes.read` | Saved Read = `true`; Unread maps to `false`; cleared omits/no-ops (inferred from UI and official docs). |
| ARCHIVE OR UNARCHIVE | clearable select | `None`, `Archive`, `Unarchive -> Move to Recents tab` | None | no | `attributes.archive` | Saved Archive = `true`; Unarchive maps to `false` (inferred for uncaptured alternate). |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000252 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000252",
  "order": 3,
  "attributes": {
    "read": true,
    "archive": true,
    "type": "edit_conversation",
    "__customInputs__": {}
  },
  "name": "Edit conversation",
  "type": "edit_conversation",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000189",
  "next": "00000000-0000-4000-8000-000000000264"
}
```

## Quirks

- The two selects are independent. Both cleared/None is an official no-op.
- The action edits only the enrolled contact's conversation and produces no user notification.
- Unarchive restores the conversation to the Recents tab.
