# Grant community group leaderboard points

- **UI name:** Grant community group leaderboard points · **Category:** Communities · **Priority:** LONG_TAIL (B4-02)
- **JSON `type`:** `grant_user_group_gamification_points`
- **Screenshot:** `screenshots/b4-002-grant-community-group-leaderboard-points.png`
- **Status:** ⛔ resource-gated — no community group exists in the lab

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Grant community group leaderboard points` | yes | `name` | |
| GROUPS | searchable custom select | location Communities groups | empty; opened picker showed `No Data` | yes | inferred / uncaptured | Resource gate prevented native save. |
| POINTS | text/number input | numeric points amount or supported variable | empty (`Please Input`) | yes | inferred / uncaptured | Not saved without Group. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000220 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000220",
  "order": 0,
  "attributes": {
    "type": "grant_user_group_gamification_points"
  },
  "name": "Grant community group leaderboard points",
  "type": "grant_user_group_gamification_points"
}
```

## Gate evidence and limits

- Opening the required GROUPS control displayed `No Data`; the action could not be configured natively.
- Exact type came from live builder action metadata. The minimal Draft-only node was API-injected and read back as a machine-checkable gate witness; it is not an executable schema.
- The injected minimal witness does not reopen its panel in fresh tabs. The screenshot and default unsaved panel are the UI evidence for the fields and `No Data` gate; the saved witness is mechanical-only.
- No group was created and the action was never executed.

## Official runtime semantics

- Awards the specified points to a member in the chosen community group. If the contact is not a member of that group, workflow execution fails.
- Source: [HighLevel Communities Gamification](https://help.gohighlevel.com/support/solutions/articles/155000004080).
