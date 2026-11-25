# Group comment created

- **UI name:** Group comment created · **Category:** Communities · **Priority:** LONG_TAIL (B4-07)
- **JSON `type`:** `group_comment_created`
- **Screenshot:** `screenshots/b4-007-group-comment-created.png`
- **Status:** ⛔ resource-gated — required community Group has no options in the lab

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Group Comment Created` | yes | `name` | |
| Group + operator | custom filter | group catalog; `Is`/empty/not operators | unset | yes | inferred / uncaptured | Native save did not persist without Group. |
| Channel | optional conditional filter | channels in selected group | n/a | no | inferred / uncaptured | Official changelog; unavailable behind Group gate. |
| Post Title | optional text filter | post title | n/a | no | inferred / uncaptured | Official changelog. |
| Post Content | optional text filter | post body | n/a | no | inferred / uncaptured | Official changelog. |
| Comment Content | optional text filter | comment body | n/a | no | inferred / uncaptured | Official changelog. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id018> kind=trigger -->
```json
{
  "id": "<id018>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_comment_created",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Group Comment Created",
  "schedule_config": {}
}
```

## Gate evidence and limits

- The default panel required Group and native save created no trigger. Exact type came from live builder metadata; the empty-condition Draft trigger is an API-injected machine-checkable gate witness, not executable configuration.

## Official runtime semantics

- Fires when a member comments on a group post. Group is required; Channel, Post Title, Post Content, and Comment Content are optional filters.
- Source: [official HighLevel Communities triggers changelog](https://ideas.gohighlevel.com/changelog/new-communities-triggers-in-workflows-automate-more-faster).
