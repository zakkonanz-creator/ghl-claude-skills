# Trigger: Opportunity changed

- **UI name:** Opportunity changed · **Category:** Opportunities · **Priority:** LONG_TAIL
- **JSON `type`:** `opportunity_changed`
- **Screenshot:** `screenshots/b7-008-opportunity-changed.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Opportunity changed` | yes | `type:"opportunity_changed"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Opportunity Changed` | yes | `name` | Canvas label. |
| FILTERS → field | repeatable searchable picker | Assigned to, Expected close date, Forecast probability, In pipeline, Lead value, Lost reason, Status, Tag; Opportunity custom fields; compatible contact Custom fields | none | no | `conditions[]` | Official docs additionally describe checkbox/radio/dropdown/date custom-field filters. |
| FILTERS → operator | field-dependent dropdown | For In pipeline: Equals, Has changed, Has changed to; other fields expose type-appropriate operators | none | conditional | `conditions[].operator` | Representative Equals serializes `==`. Officially Status supports Is, Is Not, Has Changed, Has Changed To, and Equals. |
| FILTERS → value | field-dependent input | location catalog or literal | empty | conditional | `conditions[].value` | Representative pipeline choice stores its ID. |
| Add filters | button | adds another condition | none | no | another `conditions[]` element | Conditions are saved as an array. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=<id090> kind=trigger -->
```json
{
  "id": "<id090>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000190",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": "==",
      "field": "opportunity.pipelineId",
      "value": "<pipelineId>",
      "title": "In pipeline",
      "type": "select"
    }
  ],
  "type": "opportunity_changed",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000190",
  "location_id": "<locationId>",
  "name": "Opportunity Changed",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In pipeline resolves location pipelines and stores the pipeline ID; the representative condition uses `ZZZ-SPIKE-pipeline`.
- Assigned to, Tag, Lost reason, and custom fields depend on their respective location catalogs.

## Runtime semantics and quirks

- This broad trigger fires for any opportunity change, including value, stage movement, reassignment, custom fields, and status; it is broader than Opportunity status changed.
- Newly added filter capabilities are backward compatible: existing workflows retain their behavior unless manually updated.
- The draft trigger remains `active:false`; the workflow was never published.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Opportunity changed), based on GHL article `155000000886`.
