# Grant private channel access

- **UI name:** Grant private channel access · **Category:** Communities · **Priority:** LONG_TAIL (B4-04)
- **JSON `type`:** `grant-private-channel-access`
- **Screenshot:** `screenshots/b4-004-grant-private-channel-access.png`
- **Status:** ⛔ resource-gated — no community group/private channel exists

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Grant private channel access` | yes | `name` | |
| GROUP | searchable custom select | location Communities groups | empty; picker displayed `No Data` | yes | inferred / uncaptured | Resource gate. |
| PRIVATE CHANNEL | conditional custom select | private channels in selected group | n/a | yes | inferred / uncaptured | Not rendered until Group is selected. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000284 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000284",
  "order": 2,
  "attributes": { "type": "grant-private-channel-access" },
  "name": "Grant private channel access",
  "type": "grant-private-channel-access",
  "parentKey": "00000000-0000-4000-8000-000000000221"
}
```

## Gate evidence and limits

- The required GROUP picker displayed `No Data`; the dependent channel control could not render. Exact type came from live builder metadata; the minimal Draft-only node is a machine-checkable gate witness, not executable configuration.
- The injected minimal witness does not reopen its panel in a fresh tab. The screenshot/default unsaved panel is the UI-field and `No Data` evidence; the saved witness is mechanical-only.

## Official runtime semantics

- Grants access to a selected private channel. If the contact is not already in the group, this action also adds them to the group. The channel must pre-exist.
- Source: [HighLevel Private Channel Access](https://help.gohighlevel.com/support/solutions/articles/155000003681).
