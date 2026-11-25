# Revoke private channel access

- **UI name:** Revoke private channel access · **Category:** Communities · **Priority:** LONG_TAIL (B4-14)
- **JSON `type`:** `revoke-private-channel-access`
- **Screenshot:** `screenshots/b4-014-revoke-private-channel-access.png`
- **Status:** ⛔ resource-gated — no group/private channel exists

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Revoke private channel access` | yes | `name` | |
| GROUP | searchable custom select | location Communities groups | empty/`No Data` | yes | inferred / uncaptured | Resource gate. |
| PRIVATE CHANNEL | conditional custom select | private channels in selected group | n/a | yes | inferred / uncaptured | Not rendered before Group. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000217 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000217",
  "order": 4,
  "attributes": { "type": "revoke-private-channel-access" },
  "name": "Revoke private channel access",
  "type": "revoke-private-channel-access",
  "parentKey": "00000000-0000-4000-8000-000000000218"
}
```

## Gate evidence and limits

- Required Group had no data, so Channel could not render. The saved minimal witness did not reopen in a fresh reviewer tab; the screenshot/default unsaved panel is the UI evidence and the exact-type Draft witness is mechanical-only.

## Official runtime semantics

- Revokes private-channel access while preserving membership in the community group. Source: [HighLevel Private Channel Access](https://help.gohighlevel.com/support/solutions/articles/155000003681).
