# Trigger: Click to WhatsApp ads

- **JSON `type`:** `whatsapp_referral` · **Screenshot:** `screenshots/b2-002-click-to-whatsapp-ads.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Click To WhatsApp Ads` | yes | `name` | |
| Add filters | conditional filter builder | Ad/Post ID + URL; Headline; Source Type (ad or Page CTA) | none | no | `conditions[]` | Saved empty; exact conditional JSON is uncaptured because the lab has no WhatsApp ad referral fixture. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id037> kind=trigger -->
```json
{"id":"<id037>","active":false,"conditions":[],"type":"whatsapp_referral","masterType":"internal","name":"Click To WhatsApp Ads","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Runtime semantics

- Fires when a WhatsApp conversation starts from a Click-to-WhatsApp ad or Facebook Page WhatsApp CTA. It opens a 72-hour free entry-point window; reply within 24 hours to stay free, after which paid templates are required. WhatsApp add-on setup is a runtime prerequisite. Source: https://help.gohighlevel.com/support/solutions/articles/155000005602
- Saved in Draft; never published or executed.
