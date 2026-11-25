# Trigger: Birthday reminder

- **UI name:** Birthday reminder · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `birthday_reminder`
- **Screenshot:** `screenshots/b3-002-birthday-reminder.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Birthday reminder` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Birthday Reminder` | yes | `name` | Canvas label. |
| Add filters | button / conditional filter builder | trigger-specific filters | no filters | no | `conditions[]` | Representative saved variant intentionally has no optional filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id017> kind=trigger -->
```json
{
  "id": "<id017>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000182",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [],
  "type": "birthday_reminder",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Birthday Reminder",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Quirks

- Saving without filters is allowed after confirming the `Save without filters` modal.
- The draft trigger remains `active:false`; the workflow was not published.
