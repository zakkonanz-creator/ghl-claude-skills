# Trigger: Contact DND

- **UI name:** Contact DND · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `dnd_contact`
- **Screenshot:** `screenshots/b3-004-contact-dnd.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Contact DND` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Contact DND` | yes | `name` | Canvas label. |
| FILTERS → DND direction is | select | `Inbound`, `Outbound` | `Outbound` | yes | `conditions[].value` | Stored lowercase; fixed `field:"contact.dnd_direction"`, `operator:"=="`, `type:"select"`. |
| Add filters | button / filter builder | additional trigger filters | none | no | `conditions[]` | No additional filter used. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id021> kind=trigger -->
```json
{
  "id": "<id021>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000182",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": "==",
      "field": "contact.dnd_direction",
      "value": "outbound",
      "title": "DND direction is",
      "type": "select"
    }
  ],
  "type": "dnd_contact",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Contact DND",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Quirks

- This checklist item is a trigger (confirmed against `census.md`), not the CORE `Enable/disable DND` action.
- UI enum labels are title-cased; saved values are lowercase.
- The draft trigger remains `active:false`; the workflow was not published.
