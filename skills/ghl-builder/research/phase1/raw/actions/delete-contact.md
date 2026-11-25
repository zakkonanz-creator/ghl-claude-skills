# Action: Delete contact

- **UI name:** Delete contact · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-delete-contact`
- **Screenshot:** `screenshots/b3-008-delete-contact.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Delete contact` | yes | `name` | Only configurable field. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000264 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000264",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 16,
  "attributes": {
    "type": "internal-delete-contact",
    "__customInputs__": {}
  },
  "name": "Delete contact",
  "type": "internal-delete-contact",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000285"
}
```

## Quirks

- The panel requires this action to be the last workflow step. At execution it removes the contact from all workflows and deletes it from the account, so later actions never run.
- Official documentation describes a two-month restoration window for deleted contacts.
- This node was saved in Draft for schema capture only; the workflow was never published or executed, and no contact was deleted.
