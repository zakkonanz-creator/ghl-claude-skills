# Trigger: Prospect generated

- **JSON `type`:** `new_prospect_received_workflow` · **Screenshot:** `screenshots/b2-014-prospect-generated.png` · **Premium:** no explicit paywall

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Prospect Generated` | yes | `name` | |
| Add filters | conditional builder | Source (in-app/widget/AI); Conversion Rate | none | no | `conditions[]` | Saved empty; exact variant JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id039> kind=trigger -->
```json
{"id":"<id039>","active":false,"conditions":[],"type":"new_prospect_received_workflow","masterType":"internal","name":"Prospect Generated","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Fires after a Prospecting Tool, embedded widget, or Prospect AI prospect is received and its web-report links are generated. Source: https://help.gohighlevel.com/support/solutions/articles/155000004634
