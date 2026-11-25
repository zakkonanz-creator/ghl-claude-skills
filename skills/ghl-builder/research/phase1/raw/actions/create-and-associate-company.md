# Action: Create and associate company

- **UI name:** Create and associate company · **Category:** Company · **Priority:** LONG_TAIL
- **JSON `type`:** `create_and_associate_company`
- **Screenshot:** `screenshots/b3-022-create-and-associate-company.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Create and associate company` | yes | `name` | Canvas label. |
| ADD FIELDS → field | repeatable company-field selector | standard company fields (`Address`, `City`, `Company Name`, `Country`, `Description`, `Email`, `Phone`, `Postal Code`, `State`, `Website`) and configured company custom fields | none | yes | `attributes.__customInputFields__[].filterField` | Captured Company Name as `business.name`. |
| ADD FIELDS → value | custom-value-aware text input | fixed text, contact fields, webhook data, merge fields | none | yes | `attributes.__customInputFields__[].valueField` | Captured fixed text `ZZZ B3 Company`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000183 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000183",
  "attributes": {
    "type": "create_and_associate_company",
    "__customInputFields__": [{"__customInputs__": {}, "filterField": "business.name", "valueField": "ZZZ B3 Company"}],
    "__customInputs__": {}
  },
  "name": "Create and associate company",
  "type": "create_and_associate_company",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000184"
}
```

## Quirks

- Available in contact-based workflows; creates a company record and associates it with the triggering contact.
- If the contact already has an associated company, a new company is still created but is not associated with the contact. This can create an orphan company record.
- The action does not deduplicate by company name.
- Field values can be fixed text or dynamic values such as contact fields and webhook payload data.
