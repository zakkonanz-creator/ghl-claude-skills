# Lesson completed

- **UI name:** Lesson completed · **Category:** Courses · **Priority:** LONG_TAIL (B4-18)
- **JSON `type`:** `lesson_completed`
- **Screenshot:** `screenshots/b4-018-lesson-completed.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Lesson completed` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Lesson Completed` | yes | `name` | |
| Product / Category / Lesson filters | optional custom filters | Memberships/Courses catalogs | no filters | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id070> kind=trigger -->
```json
{"id":"<id070>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"lesson_completed","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Lesson Completed","schedule_config":{}}
```

## Official runtime semantics

- Fires when a learner completes a lesson. There is no dedicated article; the trigger roundup documents it, and follow-up emails support learner magic links for contacts already granted an offer.
- Source: [HighLevel workflow trigger roundup](https://help.gohighlevel.com/support/solutions/articles/155000002292).
