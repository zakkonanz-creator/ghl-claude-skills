# Grant group access

- **UI name:** Grant group access · **Category:** Communities · **Priority:** LONG_TAIL (B4-03)
- **JSON `type`:** `grant-group-access`
- **Screenshot:** `screenshots/b4-003-grant-group-access.png`
- **Status:** ⛔ resource-gated — no community group exists in the lab

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Grant group access` | yes | `name` | |
| GROUPS | searchable custom select | location Communities groups | empty; picker displayed `No Data` | yes | inferred / uncaptured | Missing group prevented native save. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000221 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000221",
  "order": 1,
  "attributes": { "type": "grant-group-access" },
  "name": "Grant group access",
  "type": "grant-group-access",
  "parentKey": "00000000-0000-4000-8000-000000000220"
}
```

## Gate evidence and limits

- The required GROUPS picker displayed `No Data`. Exact type came from live builder action metadata; the minimal Draft-only API-injected node is a machine-checkable gate witness, not an executable configuration.
- The injected minimal witness does not reopen its panel in a fresh tab. The screenshot/default unsaved panel is the UI-field and `No Data` evidence; the saved witness is mechanical-only.
- No community fixture was created and the action was never executed.

## Official runtime semantics

- Grants the contact access to the selected community group. Source: [HighLevel Community Group Access](https://help.gohighlevel.com/support/solutions/articles/155000001239).
