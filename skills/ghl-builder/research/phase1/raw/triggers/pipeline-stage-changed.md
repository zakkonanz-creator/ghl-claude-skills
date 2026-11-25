# Trigger: Pipeline stage changed

- **UI name:** Pipeline stage changed · **Category:** Opportunities · **Priority:** CORE
- **JSON `type`:** `pipeline_stage_updated`
- **Screenshot:** `screenshots/codex-010-pipeline-stage-changed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Pipeline stage changed` | yes | `type:"pipeline_stage_updated"` | UI and JSON names differ. |
| WORKFLOW TRIGGER NAME | text input | free text | `Pipeline Stage Changed` | yes | `name` | |
| FILTERS → field | dropdown | `Assigned to`; `Expected close date`; `Forecast probability`; `In pipeline`; `Lead value`; `Lost reason`; `Status`; `Tag`; Opportunity custom field (`No data available`); Custom field → `zzz_spike_field` | none | no | `conditions[]` | There is no “Pipeline stage” filter; the stage transition is the trigger event itself. |
| In pipeline | select | location pipelines; observed `ZZZ-SPIKE-pipeline` | none | yes when used | `field:"opportunity.pipelineId"`, `operator:"=="`, pipeline ID value | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id020> kind=trigger -->

```json
{
  "id": "<id020>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "opportunity.pipelineId",
      "value": "<pipelineId>",
      "title": "In pipeline",
      "type": "select"
    }
  ],
  "type": "pipeline_stage_updated",
  "masterType": "highlevel",
  "name": "Pipeline Stage Changed",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In pipeline → opportunities pipeline endpoint; JSON stores pipeline ID `<pipelineId>` for `ZZZ-SPIKE-pipeline`.
- Assigned to → users; Tag → tags; custom fields → opportunity/contact custom-field catalogs.

## Quirks

- UI label `Pipeline stage changed` maps to type `pipeline_stage_updated`.
- The engine does not specify from/to stages in the trigger config; it filters the stage-change event by opportunity attributes such as pipeline/status.
