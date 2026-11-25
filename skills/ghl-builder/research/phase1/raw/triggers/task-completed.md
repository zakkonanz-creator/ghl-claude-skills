# Trigger: Task completed

- **UI name:** Task completed · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `task_completed`
- **Screenshot:** `screenshots/b3-019-task-completed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text input | free text | `Task Completed` | yes | `name` | Canvas label. |
| FILTERS → field | searchable select | `Assigned User`; compatible contact custom fields | none | no | `conditions[].field`, `title`, `id`, `type` | |
| Assigned User → operator | select | `Is`, `Is empty`, `Is not`, `Is not empty` | none | conditional | `conditions[].operator` | Saved Is = `==`. |
| Assigned User → user | location user select | location users | none | conditional | `conditions[].value` | Stores user ID. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id033> kind=trigger -->
```json
{
  "id": "<id033>",
  "active": false,
  "actions": [{"workflow_id": "00000000-0000-4000-8000-000000000182", "type": "add_to_workflow"}],
  "conditions": [{"operator": "==", "field": "task.assignedTo", "value": "<userId>", "title": "Assigned User", "type": "select", "id": "task.assignedTo"}],
  "type": "task_completed",
  "masterType": "internal",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Task Completed",
  "belongs_to": "workflow",
  "workflowsTriggerType": "INTERNAL",
  "schedule_config": {}
}
```

## Quirks

- Fires when a contact task is marked completed.
- Internally classified with `masterType:"internal"` and `workflowsTriggerType:"INTERNAL"`.
- The draft trigger remains `active:false`; the workflow was not published.
