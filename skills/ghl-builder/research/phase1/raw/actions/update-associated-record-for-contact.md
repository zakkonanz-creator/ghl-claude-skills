# Action: Update Associated Record for Contact

- **UI name:** Update Associated Record for Contact · **Category:** Custom objects · **Priority:** LONG_TAIL
- **JSON `type`:** `update_custom_object`
- **Screenshot:** `screenshots/b3-026-update-associated-record-for-contact.png`
- **Fixture:** `ZZZ Spike B3 Record` (`custom_objects.zzz_spike_b3_record`) with Contact association `000000000000000000000009`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Action Name | text input | free text | generated from selected object | yes | `name`, `attributes.name` | |
| Object To Update | object select | Contact-associated custom objects | none | yes | `attributes.key` | |
| Association Label | multi-select | all records or configured Contact association labels | none | no | `attributes.associations[]` | Saved the specific association ID. |
| Owner | user select | location users | none | no | inferred / uncaptured | Default empty owner retained; no owner value key emitted. |
| Followers | user multi-select | location users | none | no | `attributes.followers` | Saved empty array. |
| Add field | repeatable field/value control | fields on selected object; fixed/dynamic values | none | yes | `attributes.fields[].fieldKey`, `value`, `dataType` | Saved `B3 Value` = `Updated by B3`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000255 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000255",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 13,
  "attributes": {
    "name": "Update Associated ZZZ Spike B3 Record records",
    "type": "update_custom_object",
    "requiredProperties": [],
    "primaryDisplayProperty": "",
    "key": "custom_objects.zzz_spike_b3_record",
    "fields": [{"fieldKey": "<id002>", "value": "Updated by B3", "dataType": "TEXT"}],
    "makeAssociation": false,
    "associations": ["000000000000000000000009"],
    "followers": [],
    "clearOwner": false,
    "clearFollowers": false
  },
  "name": "Update Associated ZZZ Spike B3 Record records",
  "type": "update_custom_object",
  "parentKey": "00000000-0000-4000-8000-000000000201"
}
```

## Quirks

- The scope can be a specific association label or all associated records.
- `makeAssociation:false` distinguishes updating existing associated records from the create-and-associate action.
- Behavior with zero matching associated records is undocumented.
