# Product access granted

- **UI name:** Product access granted · **Category:** Courses · **Priority:** LONG_TAIL (B4-23)
- **JSON `type`:** `product_access_granted`
- **Screenshot:** `screenshots/b4-023-product-access-granted.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Product access granted` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Product Access Granted` | yes | `name` | |
| Product | optional custom filter | Memberships products; operators include `is any of` | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id011> kind=trigger -->
```json
{"id":"<id011>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"product_access_granted","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Product Access Granted","schedule_config":{}}
```

## Official runtime semantics

- Fires each time access to an individual course product is granted, distinct from offer-bundle access; at least one Memberships product is prerequisite. Source: [HighLevel Product Access Granted](https://help.gohighlevel.com/support/solutions/articles/155000003256).
