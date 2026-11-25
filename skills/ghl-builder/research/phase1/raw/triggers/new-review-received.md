# Trigger: New review received

- **JSON `type`:** `reputation_review_received` · **Screenshot:** `screenshots/b2-012-new-review-received.png` · **Premium:** no · **Contactless:** yes

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `New Review Received` | yes | `name` | |
| Add filters | conditional builder | Review Rating 1-5; Review Source Google/Facebook; Review SPAM | none | no | `conditions[]` | Saved empty; conditional JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id078> kind=trigger -->
```json
{"id":"<id078>","active":false,"conditions":[],"type":"reputation_review_received","masterType":"internal","name":"New Review Received","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Reviews are not associated to contacts, but review details are available to downstream actions/webhooks. GBP/Facebook must be connected in Reputation for real events. Source: https://help.gohighlevel.com/support/solutions/articles/155000003873
