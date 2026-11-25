# Trigger: External tracking event

- **JSON `type`:** `external_tracking` · **Screenshot:** `screenshots/b2-006-external-tracking-event.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `External Tracking Event` | yes | `name` | |
| Add filters | conditional filter builder | Event flavor, Domain, Page path, External form name, UTM parameters | none | no | `conditions[]` | Saved empty; conditional JSON is uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id004> kind=trigger -->
```json
{"id":"<id004>","active":false,"conditions":[],"type":"external_tracking","masterType":"internal","name":"External Tracking Event","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Requires the External Tracking script on the external site. Page View may be anonymous; Form Submission contact matching needs an EMAIL input. Iframe forms/widgets without real form inputs are unsupported. Source: https://help.gohighlevel.com/support/solutions/articles/155000006092
