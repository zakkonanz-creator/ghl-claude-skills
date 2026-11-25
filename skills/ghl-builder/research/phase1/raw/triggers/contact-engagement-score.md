# Trigger: Contact engagement score

- **UI name:** Contact engagement score · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `contact_engagement_score`
- **Screenshot:** `screenshots/b3-005-contact-engagement-score.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text input | free text | `Contact Engagement Score` | yes | `name` | Canvas label. |
| FILTERS → field | searchable picker | `Score`; numeric location custom fields under Custom Fields (Enrolled Contact) | none | yes | `conditions[].field`, `title`, `id`, `type` | Lab catalog showed `zzz-spike-number`. |
| FILTERS → operator | dropdown | `Between`, `Equal to`, `Greater than`, `Greater than or equal to`, `Is empty`, `Is not empty`, `Less than`, `Less than or equal to`, `Not equal to` | none | yes | `conditions[].operator` | Representative `Greater than` stores `>`. |
| FILTERS → numeric value | number input | number | empty | conditional | `conditions[].value` | Representative value `10`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=<id056> kind=trigger -->
```json
{
  "id": "<id056>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000182",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": ">",
      "field": "score",
      "value": 10,
      "title": "Score",
      "type": "numerical",
      "id": "score"
    }
  ],
  "type": "contact_engagement_score",
  "masterType": "internal",
  "workflow_id": "00000000-0000-4000-8000-000000000182",
  "location_id": "<locationId>",
  "name": "Contact Engagement Score",
  "belongs_to": "workflow",
  "workflowsTriggerType": "INTERNAL",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- The filter picker exposes compatible contact custom fields from the location; the numeric lab fixture was `zzz-spike-number`.

## Quirks

- Unlike most native contact triggers, this is internally classified with `masterType:"internal"` and `workflowsTriggerType:"INTERNAL"`.
- The saved numeric value is a JSON number, not a numeric string.
- The draft trigger remains `active:false`; the workflow was not published.
