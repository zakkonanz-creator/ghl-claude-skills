# Trigger: Opportunity status changed

- **UI name:** Opportunity status changed · **Category:** Opportunities · **Priority:** CORE
- **JSON `type`:** `opportunity_status_changed`
- **Screenshot:** `screenshots/codex-009-opportunity-status-changed.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Opportunity status changed` | yes | `type:"opportunity_status_changed"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Opportunity Status Changed` | yes | `name` | |
| FILTERS → field | dropdown | `Assigned to`; `Expected close date`; `Forecast probability`; `In pipeline`; `Lead value`; `Lost reason`; `Moved from status`; `Moved to status`; `Tag`; Opportunity custom field (`No data available`); Custom field → `zzz_spike_field` | none | **at least Moved from/to status is required** | `conditions[]` | Panel rejects pipeline-only config with “Opportunity Status filter is required.” |
| In pipeline | select | location pipelines; observed `ZZZ-SPIKE-pipeline` | none | no | `field:"opportunity.pipelineId"`, `operator:"=="`, value pipeline ID | |
| Moved to status / Moved from status | select | `Open`, `Won`, `Lost`, `Abandoned` | none | one status-direction filter required | `field:"opportunity.status"`, `operator:"=="`, lower-case value; direction identified by `id` | Captured Moved to Won. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id032> kind=trigger -->

```json
{
  "id": "<id032>",
  "active": false,
  "conditions": [
    { "operator": "==", "field": "opportunity.pipelineId", "value": "<pipelineId>", "title": "In pipeline", "type": "select" },
    { "operator": "==", "field": "opportunity.status", "value": "won", "title": "Moved to status", "type": "select", "id": "moved-to-status" }
  ],
  "type": "opportunity_status_changed",
  "masterType": "highlevel",
  "name": "Opportunity Status Changed",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In pipeline → `GET backend.leadconnectorhq.com/opportunities/pipelines?locationId={locationId}`. JSON stores pipeline ID.
- Assigned to → location users; Tag → location tags.
- Opportunity custom field catalog returned no data in this lab; contact Custom field showed `zzz_spike_field`.

## Quirks

- A status direction is mandatory even though the trigger itself is named “status changed.”
- `Moved to status` and `Moved from status` share `field:"opportunity.status"`; the condition `id` distinguishes direction.
