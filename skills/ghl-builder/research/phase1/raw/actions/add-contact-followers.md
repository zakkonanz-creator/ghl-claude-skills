# Action: Add contact followers

- **UI name:** Add contact followers · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-add-contact-followers`
- **Screenshot:** `screenshots/b3-001-add-contact-followers.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Add contact followers` | yes | `name` | Canvas label. |
| FOLLOWERS | searchable user multiselect | location users from `GET /users/search?companyId={companyId}&locationId={locationId}` | none | yes | `attributes.users[]` | Stores user IDs; representative selection is Test User. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000188 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000188",
  "order": 0,
  "attributes": {
    "users": ["<userId>"],
    "type": "internal-add-contact-followers",
    "__customInputs__": {}
  },
  "name": "Add contact followers",
  "type": "internal-add-contact-followers",
  "workflowsActionType": "INTERNAL"
}
```

## Location-data-dependent fields

- `FOLLOWERS` stores user IDs. Resolve users from `GET /users/search?companyId={companyId}&locationId={locationId}`.

## Quirks

- The action uses the same internal type at the node and `attributes.type` levels.
