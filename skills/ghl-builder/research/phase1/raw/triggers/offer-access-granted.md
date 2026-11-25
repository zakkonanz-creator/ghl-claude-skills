# Offer access granted

- **UI name:** Offer access granted · **Category:** Courses · **Priority:** LONG_TAIL (B4-21)
- **JSON `type`:** `offer_access_granted`
- **Screenshot:** `screenshots/b4-021-offer-access-granted.png`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `Offer access granted` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `Offer Access Granted` | yes | `name` | |
| Offer | optional custom filter | Memberships Offers catalog | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id084> kind=trigger -->
```json
{"id":"<id084>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"offer_access_granted","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Offer Access Granted","schedule_config":{}}
```

## Official runtime semantics

- Fires whenever access to a selected offer bundle is granted, including repeated grants; there is no native dedup. Source: [HighLevel Offer Access Granted](https://help.gohighlevel.com/support/solutions/articles/155000003250).
