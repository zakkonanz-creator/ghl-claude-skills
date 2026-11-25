# Trigger: Task added

- **UI name:** Task added · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `task_added`
- **Screenshot:** `screenshots/b3-018-task-added.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Task added` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Task Added` | yes | `name` | Canvas label. |
| FILTERS → field | searchable select | `Assigned user`; compatible contact custom fields | none | no | `conditions[].field`, `title`, `type` | |
| Assigned user → user | location user select | location users | none | conditional | `conditions[].value` | Stores user ID. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id091> kind=trigger -->
```json
{
  "id": "<id091>",
  "active": false,
  "actions": [{"workflow_id": "00000000-0000-4000-8000-000000000182", "type": "add_to_workflow"}],
  "conditions": [{"operator": "==", "field": "task.assignedTo", "value": "<userId>", "title": "Assigned user", "type": "select"}],
  "type": "task_added",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Task Added",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Assigned-user choices load from the location user catalog and persist by ID.

## Quirks

- Fires whenever a new task is created on a contact record.
- The draft trigger remains `active:false`; the workflow was not published.
