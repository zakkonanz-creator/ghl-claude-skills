# Action: Add owner to opportunity

- **UI name:** Add owner to opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-add-opportunity-owner`
- **Screenshot:** `screenshots/b7-002-add-owner-to-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Add owner to opportunity` | no | top-level `name` | Canvas label. |
| USER | searchable select | `Assign contact owner` plus location users; observed `Test User` | none | yes | `attributes.user` | Captured with the real location user; stores one user ID. |
| ONLY APPLY TO UNASSIGNED OPPORTUNITIES | toggle | off / on | off | no | `attributes.onlyUnAssigned` | Both modes were exercised; captured saved variant is `true`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000292 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000292",
  "order": 1,
  "attributes": {
    "user": "<userId>",
    "onlyUnAssigned": true,
    "type": "internal-add-opportunity-owner",
    "__customInputs__": {}
  },
  "name": "Add owner to opportunity",
  "type": "internal-add-opportunity-owner",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000291"
}
```

## Location-data-dependent fields

- USER includes location users from the user catalog; the lab user was independently confirmed through `GET /users/search?companyId={companyId}&locationId={locationId}`. Resolve display name to user ID at build time.

## Quirks

- `onlyUnAssigned` uses camelCase with a capital `A` in `Assigned`.
- The panel also offers the dynamic `Assign contact owner` option; its stored token was not captured because the representative saved variant uses a concrete user ID.
- It needs an opportunity in context from an opportunity-based trigger or preceding Find opportunity. An opportunity created earlier in the same workflow does not provide context; without context the action is silently skipped.
- This action assigns one user and has no round-robin mode. With ONLY APPLY TO UNASSIGNED OPPORTUNITIES off it overrides an existing owner; with it on, already-owned opportunities remain unchanged.
- If contact/opportunity owner sync is enabled, the contact owner is updated too. “Only Assigned Data” role restrictions and pipeline permissions can limit the new owner's visibility.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Add owner to opportunity), based on GHL article `155000004754`.
