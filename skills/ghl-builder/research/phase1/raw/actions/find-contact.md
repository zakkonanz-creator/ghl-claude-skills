# Action: Find contact

- **UI name:** Find contact · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `find_contact`
- **Screenshot:** `screenshots/b3-011-find-contact.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Find contact` | yes | `name`, `attributes.name` | Canvas label. |
| FILTERS → field | repeatable searchable select | Business Name, City, Contact ID, Contact source, Email, First name, Full name, Last name, Phone, Postal code, State, Street Address, Website; location custom fields | none | at least one | `attributes.fields[].field`, `title`, `type` | Multiple criteria use AND logic. |
| FILTERS → value | text/value input + custom-variable picker | literal or merge-field expression | empty | yes | `attributes.fields[].value` | Representative Email literal used. |
| Include additional emails | checkbox | on/off | off | no; Email only | `attributes.fields[].includeAdditional` | Phone has the analogous secondary-phone option. |
| Add field | button | adds another filter | — | — | `attributes.fields[]` | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000305 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000305",
  "parentKey": "00000000-0000-4000-8000-000000000265",
  "type": "find_contact",
  "name": "Find contact",
  "attributes": {
    "type": "find_contact",
    "fields": [
      {
        "field": "email",
        "value": "zzz-b3@example.com",
        "title": "Email",
        "type": "string",
        "date": "",
        "includeAdditional": false
      }
    ],
    "convertToMultipath": true,
    "name": "Find contact",
    "cat": "multi-path",
    "isHybridAction": true,
    "hybridActionType": "find_contact",
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000325",
        "name": "Contact found",
        "condition": "contact_found",
        "conditionType": "user-defined",
        "isPrimaryBranch": true,
        "description": "",
        "attributes": {
          "type": "contact_found",
          "description": "Contact found",
          "cat": "multi-path"
        }
      }
    ]
  },
  "order": 5,
  "cat": "multi-path",
  "next": [
    "00000000-0000-4000-8000-000000000325",
    "00000000-0000-4000-8000-000000000299"
  ]
}
```

## Location-data-dependent fields

- Custom-field filters come from the location custom-field catalog. The lab exposed `zzz_spike_field` for this action.

## Branch and runtime semantics

- The action creates `Contact found` and `Contact not found` transition nodes. No match follows Not Found rather than stopping the workflow.
- It is intended to introduce a contact into contact-less workflows such as Inbound webhook or app-triggered flows.
- Primary email/phone are matched by default. Secondary values require their checkbox. All configured filters use AND logic.
