# Trigger: LinkedIn lead form submitted

- **JSON `type`:** `linkedin_form_submitted` · **Screenshot:** `screenshots/b2-010-linkedin-lead-form-submitted.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `LinkedIn Lead Form Submitted` | yes | `name` | |
| Page filter | integration-backed filter | Is; Contains Phrase; Does Not Contain; Is Empty; Is Not Empty | none | no | `conditions[]` | Saved empty; connected Page JSON uncaptured. No form-level filter exists. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id098> kind=trigger -->
```json
{"id":"<id098>","active":false,"conditions":[],"type":"linkedin_form_submitted","masterType":"internal","name":"LinkedIn Lead Form Submitted","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Requires LinkedIn Lead Ads access to the Page and Ad Account, a published Lead Gen Form, and field mapping. Multiple Page filters are ANDed; dedup uses email/phone. Source: https://help.gohighlevel.com/support/solutions/articles/155000003497
