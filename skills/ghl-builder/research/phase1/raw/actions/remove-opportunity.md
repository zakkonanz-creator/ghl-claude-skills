# Action: Remove Opportunity

- **UI name:** Remove opportunity · **Category:** Opportunity · **Priority:** CORE
- **JSON `type`:** `remove_opportunity` · **Screenshot:** `120-rm-opp-panel.png`, `121-rmopp-options.png`
- **Premium:** no · **Description:** "Choose to either remove all opportunities for the contact in the pipeline, or remove only the opportunity that triggered the workflow or was found in the previous action."

## Fields
| UI label | Input | Options | JSON path (VERIFIED) | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| OPPORTUNITY TO BE FOUND | dropdown ("Please Select") | **"All contact opportunities in the selected pipeline"** / **"Opportunity found or triggered in this workflow"** | `attributes.opportunity_to_be_found`: `"all"` / `"previous"` | required; both enum values verified from saved nodes |
| (IN PIPELINE) | dropdown (appears in "all" mode) | location pipelines | `attributes.pipeline_id` | present only in `"all"` mode; omitted from the saved `"previous"` variant |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000180 kind=action -->
```json
{
  "name": "zzz-spike Remove Opp",
  "type": "remove_opportunity",
  "attributes": {
    "type": "remove_opportunity",
    "pipeline_id": "<pipelineId>",
    "opportunity_to_be_found": "all"
  }
}
```
The fresh B8 native save proves that **"Opportunity found or triggered in this workflow" serializes as `"previous"`** and omits `pipeline_id` (`ZZZ-SPIKE-b8`, steps v18, node `00000000-0000-4000-8000-000000000329`; screenshot `b8-016-r6-remove-opportunity.png`). The sibling all-in-pipeline shape remains independently verified by the earlier lab node and the production corpus as `{type:"remove_opportunity", opportunity_to_be_found:"all", pipeline_id:<id>}`. Earlier inferred camelCase keys and enum guesses were incorrect.

## Location-data-dependent
- Pipeline (in "all" mode) → `GET /opportunities/pipelines?locationId={loc}`. Fixture: `ZZZ-SPIKE-pipeline` id `<pipelineId>`.

## Quirks
- Two removal modes: `"all"` carries `pipeline_id`; `"previous"` omits it.
