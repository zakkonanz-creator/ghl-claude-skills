# Action: Add follower(s) to opportunity

- **UI name:** Add follower(s) to opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-add-opportunities-followers`
- **Screenshot:** `screenshots/b7-001-add-followers-to-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Add follower(s) to opportunity` | no | top-level `name` | Canvas label. |
| FOLLOWERS | searchable multi-select | location users; observed `Test User` | none | yes | `attributes.users[]` | Stores user IDs, not display names. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000291 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000291",
  "order": 0,
  "attributes": {
    "users": [
      "<userId>"
    ],
    "type": "internal-add-opportunities-followers",
    "__customInputs__": {}
  },
  "name": "Add follower(s) to opportunity",
  "type": "internal-add-opportunities-followers",
  "workflowsActionType": "INTERNAL"
}
```

## Location-data-dependent fields

- FOLLOWERS resolves the location user catalog; the lab user was independently confirmed through `GET /users/search?companyId={companyId}&locationId={locationId}`. Resolve display name to user ID at build time.

## Quirks

- The action accepts multiple followers and persists them in `attributes.users` as an array even when only one user is selected.
- It needs an opportunity in context from an opportunity-based trigger or preceding Find opportunity. An opportunity created earlier in the same workflow does not provide context; without context the action is silently skipped.
- Adding a user who already follows or owns the opportunity does not create a duplicate follower.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Add follower(s) to opportunity), based on GHL article `155000004756`.
