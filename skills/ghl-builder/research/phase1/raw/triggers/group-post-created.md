# Group post created

- **UI name:** Group post created · **Category:** Communities · **Priority:** LONG_TAIL (B4-09)
- **JSON `type`:** `group_post_created`
- **Screenshot:** `screenshots/b4-009-group-post-created.png`
- **Status:** ⛔ resource-gated — required Group has no options

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Group Post Created` | yes | `name` | |
| Group + operator | custom filter | location community groups | unset | yes | inferred / uncaptured | Native save did not persist without Group. |
| Channel | optional conditional filter | selected group's channels | n/a | no | inferred / uncaptured | Official changelog; behind Group gate. |
| Post Title | optional text filter | post title | n/a | no | inferred / uncaptured | Official changelog. |
| Post Content | optional text filter | post content | n/a | no | inferred / uncaptured | Official changelog. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id088> kind=trigger -->
```json
{
  "id": "<id088>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_post_created",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Group Post Created",
  "schedule_config": {}
}
```

## Gate evidence and limits

- The default panel requires Group and native save created no trigger. The live-metadata type was used for an empty-condition Draft witness only; it is not executable configuration.

## Official runtime semantics

- Fires when a member creates a group post. Group is required; Channel, Post Title, and Post Content are optional filters.
- Source: [official HighLevel Communities triggers changelog](https://ideas.gohighlevel.com/changelog/new-communities-triggers-in-workflows-automate-more-faster).
