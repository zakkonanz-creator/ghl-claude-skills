# Action: Remove owner from opportunity

- **UI name:** Remove owner from opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal-remove-opportunity-owner`
- **Screenshot:** `screenshots/b7-006-remove-owner-from-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Remove owner from opportunity` | no | top-level `name` | The only configurable field. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000241 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000241",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 1,
  "attributes": {
    "type": "internal-remove-opportunity-owner",
    "__customInputs__": {}
  },
  "name": "Remove owner from opportunity",
  "type": "internal-remove-opportunity-owner",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000240"
}
```

## Execution semantics and quirks

- The action needs an opportunity in context from an opportunity-based trigger or a preceding Find opportunity. An opportunity created earlier in the same workflow does not provide context; without context the action is silently skipped.
- It leaves the opportunity ownerless and is a no-op if the opportunity is already ownerless.
- If contact-owner/opportunity-owner sync is enabled in Opportunity Settings, removing the opportunity owner may also remove the contact owner.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Remove owner from opportunity), based on GHL article `155000004755`.
