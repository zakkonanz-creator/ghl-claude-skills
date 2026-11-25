# Product access removed

- **UI name:** Product access removed · **Category:** Courses · **Priority:** LONG_TAIL (B4-24)
- **JSON `type`:** `product_access_removed`
- **Screenshot:** `screenshots/b4-024-product-access-removed.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Product access removed` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Product Access Removed` | yes | `name` | |
| Product | optional custom filter | Memberships products | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id067> kind=trigger -->
```json
{"id":"<id067>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"product_access_removed","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Product Access Removed","schedule_config":{}}
```

## Official runtime semantics

- Fires each time access to a selected individual product is revoked; no native dedup is documented. Source: [HighLevel Product Access Removed](https://help.gohighlevel.com/support/solutions/articles/155000003257).
