# Action: Update associated company

- **UI name:** Update associated company · **Category:** Company · **Priority:** LONG_TAIL
- **JSON `type`:** `update_associated_company`
- **Screenshot:** `screenshots/b3-023-update-associated-company.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Update associated company` | yes | `name` | Canvas label. |
| ADD FIELDS → field | repeatable company-field selector | standard and configured custom company fields | none | yes | `attributes.__customInputFields__[].filterField` | Captured Company Name as `business.name`. |
| ADD FIELDS → value | custom-value-aware text input | fixed text, contact fields, webhook data, merge fields | none | yes | `attributes.__customInputFields__[].valueField` | Captured fixed text `ZZZ B3 Updated`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000186 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000186",
  "attributes": {
    "type": "update_associated_company",
    "__customInputFields__": [{"__customInputs__": {}, "filterField": "business.name", "valueField": "ZZZ B3 Updated"}],
    "__customInputs__": {}
  },
  "name": "Update associated company",
  "type": "update_associated_company",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000183"
}
```

## Quirks

- Contact-based workflows update the primary associated company. The action is automatically skipped if no company is associated, and it cannot create a company.
- Field values can use fixed text or dynamic sources such as contact fields and webhook payload data.
- Bidirectional contact-to-company and company-to-contact update workflows can loop; use a guard such as a tag or flag.
