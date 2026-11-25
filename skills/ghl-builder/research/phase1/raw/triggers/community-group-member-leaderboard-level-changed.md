# Community group member leaderboard level changed

- **UI name:** Community group member leaderboard level changed · **Category:** Communities · **Priority:** LONG_TAIL (B4-01)
- **JSON `type`:** `user_group_gamification_level_changed`
- **Screenshot:** `screenshots/b4-001-community-group-member-leaderboard-level-changed.png`
- **Status:** ⛔ resource-gated — the lab has no community group (`No result found.`)

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Community Group Member Leaderboard Level` | yes | `name` | |
| Group operator | custom select | `Is`; `Is empty`; `Is not`; `Is not empty` | `Select operator` | yes for a constrained group | inferred / uncaptured | Native save did not persist without a group selection. |
| Group | searchable custom select | location Communities groups | empty; picker showed `No result found.` | required by official matching semantics | inferred / uncaptured | Resource gate. |
| Level | conditional filter | leaderboard levels for selected group(s) | n/a | required by official matching semantics | inferred / uncaptured | Not reachable without a group; documented by the official article. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id071> kind=trigger -->
```json
{
  "id": "<id071>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000181",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [],
  "type": "user_group_gamification_level_changed",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Community Group Member Leaderboard Level Changed",
  "schedule_config": {}
}
```

## Gate evidence and limits

- Choosing Group → Is exposed a searchable value picker that returned `No result found.` Native `Save trigger` did not create a trigger without the missing resource.
- The exact type came from the builder's live trigger metadata. A minimal Draft-only trigger was API-injected and read back solely as a machine-checkable gate witness; its empty `conditions` are not an executable configured trigger.
- No community group or leaderboard fixture was created, and the workflow remains Draft.

## Official runtime semantics

- Fires when a Communities member's leaderboard level changes. Group(s) and level(s) are matching filters; both must match.
- Source: [HighLevel Community Group Member Leaderboard Level Changed](https://help.gohighlevel.com/support/solutions/articles/155000004080).
