# Group joining request rejected

- **UI name:** Group joining request rejected · **Category:** Communities · **Priority:** LONG_TAIL (B4-08)
- **JSON `type`:** `group_membership_rejected`
- **Screenshot:** `screenshots/b4-008-group-joining-request-rejected.png`
- **Status:** ⛔ resource-gated — required Group has no options in the lab

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Group Joining Request Rejected` | yes | `name` | |
| Group operator | custom select | `Is`; `Is empty`; `Is not`; `Is not empty` | `Select operator` | yes | inferred / uncaptured | |
| Group | searchable custom select | location Communities groups | empty/no results | yes | inferred / uncaptured | Missing resource prevented native save. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id015> kind=trigger -->
```json
{
  "id": "<id015>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_membership_rejected",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Group Joining Request Rejected",
  "schedule_config": {}
}
```

## Gate evidence and limits

- The default panel requires Group; native save created no trigger. Exact type came from live builder metadata, and the minimal empty-condition Draft trigger is only a machine-checkable gate witness.

## Official runtime semantics

- Fires when a community admin rejects a join request. Group is the required and only documented filter.
- Source: [official HighLevel Communities triggers changelog](https://ideas.gohighlevel.com/changelog/new-communities-triggers-in-workflows-automate-more-faster).
