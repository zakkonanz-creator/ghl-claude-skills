# Action: Remove contact followers

- **UI name:** Remove contact followers · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-remove-contact-followers`
- **Screenshot:** `screenshots/b3-017-remove-contact-followers.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Remove contact followers` | yes | `name` | Canvas label. |
| REMOVE ALL FOLLOWERS | switch | on/off | off | no | `attributes.isRemoveAllOpportunityFollowers` | Key name unexpectedly says Opportunity even for this contact action. |
| USERS | searchable user multiselect | location users from `GET /users/search?companyId={companyId}&locationId={locationId}` | none | yes when remove-all is off | `attributes.users[]` | Stores user IDs. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000235 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000235",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 2,
  "attributes": {
    "isRemoveAllOpportunityFollowers": false,
    "users": ["<userId>"],
    "type": "internal-remove-contact-followers",
    "__customInputs__": {}
  },
  "name": "Remove contact followers",
  "type": "internal-remove-contact-followers",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000263"
}
```

## Location-data-dependent fields

- USERS stores location user IDs; resolve from the location user search endpoint.

## Quirks

- Selected-user removal and remove-all are mutually contextual modes. The captured variant removes Test User only.
