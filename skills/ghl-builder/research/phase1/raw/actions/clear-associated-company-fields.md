# Action: Clear associated company fields

- **UI name:** Clear associated company fields · **Category:** Company · **Priority:** LONG_TAIL
- **JSON `type`:** `clear_associated_company_fields`
- **Screenshot:** `screenshots/b3-021-clear-associated-company-fields.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Clear associated company fields` | yes | `name` | Canvas label. |
| ADD FIELDS | repeatable company-field selector | standard company fields (`Address`, `City`, `Country`, `Description`, `Email`, `Phone`, `Postal Code`, `State`, `Website`) and configured company custom fields | none | yes | `attributes.__customInputFields__[].filterField` | Captured `Email` as `business.email`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000184 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000184",
  "attributes": {
    "type": "clear_associated_company_fields",
    "__customInputFields__": [{"__customInputs__": {}, "filterField": "business.email"}],
    "__customInputs__": {}
  },
  "name": "Clear associated company fields",
  "type": "clear_associated_company_fields",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000235"
}
```

## Quirks

- Clears selected values only; it does not delete the company or remove the contact-company association.
- Contact-based workflows target the primary associated company. The action is automatically skipped if the contact has no associated company.
- Multiple standard or custom company fields can be added to one action.
