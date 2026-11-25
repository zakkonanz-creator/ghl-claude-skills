# Action: Create Associated Record for Contact

- **UI name:** Create Associated Record for Contact · **Category:** Custom objects · **Priority:** LONG_TAIL
- **JSON `type`:** `create_custom_object`
- **Screenshot:** `screenshots/b3-025-create-associated-record-for-contact.png`
- **Fixture:** `ZZZ Spike B3 Record` (`custom_objects.zzz_spike_b3_record`) with Contact association `000000000000000000000009`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Action Name | text input | free text | generated from selected object | yes | `name`, `attributes.name` | |
| Object Record To Create | object select | Contact-associated custom objects | none | yes | `attributes.key` | |
| Owner | user select | location users | none | no | inferred / uncaptured | Default empty owner was retained; no owner key is emitted. |
| Followers | user multi-select | location users | none | no | `attributes.followers` | Saved empty array. |
| Primary display field (`Name`) | custom-value-aware text | fixed/dynamic value | empty | yes | `attributes.fields[].fieldKey`, `value`, `dataType` | Saved `ZZZ B3 Record`; field ID `<id035>`. |
| Add field | repeatable field/value control | other fields on selected object | none | no | `attributes.fields[]` | Saved `B3 Value` = `Created by B3`. |
| Association Label | select | Contact↔selected-object labels | none | yes | `attributes.associations[]`, `attributes.makeAssociation` | Saved label ID; `makeAssociation:true`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000201 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000201",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 12,
  "attributes": {
    "name": "Create Associated ZZZ Spike B3 Record record",
    "type": "create_custom_object",
    "requiredProperties": [],
    "primaryDisplayProperty": "",
    "key": "custom_objects.zzz_spike_b3_record",
    "fields": [{"fieldKey": "<id002>", "value": "Created by B3", "dataType": "TEXT"}],
    "makeAssociation": true,
    "associations": ["000000000000000000000009"],
    "followers": [],
    "clearOwner": false,
    "clearFollowers": false
  },
  "name": "Create Associated ZZZ Spike B3 Record record",
  "type": "create_custom_object",
  "parentKey": "00000000-0000-4000-8000-000000000200"
}
```

## Quirks

- Requires a custom object and a Contact association label.
- The primary display property is included in `fields` alongside optional added fields; the saved action creates and associates the new record in one step.
