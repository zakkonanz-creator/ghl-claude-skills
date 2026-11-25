# Trigger: Contact changed

- **UI name:** Contact changed · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `contact_changed`
- **Screenshot:** `screenshots/b3-003-contact-changed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | trigger catalog | `Contact changed` | yes | `type`, `masterType` | Shared trigger selector. |
| WORKFLOW TRIGGER NAME | text input | free text | `Contact Changed` | yes | `name` | Canvas label. |
| FILTERS → contact field | searchable picker | standard fields: Assigned user, City, Contact type, Country, DND, Email, Phone, Postal code, State, Street address, Tags, Website; location custom fields | none | at least one representative filter used | `conditions[].field`, `title`, `type` | Custom fields are location-dependent. |
| FILTERS → operator | dropdown | `Has changed`, `Has changed to` | none | yes after a field is selected | `conditions[].operator` | Email representative uses `has-changed`, so no value control appears. |
| FILTERS → value | field-dependent input | appears for `Has changed to` | none | conditional | inferred / uncaptured | Not rendered for the saved `Has changed` variant. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id083> kind=trigger -->
```json
{
  "id": "<id083>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000182",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": "has-changed",
      "field": "contact.email",
      "title": "Email",
      "type": "input"
    }
  ],
  "type": "contact_changed",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Contact Changed",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Custom-field options include the lab's `zzz_spike_field`, `zzz-spike-date`, and `zzz-spike-number`; resolve the selected field against the location custom-field catalog.

## Quirks

- The field catalog mixes standard fields and location custom fields. The saved Email filter uses the stable key `contact.email`.
- The draft trigger remains `active:false`; the workflow was not published.
