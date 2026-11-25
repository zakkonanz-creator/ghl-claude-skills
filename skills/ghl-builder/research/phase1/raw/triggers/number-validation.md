# Trigger: Number validation

- **JSON `type`:** `validation_error` · **Screenshot:** `screenshots/b2-013-number-validation.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Number Validation` | yes | `name` | |
| Number is | optional filter | Mobile/SMS-capable; Landline; Invalid | none | no | `conditions[]` | Saved empty; enum condition JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id024> kind=trigger -->
```json
{"id":"<id024>","active":false,"conditions":[],"type":"validation_error","masterType":"highlevel","name":"Number Validation","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Fires when a contact is created and phone validation runs; it is driven by Phone integration validation settings, not Twilio/SMS errors. Source: https://help.gohighlevel.com/support/solutions/articles/155000003163
