# Action: Remove assigned user

- **UI name:** Remove assigned user · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `remove_assigned_user`
- **Screenshot:** `screenshots/b3-016-remove-assigned-user.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Remove assigned user` | yes | `name` | Only configurable field. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000263 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000263",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 1,
  "attributes": {"type": "remove_assigned_user"},
  "name": "Remove assigned user",
  "type": "remove_assigned_user",
  "parentKey": "00000000-0000-4000-8000-000000000262"
}
```

## Runtime semantics

- Unassigns the contact's current user and leaves the contact unassigned. No replacement user is selected by this action.
