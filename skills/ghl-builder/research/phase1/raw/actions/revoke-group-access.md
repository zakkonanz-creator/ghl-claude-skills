# Revoke group access

- **UI name:** Revoke group access · **Category:** Communities · **Priority:** LONG_TAIL (B4-13)
- **JSON `type`:** `revoke-group-access`
- **Screenshot:** `screenshots/b4-013-revoke-group-access.png`
- **Status:** ⛔ resource-gated — no community group exists

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Revoke group access` | yes | `name` | |
| GROUPS | searchable custom select | location Communities groups | empty/`No Data` | yes | inferred / uncaptured | Missing resource prevented native save. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000218 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000218",
  "order": 3,
  "attributes": { "type": "revoke-group-access" },
  "name": "Revoke group access",
  "type": "revoke-group-access",
  "parentKey": "00000000-0000-4000-8000-000000000284"
}
```

## Gate evidence and limits

- The required GROUPS control had no data. The saved minimal witness did not reopen in two fresh reviewer attempts; the screenshot/default unsaved panel is the UI evidence and the exact-type Draft witness is mechanical-only.

## Official runtime semantics

- Removes the contact's access to the selected community group. Source: [HighLevel Community Group Access](https://help.gohighlevel.com/support/solutions/articles/155000001239).
