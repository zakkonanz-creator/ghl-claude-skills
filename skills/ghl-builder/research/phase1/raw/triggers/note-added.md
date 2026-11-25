# Trigger: Note added

- **UI name:** Note added · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `note_add`
- **Screenshot:** `screenshots/b3-014-note-added.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Note added` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Note Added` | yes | `name` | Canvas label. |
| FILTERS → field | searchable select | `Doesn't have tag`, `Has tag`; compatible contact custom fields also appeared in this location | none | no | `conditions[].field`, `title`, `id`, `type` | Official docs describe the tag filters. |
| FILTERS → tag | searchable tag select | location tag catalog | none | conditional | `conditions[].value` | Stores tag name, not ID. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id038> kind=trigger -->
```json
{
  "id": "<id038>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000182",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": "index-of-true",
      "field": "contact.tags",
      "value": "zzz-spike-tag",
      "title": "Has tag",
      "type": "select",
      "id": "has-tag"
    }
  ],
  "type": "note_add",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Note Added",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Tag values load from the location tag catalog and persist by name.

## Quirks

- Fires once per newly attached note. Deletion does not fire it; rapid note creation can produce redundant runs.
- The draft trigger remains `active:false`; the workflow was not published.
