# Action: Merge contact

- **UI name:** Merge contact · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `lc_merge_contact`
- **Screenshot:** `screenshots/b3-012-merge-contact.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Merge contact` | yes | `name`, `attributes.__name__` | Canvas label. |
| MATCH BY | select | `Email`, `Phone Number`, `Email and Phone Number` | `Email` | yes | `attributes.match_by` | Saved Email = `email`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000298 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000298",
  "parentKey": "00000000-0000-4000-8000-000000000299",
  "parent": "00000000-0000-4000-8000-000000000299",
  "type": "lc_merge_contact",
  "name": "Merge contact",
  "attributes": {
    "match_by": "email",
    "type": "lc_merge_contact",
    "__customInputs__": {},
    "cat": "multi-path",
    "convertToMultipath": true,
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000300",
        "name": "Duplicate Contact Found",
        "fields": {},
        "meta": {
          "__branchKey__": "00000000-0000-4000-8000-000000000301"
        },
        "conditionType": "pre-defined"
      }
    ],
    "__name__": "Merge contact"
  },
  "order": 0,
  "cat": "multi-path",
  "workflowsActionType": "INTERNAL",
  "next": [
    "00000000-0000-4000-8000-000000000300",
    "00000000-0000-4000-8000-000000000185"
  ]
}
```

## Branch and runtime semantics

- The node creates `Duplicate Contact Found` and `Duplicate Contact Not Found` transition branches.
- The newer contact always merges into the older survivor; no duplicate is a no-op.
- Merge is irreversible in the panel. If the surviving contact is already enrolled in this workflow, the current execution terminates. Existing goals/waits tied to the merged-away contact ID can break.
