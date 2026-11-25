# Private channel access granted

- **UI name:** Private channel access granted · **Category:** Communities · **Priority:** LONG_TAIL (B4-11)
- **JSON `type`:** `private_channel_access_granted`
- **Screenshot:** `screenshots/b4-011-private-channel-access-granted.png`
- **Status:** ⛔ resource-gated — no community group/private channel exists

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Private Channel Access Granted` | yes | `name` | |
| Group + operator | custom filter | location community groups | unset | yes | inferred / uncaptured | Missing group prevented save. |
| Private Channel | conditional custom select | private channels in selected group | n/a | yes | inferred / uncaptured | Not reachable before Group. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id062> kind=trigger -->
```json
{
  "id": "<id062>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "private_channel_access_granted",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Private Channel Access Granted",
  "schedule_config": {}
}
```

## Gate evidence and limits

- Group is required and native save created no configured trigger. The saved empty-condition Draft witness reopens its live panel with the correct trigger identity and `Add filters`; the screenshot records the default required-Group panel.

## Official runtime semantics

- Fires when private-channel access is granted. The group and an existing private channel are prerequisites/configuration inputs.
- Source: [HighLevel Private Channel Access](https://help.gohighlevel.com/support/solutions/articles/155000003681).
