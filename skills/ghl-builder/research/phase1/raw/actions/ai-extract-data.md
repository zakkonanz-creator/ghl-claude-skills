# Action: AI extract data

- **UI name:** AI extract data · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `workflow_ai_extract_data`
- **Screenshots:** `screenshots/b8-002-ai-extract-data.png`, `screenshots/b8-002-ai-extract-data-saved.png`
- **Premium:** yes — $0.01 per execution under Workflow AI billing.
- **Status:** BETA in the official documentation.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | top-level `name` | Canvas label. |
| EXTRACT FROM | custom-value text input | free text or dynamic value | yes | `attributes.sourceData` | Unstructured source text. |
| ADDITIONAL CONTEXT | textarea | free text | no | `attributes.information` | Helps the AI interpret the source. An empty value is saved as `""`. |
| TEMPLATES | template buttons | Contact info, Opportunity info, Order info, Appointment info | no | `attributes.templates` plus generated `__customInputFields__` | Captured with custom fields, saved as `custom`. Templates prefill field rows. |
| DATA → NAME | repeatable text input | free identifier | yes per row | `attributes.__customInputFields__[].fieldName` | Live default row used `title`. |
| DATA → type | select | Text, Email, Phone, Number, Date | yes per row | matching `.dataType` | Captured `Text` → `text`. Other exact enum strings follow the lowercase UI labels per official field types but were not separately saved. |
| DATA → DESCRIPTION | repeatable textarea | free text | no | matching `.description` | Optional extraction guidance. |
| Add data | button | appends another field row | no | another `__customInputFields__[]` element | Missing requested values are returned empty. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000294 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000294",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000228",
  "order": 0,
  "attributes": {
    "sourceData": "{{contact.first_name}}",
    "information": "",
    "templates": "custom",
    "__customInputFields__": [
      {
        "fieldName": "title",
        "dataType": "text",
        "description": "Extract a concise title from the source text."
      }
    ],
    "type": "workflow_ai_extract_data",
    "__customInputs__": {}
  },
  "name": "AI extract data",
  "type": "workflow_ai_extract_data",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000228"
}
```

The action exposes each named extracted field as output data for downstream actions. Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Workflow AI actions).
