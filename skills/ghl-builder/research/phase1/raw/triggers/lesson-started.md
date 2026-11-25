# Lesson started

- **UI name:** Lesson started · **Category:** Courses · **Priority:** LONG_TAIL (B4-19)
- **JSON `type`:** `lesson_started`
- **Screenshot:** `screenshots/b4-019-lesson-started.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Lesson started` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Lesson Started` | yes | `name` | |
| Product / Category / Lesson filters | optional custom filters | Memberships/Courses catalogs | no filters | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id010> kind=trigger -->
```json
{"id":"<id010>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"lesson_started","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Lesson Started","schedule_config":{}}
```

## Official runtime semantics

- Fires when a learner starts/opens a lesson. There is no dedicated article; the trigger roundup documents it and supports membership magic links in follow-up emails.
- Source: [HighLevel workflow trigger roundup](https://help.gohighlevel.com/support/solutions/articles/155000002292).
