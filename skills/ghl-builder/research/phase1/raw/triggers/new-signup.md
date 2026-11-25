# New signup

- **UI name:** New signup · **Category:** Courses · **Priority:** LONG_TAIL (B4-20)
- **JSON `type`:** `membership_contact_created`
- **Screenshot:** `screenshots/b4-020-new-signup.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed selector | `New signup` | selected | yes | `type` | |
| WORKFLOW TRIGGER NAME | text | free text | `New Signup` | yes | `name` | |
| Offer | optional custom filter | Memberships Offers catalog | no filter | no | inferred / uncaptured | Location-dependent; Add filters. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id065> kind=trigger -->
```json
{"id":"<id065>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"membership_contact_created","masterType":"highlevel","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"New Signup","schedule_config":{}}
```

## Official runtime semantics

- Fires only on the first purchase/signup for a membership offer, service, product, or Community Group. If access was already granted by any other method, it does not fire and cannot re-trigger for that contact.
- Workflow Trigger Name is mandatory; Offer is optional. Source: [HighLevel New Signup](https://help.gohighlevel.com/support/solutions/articles/155000003098).
