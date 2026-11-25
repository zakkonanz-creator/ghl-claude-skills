# Trigger: Messaging error - SMS

- **JSON `type`:** `messaging_errors` · **Screenshot:** `screenshots/b2-011-messaging-error-sms.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Messaging Error - SMS` | yes | `name` | |
| Add filters | conditional filter builder | SMS delivery error codes | none | no | `conditions[]` | Saved empty; exact error-code condition JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id034> kind=trigger -->
```json
{"id":"<id034>","active":false,"conditions":[],"type":"messaging_errors","masterType":"internal","name":"Messaging Error - SMS","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Fires for outbound SMS non-delivery codes such as 30007, 30005, 30004, 21610, 21614, and 30037. Source: https://help.gohighlevel.com/support/solutions/articles/155000003201
