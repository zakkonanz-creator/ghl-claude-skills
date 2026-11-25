# Trigger: Stale opportunities

- **UI name:** Stale opportunities · **Category:** Opportunities · **Priority:** LONG_TAIL
- **JSON `type`:** `opportunity_decay`
- **Screenshot:** `screenshots/b7-010-stale-opportunities.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Stale opportunities` | yes | `type:"opportunity_decay"` | UI name and JSON type differ. |
| WORKFLOW TRIGGER NAME | text input | free text | `Stale Opportunities` | yes | `name` | Canvas label. |
| FILTERS → field | repeatable searchable picker | Duration in days; Assigned to, Doesn't have tag, Expected close date, Forecast probability, Has tag, In pipeline, Lead value, Lost reason, Status; Pipeline stage appears after In pipeline is selected; custom fields | none | Duration is the defining filter | `conditions[]` | Representative save captures Duration, pipeline, and stage. |
| Duration in days | number input, minimum 0 | integer days | empty | yes | condition `field:"opportunity.lastActionDate"`, `operator:"time-diff-now-gte"`, numeric `value` | Captured 3; canvas renders “is at least 3 days.” |
| In pipeline | searchable select | location pipelines | empty | no | condition `field:"opportunity.pipelineId"`, `operator:"=="` | Captured pipeline ID. |
| Pipeline stage | searchable select | stages of selected pipeline | hidden until pipeline selected | no | condition `field:"opportunity.pipelineStageId"`, `operator:"=="` | Captured Stage 1 ID. |
| Add filters | button | adds another condition | none | no | another `conditions[]` element | Additional live-panel filters are field dependent. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=<id012> kind=trigger -->
```json
{
  "id": "<id012>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000190",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "operator": "time-diff-now-gte",
      "field": "opportunity.lastActionDate",
      "value": 3,
      "title": "Duration in days",
      "type": "number"
    },
    {
      "operator": "==",
      "field": "opportunity.pipelineId",
      "value": "<pipelineId>",
      "title": "In pipeline",
      "type": "select"
    },
    {
      "operator": "==",
      "field": "opportunity.pipelineStageId",
      "value": "00000000-0000-4000-8000-000000000168",
      "title": "Pipeline stage",
      "type": "select"
    }
  ],
  "type": "opportunity_decay",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000190",
  "location_id": "<locationId>",
  "name": "Stale Opportunities",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- In pipeline resolves location pipelines. Pipeline stage is conditionally exposed and resolves the selected pipeline's stage catalog. Both serialize IDs.
- User, tag, lost-reason, and custom-field filters depend on location catalogs.

## Runtime semantics and capture note

- “Stale” means the opportunity has remained in the same stage for the configured duration without progress or updates. Recent activity such as notes, email replies, or logged calls excludes it.
- The duration is not retroactive: counting starts when the trigger is added. Stage movement or an update resets it, and the opportunity can fire again after becoming stale again. Official documentation does not state the evaluation cadence.
- The panel was configured and its exact native payload was captured from the builder's successful `validate-assets` request. Because the same top-save defect had already produced no write on three attempts, the protocol fallback POSTed that captured payload; the server readback above is machine verified.
- The draft trigger remains `active:false`; the workflow was never published.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Stale opportunities), based on GHL article `155000002492`.
