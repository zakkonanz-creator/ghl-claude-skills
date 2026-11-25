# Category completed

- **UI name:** Category completed · **Category:** Courses · **Priority:** LONG_TAIL (B4-16)
- **JSON `type`:** `category_completed`
- **Screenshot:** `screenshots/b4-016-category-completed.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed trigger selector | `Category completed` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Category Completed` | yes | `name` | |
| Product | optional filter | Memberships/Courses products | no filter | no | inferred / uncaptured | Add filters; location-dependent. |
| Course Category | optional filter | categories under selected product | no filter | no | inferred / uncaptured | Add filters; location-dependent. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id060> kind=trigger -->
```json
{
  "id": "<id060>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "category_completed",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Category Completed",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Optional Product and Course Category filters depend on the Memberships/Courses catalog. The representative empty-filter trigger matches any category completion.

## Official runtime semantics

- Fires when a contact completes all lessons in a category. Product and/or course category filters are supported.
- It fires again on each re-completion, and overlapping categories fire separately; add conditions when that is undesirable.
- Source: [HighLevel Category Completed](https://help.gohighlevel.com/support/solutions/articles/155000002671).
