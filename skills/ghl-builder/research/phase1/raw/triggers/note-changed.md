# Trigger: Note changed

- **UI name:** Note changed · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `note_changed`
- **Screenshot:** `screenshots/b3-015-note-changed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Note changed` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Note Changed` | yes | `name` | Canvas label. |
| FILTERS → field | searchable select | `Doesn't have tag`, `Has tag`; compatible contact custom fields appeared | none | no | `conditions[].field`, `title`, `id`, `type` | |
| FILTERS → tag | searchable tag select | location tag catalog | none | conditional | `conditions[].value` | Stores tag name. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id076> kind=trigger -->
```json
{
  "id": "<id076>",
  "active": false,
  "actions": [{"workflow_id": "00000000-0000-4000-8000-000000000182", "type": "add_to_workflow"}],
  "conditions": [{"operator": "index-of-true", "field": "contact.tags", "value": "zzz-spike-tag", "title": "Has tag", "type": "select", "id": "has-tag"}],
  "type": "note_changed",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Note Changed",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Quirks

- Activates only when an existing note is edited; adding a note is covered by the separate Note added trigger.
- The draft trigger remains `active:false`; the workflow was not published.
