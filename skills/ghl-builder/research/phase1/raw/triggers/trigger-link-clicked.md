# Trigger: Trigger link clicked

- **JSON `type`:** `trigger_link` · **Screenshot:** `screenshots/b2-019-trigger-link-clicked.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Trigger Link Clicked` | yes | `name` | |
| Trigger link | location trigger-link picker | pre-created Trigger Links | none | required for targeted execution | `conditions[]` | Saved empty; production corpus confirms `field:"link.id"`, `operator:"=="`, ID value. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id073> kind=trigger -->
```json
{"id":"<id073>","active":false,"conditions":[],"type":"trigger_link","masterType":"highlevel","name":"Trigger Link Clicked","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- The exact trigger link must exist under Trigger Links before it can be selected. Official docs do not address bot/scanner false clicks. Source: https://help.gohighlevel.com/support/solutions/articles/155000003263
- Production corpus was checked before documenting the ID shape.
