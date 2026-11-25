# Group access granted

- **UI name:** Group access granted · **Category:** Communities · **Priority:** LONG_TAIL (B4-05)
- **JSON `type`:** `group_access_granted`
- **Screenshot:** `screenshots/b4-005-group-access-granted.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Group Access Granted` | yes | `name` | |
| Group filter | conditional custom filter | location Communities groups | no filters | no | inferred / uncaptured | Available through Add filters; lab has no group fixture. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id026> kind=trigger -->
```json
{
  "id": "<id026>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_access_granted",
  "masterType": "internal",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Group Access Granted",
  "workflowsTriggerType": "INTERNAL",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- The optional Group filter depends on the location's Communities group catalog. The representative trigger intentionally uses no filter and therefore fires for any matching group-access grant.

## Official runtime semantics

- Fires when a user is granted access to a community group. The documented filter can restrict enrollment to a selected group.
- Source: [HighLevel Group Access Granted](https://help.gohighlevel.com/support/solutions/articles/155000003538).
