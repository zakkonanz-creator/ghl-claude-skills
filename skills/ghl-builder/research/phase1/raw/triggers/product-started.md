# Product started

- **UI name:** Product started · **Category:** Courses · **Priority:** LONG_TAIL (B4-26)
- **JSON `type`:** `product_started`
- **Screenshot:** `screenshots/b4-026-product-started.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Product started` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Product Started` | yes | `name` | |
| Product | optional filter | Courses products | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id028> kind=trigger -->
```json
{"id":"<id028>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"product_started","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Product Started","schedule_config":{}}
```

## Official runtime semantics

- Fires when a learner starts a product/course. There is no dedicated article beyond the trigger roundup; membership magic links are supported in follow-up emails. Source: [HighLevel workflow trigger roundup](https://help.gohighlevel.com/support/solutions/articles/155000002292).
