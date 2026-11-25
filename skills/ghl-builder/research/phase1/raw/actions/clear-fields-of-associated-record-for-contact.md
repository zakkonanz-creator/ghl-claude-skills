# Action: Clear fields of Associated Record for Contact

- **UI name:** Clear fields of Associated Record for Contact · **Category:** Custom objects · **Priority:** LONG_TAIL
- **JSON `type`:** `clear_custom_object_fields`
- **Screenshot:** `screenshots/b3-024-clear-fields-of-associated-record-for-contact.png`
- **Fixture:** `ZZZ Spike B3 Record` (`custom_objects.zzz_spike_b3_record`) with Contact association `000000000000000000000009`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Action Name | text input | free text | generated from selected object | yes | `name`, `attributes.name` | Saved `Clear Associated ZZZ Spike B3 Record records fields`. |
| Object To Clear Fields | object select | Contact-associated custom objects | none | yes | `attributes.key` | Saved `custom_objects.zzz_spike_b3_record`. |
| Association Label | multi-select | `All associated ZZZ Spike B3 Records`; configured association labels | none | no | `attributes.associations[]` | Saved the specific Contact association ID. |
| Clear Owner | select | `Yes`, `No` | `No` | no | `attributes.clearOwner` | |
| Clear Followers | select | `Yes`, `No` | `No` | no | `attributes.clearFollowers`, `attributes.followers` | |
| Add field | repeatable custom-object field selector | eligible fields on the selected object | none | conditional | `attributes.fields[].fieldKey`, `dataType` | Saved `B3 Value` (`<id002>`, `TEXT`). |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000200 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000200",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 11,
  "attributes": {
    "name": "Clear Associated ZZZ Spike B3 Record records fields",
    "type": "clear_custom_object_fields",
    "requiredProperties": [],
    "primaryDisplayProperty": "",
    "key": "custom_objects.zzz_spike_b3_record",
    "fields": [{"fieldKey": "<id002>", "dataType": "TEXT"}],
    "makeAssociation": false,
    "associations": ["000000000000000000000009"],
    "followers": [],
    "clearOwner": false,
    "clearFollowers": false
  },
  "name": "Clear Associated ZZZ Spike B3 Record records fields",
  "type": "clear_custom_object_fields",
  "parentKey": "00000000-0000-4000-8000-000000000186"
}
```

## Quirks

- Object and field controls are populated only after a custom object and Contact association exist.
- Selecting a specific association label targets matching associated records; the UI also offers all associated records.
- Owner and followers can be cleared independently of selected custom fields.
