# Category started

- **UI name:** Category started · **Category:** Courses · **Priority:** LONG_TAIL (B4-17)
- **JSON `type`:** `category_started`
- **Screenshot:** `screenshots/b4-017-category-started.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed trigger selector | `Category started` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Category Started` | yes | `name` | |
| Product / Category filters | optional custom filters | Memberships/Courses product and category catalogs | no filters | no | inferred / uncaptured | Location-dependent; available through Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id061> kind=trigger -->
```json
{
  "id": "<id061>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "category_started",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Category Started",
  "schedule_config": {}
}
```

## Official runtime semantics

- Fires when a learner starts a selected course category. It requires Memberships/Courses content with categories; there is no dedicated article beyond the trigger roundup.
- Follow-up emails can use learner magic links, but only for contacts already granted a membership offer.
- Sources: [HighLevel workflow trigger roundup](https://help.gohighlevel.com/support/solutions/articles/155000002292), [membership magic links](https://help.gohighlevel.com/support/solutions/articles/48001207804).
