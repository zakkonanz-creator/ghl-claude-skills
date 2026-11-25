# Action: Remove follower(s) from opportunity

- **UI name:** Remove follower(s) from opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-remove-opportunities-followers`
- **Screenshot:** `screenshots/b7-005-remove-followers-from-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Remove follower(s) from opportunity` | no | top-level `name` | Canvas label. |
| USERS | searchable multi-select | location users; observed `Test User` | none | no | `attributes.users[]` | Stores user IDs. |
| REMOVE ALL FOLLOWERS | toggle | off / on | off | no | `attributes.isRemoveAllOpportunityFollowers` | Both modes were UI-saved. When on, the USERS list is ignored even though the saved node may retain it. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000240 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000240",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 0,
  "attributes": {
    "users": [
      "<userId>"
    ],
    "isRemoveAllOpportunityFollowers": true,
    "type": "internal-remove-opportunities-followers",
    "__customInputs__": {}
  },
  "name": "Remove follower(s) from opportunity",
  "type": "internal-remove-opportunities-followers",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000192"
}
```

## Location-data-dependent fields

- USERS resolves the location user catalog (`GET /users/search?companyId={companyId}&locationId={locationId}`) and stores IDs.

## Execution semantics and quirks

- The action needs an opportunity in context from an opportunity-based trigger or a preceding Find opportunity. An opportunity created earlier in the same workflow does not provide context; without context the action is silently skipped.
- With REMOVE ALL FOLLOWERS off, the UI-saved node used the same `users` array and `isRemoveAllOpportunityFollowers:false`. Specified non-followers are a no-op.
- With the toggle on, every follower is removed and the saved `users` array is ignored at execution time.
