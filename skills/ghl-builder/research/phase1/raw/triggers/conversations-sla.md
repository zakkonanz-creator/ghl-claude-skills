# Trigger: Conversations SLA

- **UI name:** Conversations SLA · **JSON `type`:** `conversations_sla`
- **Screenshot:** `b1-002-conversations-sla.png` · **Premium:** no

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | `name` | Saved default |
| SLA status | select | `conditions[]` where `field=slaStatus` | UI options: Due soon, Overdue, SLA dismissed; saved Due soon (`sla_due`) |
| Avoid repeated triggers | select | `conditions[]` where `field=avoidRepeatedTriggers` | Saved Yes; once per conversation per 24 hours |
| Add filters | repeatable filter UI | `conditions[]` | Available fields observed: Message channel, Owner, Tags, enrolled-contact custom fields; not captured because representative status + dedupe conditions were selected |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=<id077> kind=trigger -->
```json
{
  "name": "Conversations SLA",
  "type": "conversations_sla",
  "masterType": "internal",
  "conditions": [
    {
      "operator": "==",
      "field": "slaStatus",
      "value": "sla_due",
      "title": "SLA status",
      "type": "select",
      "id": "slaStatus"
    }
  ],
  "schedule_config": {}
}
```

The saved trigger also contains the `avoidRepeatedTriggers=yes` condition with `ignoreConditionMatch: true`. Conversation SLAs must first be configured in the location. Workflow remains Draft/unpublished.
