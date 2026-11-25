# Action: Update custom value

- **UI name:** Update custom value · **Category:** Internal · **Priority:** LONG_TAIL (B5-11)
- **JSON `type`:** `update_custom_value`
- **Screenshot:** `screenshots/b5-011-update-custom-value.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Update custom value` | yes | `name` | |
| CUSTOM VALUE | custom select | location custom-value catalog | none | yes | `attributes.custom_value_id` | Saved fixture `zzz-spike-value` by ID. |
| CURRENT VALUE | disabled text | populated from selected custom value | empty before selection | yes | `attributes.current_value` | Saved `before`. |
| NEW VALUE | text with custom-variable picker | free text or merge value | empty | yes | `attributes.new_value` | Saved `after`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000205 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000205",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 1,
  "attributes": {
    "current_value": "before",
    "custom_value_id": "<customValueId>",
    "new_value": "after",
    "type": "update_custom_value"
  },
  "name": "Update custom value",
  "type": "update_custom_value",
  "parentKey": "00000000-0000-4000-8000-000000000216"
}
```

## Location-data-dependent fields

- CUSTOM VALUE is location-scoped. Fixture: `zzz-spike-value`, ID `<customValueId>`, field key `{{ custom_values.zzzspikevalue }}`, initial value `before`.

## Quirks

- The action snapshots both the selected custom value's current value and its requested new value.
- Selecting by name in the UI persists the custom-value ID.

## Official runtime semantics

- This updates one pre-existing, location-level global custom value per action in the same subaccount. An optional current-value match can guard the update.
- The update takes effect immediately for downstream actions and has no undo. Source: [HighLevel Update Custom Value](https://help.gohighlevel.com/support/solutions/articles/155000003353).
