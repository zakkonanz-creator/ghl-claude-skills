# Trigger: Task reminder

- **UI name:** Task reminder · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `task_due_date_reminder`
- **Screenshot:** `screenshots/b3-020-task-reminder.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text input | free text | `Task Reminder` | yes | `name` | Canvas label. |
| FILTERS → field | searchable select | `Before no. of days`, `After no. of days`; compatible custom fields | none | no | `conditions[].field`, `title`, `id`, `type` | Captured `Before no. of days`. |
| Before no. of days → value | number input | integer days relative to task due date | none | conditional | `conditions[].value` | Captured as numeric `1`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id029> kind=trigger -->
```json
{
  "id": "<id029>",
  "active": false,
  "actions": [{"workflow_id": "00000000-0000-4000-8000-000000000182", "type": "add_to_workflow"}],
  "conditions": [{"operator": "time-diff-now-lte", "field": "task.dueDate", "value": 1, "title": "Before no. of days", "type": "number", "id": "before-days-in-number"}],
  "type": "task_due_date_reminder",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Task Reminder",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Quirks

- The task must have a due date; the reminder is calculated relative to it.
- `Before no. of days` and `After no. of days` can both be configured and fire independently.
- Completing a task early does not suppress a matching reminder; deleting the task does. Changing the due date recalculates the reminder, while reassignment does not affect it.
- The trigger does not send a notification by itself; add a notification action when needed.
- The draft trigger remains `active:false`; the workflow was not published.
