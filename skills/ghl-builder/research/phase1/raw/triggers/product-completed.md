# Product completed

- **UI name:** Product completed · **Category:** Courses · **Priority:** LONG_TAIL (B4-25)
- **JSON `type`:** `product_completed`
- **Screenshot:** `screenshots/b4-025-product-completed.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Product completed` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Product Completed` | yes | `name` | |
| Product | optional filter | Courses products; `Is any of`/`Is none of` | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id019> kind=trigger -->
```json
{"id":"<id019>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"product_completed","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Product Completed","schedule_config":{}}
```

## Official runtime semantics

- Fires each time a customer completes a course product; the exact completion threshold is undocumented. Product supports `Is any of`/`Is none of`; use conditions/cooldowns for repeated completions. Source: [HighLevel Product Completed](https://help.gohighlevel.com/support/solutions/articles/155000003258).
