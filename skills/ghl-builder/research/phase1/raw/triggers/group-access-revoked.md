# Group access revoked

- **UI name:** Group access revoked · **Category:** Communities · **Priority:** LONG_TAIL (B4-06)
- **JSON `type`:** `group_access_revoked`
- **Screenshot:** `screenshots/b4-006-group-access-revoked.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Group Access Revoked` | yes | `name` | |
| Group filter | conditional custom filter | location Communities groups | no filters | no | inferred / uncaptured | Available through Add filters; no group exists in the lab. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id016> kind=trigger -->
```json
{
  "id": "<id016>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_access_revoked",
  "masterType": "internal",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Group Access Revoked",
  "workflowsTriggerType": "INTERNAL",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- The optional Group filter depends on the location's Communities group catalog. The representative empty-filter trigger matches revocation from any group.

## Quirks

- Live UI copy says the trigger fires when access is revoked from a community group's private channel, but the saved type is `group_access_revoked` and the official documentation defines group-access revocation. The private-channel-specific trigger is a separate picker item.

## Official runtime semantics

- Fires when a member's access to a community group is revoked; the trigger can be configured for a specific group.
- Source: [HighLevel Community Group Access](https://help.gohighlevel.com/support/solutions/articles/155000001239).
