# Trigger: Inbound email

- **JSON `type`:** `inbound_trigger` · **Screenshot:** `screenshots/b2-009-inbound-email.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Inbound Email` | yes | `name` | |
| Email sent to / Mailbox | operator + text | Equals; Is any of; Contains; Does not contain | none | yes in the default row | `conditions[]` | `zzz@example.com` saved. |
| Add filters | conditional builder | From, CC, Subject, Body, Has Attachments, Replied to Workflow, Contact Tag | none | no | `conditions[]` | Exact variants uncaptured. |
| Trigger only for new email conversations | switch | off/on | off | no | inferred / uncaptured | Saved off and omitted from JSON. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id072> kind=trigger -->
```json
{"id":"<id072>","active":false,"conditions":[{"operator":"==","field":"message.type","value":3,"title":"Reply channel","type":"select"},{"operator":"==","field":"email.to","value":"zzz@example.com","title":"Email sent to / Mailbox","type":"string"}],"type":"inbound_trigger","masterType":"highlevel","name":"Inbound Email","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Fires for any inbound email, including unknown-sender cold email where supported. Cold-email capture requires an LC Email or Mailgun dedicated domain; other connections only capture existing-contact mail. Replies can also fire Customer Replied. Source: https://help.gohighlevel.com/support/solutions/articles/155000007650
