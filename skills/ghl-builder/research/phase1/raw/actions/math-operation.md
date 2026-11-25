# Action: Math operation

- **UI name:** Math operation · **Category:** Internal · **Priority:** LONG_TAIL (B5-6)
- **JSON `type`:** `math_operation`
- **Screenshot:** `screenshots/b5-006-math-operation.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Math operation` | yes | `name` | |
| SELECT FIELD | tree selector | numerical standard/custom fields and custom values | none | yes | `attributes.selectField` | Saved the lab numerical custom field `zzz-spike-number`; its ID is persisted. |
| Operator | custom select | `Add`; `Subtract`; `Multiply`; `Divide` | `Add` | yes | `attributes.operators[].operator` | Saved `Subtract` as `sub`. |
| Value | number | numeric literal | `0` | yes | `attributes.operators[].value` | Saved `5`. |
| Add operator | button | adds another operator/value row | n/a | no | `attributes.operators[]` | Repeatable; representative JSON contains one row. |
| SAVE RESULT TO FIELD (optional) | tree selector | compatible standard/custom fields and custom values | none | no | `attributes.updateField` | Saved back to `zzz-spike-number`. The UI rejects an output field whose data type differs from the selected source field. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000258 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000258",
  "stepIndex": 1,
  "order": 5,
  "attributes": {
    "selectField": "<numberFieldId>",
    "selectFieldtype": "numerical",
    "sourceCustomValueId": "",
    "updateField": "<numberFieldId>",
    "updateFieldType": "numerical",
    "targetCustomValueId": "",
    "operators": [
      {
        "operator": "sub",
        "__id": "00000000-0000-4000-8000-000000000319",
        "value": 5
      }
    ]
  },
  "name": "Math operation",
  "type": "math_operation",
  "parentKey": "00000000-0000-4000-8000-000000000303"
}
```

## Location-data-dependent fields

- SELECT FIELD and SAVE RESULT TO FIELD draw from the location's compatible custom-field and custom-value catalogs.
- A numerical fixture was created for this capture: `zzz-spike-number`, ID `<numberFieldId>`, field key `contact.zzzspikenumber`, data type `NUMERICAL`.

## Quirks

- The saved source-type key is spelled `selectFieldtype` with a lowercase `t`, while the output counterpart is `updateFieldType`.
- Operators persist compact tokens: `sub` for the UI label `Subtract`.
- Each operator row receives a generated `__id`.

## Official runtime semantics

- Math Operation supports numeric arithmetic and adding/subtracting days, months, or years for date fields. Source and destination types must match.
- Compound expressions and PEMDAS are not supported; chain actions for multiple operations. Negative numeric results are allowed, but negative date or monetary results are not. Source: [HighLevel Math Operation](https://help.gohighlevel.com/support/solutions/articles/155000003356).
