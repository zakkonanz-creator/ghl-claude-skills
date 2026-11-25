# Offer access removed

- **UI name:** Offer access removed · **Category:** Courses · **Priority:** LONG_TAIL (B4-22)
- **JSON `type`:** `offer_access_removed`
- **Screenshot:** `screenshots/b4-022-offer-access-removed.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Offer access removed` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Offer Access Removed` | yes | `name` | |
| Offer | optional custom filter | Memberships Offers catalog | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id023> kind=trigger -->
```json
{"id":"<id023>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"offer_access_removed","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Offer Access Removed","schedule_config":{}}
```

## Official runtime semantics

- Fires whenever access to a specific offer is revoked; repeated revoke events are not natively deduplicated. Source: [HighLevel Offer Access Removed](https://help.gohighlevel.com/support/solutions/articles/155000003251).
