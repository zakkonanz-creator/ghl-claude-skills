# Action: Update Contact Field

- **UI name:** Update contact field · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `update_contact_field` · **Screenshots:** `105-update-field-panel.png`, `106-update-field-added-row.png`, `107-field-dropdown-open.png`
- **Premium:** no · **Description:** "Update a field in the contact record"

## Fields
| UI label | Input | Options / source | JSON path (VERIFIED) | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| ACTION TYPE | dropdown | **Update field data** (default) [+ likely Clear field data] | `attributes.actionType` (`"update_field_data"`) | |
| FIELDS | repeatable rows ("Add field") | each = **Select field** dropdown + value input (+ trash to remove) | `attributes.fields[]` (array — shape below) | multiple fields per action |
| — Select field | searchable dropdown | **standard + custom contact fields** (location-dependent) | `fields[].field` (**field ID**, e.g. `<customFieldId>`) + `fields[].title` (display name) + `fields[].type` (data type) | |
| — value | input (type varies by field data type) | free / picker | `fields[].value` (+ `fields[].date` for date fields) | merge fields OK |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000178 kind=action -->
```json
{ "name": "zzz-spike Update Field", "type": "update_contact_field",
  "attributes": {
    "type": "update_contact_field",
    "actionType": "update_field_data",
    "fields": [
      { "field": "<customFieldId>", "value": "zzz-spike-value",
        "title": "zzz_spike_field", "type": "string", "date": "" }
    ] } }
```
Each field entry = `{ field: <field ID>, value, title: <field name>, type: <data type e.g. "string">, date: "" }`. **Field referenced by ID** (`<customFieldId>`), not fieldKey. `actionType` = `"update_field_data"`. `date` is used for date-type fields (empty for string). Second `actionType` enum value verified from production corpus (`a production workflow`): **`"clear_field_data"`** (fields listed with `value:""`) — i.e. the UI's "Clear field data" mode. Panel round-trip of the saved node verified: shows "Update field data" + field row "zzz_spike_field" (screenshot `fixer-014-panel-ucf.png`; node `1daf2cc8…`, steps v18). Production also shows `type:"numerical"` for number fields and merge-field values (`"{{appointment.only_start_date}}"`).

## Location-data-dependent
- Field list → `GET /locations/{loc}/customFields/search?...` (custom) + standard fields. Fixture: custom field `zzz_spike_field` id `<customFieldId>` (this ID goes in `fields[].field`).

## Quirks
- `fields[].field` = field **ID** (not the `contact.xxx` fieldKey). Each entry also carries `title` (name) + `type` (data type) + `date`. Engine resolves field name→ID per location and includes title/type.
