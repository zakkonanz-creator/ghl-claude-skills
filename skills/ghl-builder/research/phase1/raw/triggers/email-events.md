# Trigger: Email events

- **JSON `type`:** `mailgun_email_event` · **Screenshot:** `screenshots/b2-005-email-events.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Email Events` | yes | `name` | |
| FILTERS → field | dropdown | Event; In workflow; location custom fields | none | no | `conditions[]` | |
| Event | dropdown | Bounced; Clicked; Complained(SPAM); Opened; Unsubscribed | none | yes when selected | `conditions[].field="mailgun.event"`, `value` | `Opened` saved. |
| In workflow | location workflow picker | workflow catalog | none | yes when selected | `conditions[]` | Conditional JSON uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id079> kind=trigger -->
```json
{"id":"<id079>","active":false,"conditions":[{"operator":"==","field":"mailgun.event","value":"opened","title":"Event","type":"select"}],"type":"mailgun_email_event","masterType":"highlevel","name":"Email Events","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Supported events are Clicked, Opened, Bounced, Unsubscribed, and Complained/spam. “Email not opened” is not supported; reminders need separate workflow logic. Source: https://help.gohighlevel.com/support/solutions/articles/155000002678
