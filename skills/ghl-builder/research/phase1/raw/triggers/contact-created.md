# Trigger: Contact created

- **UI name:** Contact created · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `contact_created`
- **Screenshot:** `screenshots/codex-002-contact-created.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Contact created` | yes | `type` = `contact_created`; `masterType` = `highlevel` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Contact Created` | yes | `name` | |
| FILTERS → field | custom dropdown | Standard fields: `Contact type`, `Email`, `Phone`, `Tag`; Custom field: `zzz_spike_field` | none | no | `conditions[].title`, `field`, `type` | |
| Email operator | custom dropdown | `Equals to`; `Not equals to` | `Select operator` | yes after Email is selected | `conditions[].operator` (`==` / `!=`) | Phone uses the same input-style comparison family. |
| Email value | text input | free text / merge-compatible value | empty | yes after a value-requiring operator | `conditions[].value` | Captured with `sample@example.invalid`. |

### Filter catalog

| Filter field | Operators / values |
|---|---|
| Contact type | enum comparison against the location's contact-type choices |
| Email | `Equals to` (`==`), `Not equals to` (`!=`); text value |
| Phone | input comparison family; phone text value |
| Tag | tag membership comparison; location tag values |
| Custom field → `zzz_spike_field` | operators depend on the selected custom-field data type; value is field-type-specific |

Only Email was persisted for the representative mapping; operator enums for the other branches were not individually saved.

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id080> kind=trigger -->
```json
{
  "id": "<id080>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "contact.email",
      "value": "sample@example.invalid",
      "title": "Email",
      "type": "input"
    }
  ],
  "type": "contact_created",
  "masterType": "highlevel",
  "name": "Contact Created",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Tag filter values come from the location tag catalog.
- Custom field choices come from the location contact custom-field search endpoint.
- Standard Email/Phone fields are static and require no location lookup.

## Quirks

- No filter is required; an unfiltered trigger enrolls every newly created contact.
- Canvas summary for the capture: `Email is "sample@example.invalid"`.
