# Trigger: Facebook lead form submitted

- **JSON `type`:** `facebook_lead_gen` · **Screenshot:** `screenshots/b2-007-facebook-lead-form-submitted.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Facebook Lead Form Submitted` | yes | `name` | |
| Page / Form filters | integration-backed selects | connected Facebook Pages and mapped lead forms | Any | no | `conditions[]` | Saved empty/Any; exact connected-ID JSON uncaptured because no Page was connected. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id074> kind=trigger -->
```json
{"id":"<id074>","active":false,"conditions":[],"type":"facebook_lead_gen","masterType":"highlevel","name":"Facebook Lead Form Submitted","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Runtime prerequisites: Facebook integration, connected Page, and lead-form field mapping. One form per filter; multiple forms require separate triggers/workflows. No filters means all connected Pages/forms. Source: https://help.gohighlevel.com/support/solutions/articles/155000003095
