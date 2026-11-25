# Action: Update opportunity (new split action)

- **UI name:** Update opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal_update_opportunity`
- **Screenshot:** `screenshots/b7-007-update-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Update opportunity` | no | top-level `name` | Canvas label. |
| ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE | toggle | off / on | off | no | `attributes.allowBackward` | Captured on (`true`). Officially, backward stage movement is disabled by default. |
| Duplicate opportunity | read-only status pill | observed `Disabled` | location display | no | uncaptured: officially non-functional for this action and emits no saved key | Do not implement or infer a duplicate-control key for Update opportunity. |
| FIELDS → field | repeatable searchable select | Standard Fields: Pipeline, Opportunity Name, Pipeline Stage, Opportunity Value, Status, Opportunity Source, Lost Reason, Expected Close Date, Forecast Probability; plus Custom Fields | none | at least one practical update target | `attributes.__customInputFields__[].filterField` | Add field creates a field/value pair; the representative save captures Pipeline and Pipeline Stage. |
| Pipeline → value | searchable select | location pipelines | empty | conditional | matching entry `.value`; `dataType:"SINGLE_OPTIONS"`, `valueFieldType:"select"` | Captured `ZZZ-SPIKE-pipeline`; stores pipeline ID. |
| Opportunity Name → value | text/merge-value input | free text or merge field | empty | conditional | uncaptured matching `__customInputFields__` entry | Available in live panel and officially updatable; exact serialized entry was not saved in the representative variant. |
| Pipeline Stage → value | searchable select | stages for selected pipeline | first stage after Pipeline selection (`ZZZ Stage 1`) | conditional | matching entry `.value`; `dataType:"SINGLE_OPTIONS"`, `valueFieldType:"select"` | Stores stage ID. |
| Opportunity Value → value | numeric/merge-value input | number or merge field | empty | conditional | uncaptured matching `__customInputFields__` entry | Officially updatable; exact serialized entry was not saved in the representative variant. |
| Status → value | select | Open, Won, Lost, Abandoned observed in live field controls | empty | conditional | uncaptured matching `__customInputFields__` entry | Official article documents Open/Won/Lost. Lost enables Lost Reason; representative save did not capture this field. |
| Opportunity Source → value | text/merge-value input | free text or merge field | empty | conditional | uncaptured matching `__customInputFields__` entry | Officially updatable; exact serialized entry was not saved in the representative variant. |
| Lost Reason → value | select | location lost-reason catalog | disabled until Status = Lost | conditional | uncaptured matching `__customInputFields__` entry | Conditional live-panel variant was enumerated but not saved. |
| Expected Close Date → value | date/merge-value input | date or merge field | empty | conditional | uncaptured matching `__customInputFields__` entry | Live-panel field; exact serialization was not captured. |
| Forecast Probability → value | numeric/merge-value input | probability or merge field | empty | conditional | uncaptured matching `__customInputFields__` entry | Live-panel field; exact serialization was not captured. |
| Custom Fields → value | field-type dependent | location opportunity custom fields | empty | conditional | uncaptured `__customInputFields__` entry | Location dependent; representative save uses standard fields only. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000278 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000278",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 2,
  "attributes": {
    "allowBackward": true,
    "type": "internal_update_opportunity",
    "__customInputFields__": [
      {
        "__customInputs__": {},
        "dataType": "SINGLE_OPTIONS",
        "filterField": "pipelineId",
        "value": "<pipelineId>",
        "valueFieldType": "select"
      },
      {
        "__customInputs__": {},
        "dataType": "SINGLE_OPTIONS",
        "filterField": "pipelineStageId",
        "value": "00000000-0000-4000-8000-000000000168",
        "valueFieldType": "select"
      }
    ],
    "__customInputs__": {}
  },
  "name": "Update opportunity",
  "type": "internal_update_opportunity",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000241"
}
```

## Location-data-dependent fields

- Pipeline and Pipeline Stage values come from the location opportunity pipeline catalog and serialize as IDs.
- Lost Reason and Custom Fields depend on location catalogs; their concrete entries were not selected in the representative save.

## Quirks and runtime semantics

- This is the new split Update action. It never creates an opportunity: it updates the opportunity returned by a preceding Find Opportunity action, otherwise the opportunity that triggered the workflow. With neither context, the action is silently skipped.
- Updatable core fields are pipeline, stage, status, source, value, and name; they support merge fields. Owner is not changeable here—use the dedicated owner actions.
- Backward stage movement defaults off and serializes as `allowBackward`; the representative variant explicitly exercises the on state.
- The visible “Duplicate opportunity” control is officially non-functional for this action. It produced no JSON key and must not be modeled as one.
- The deprecated combined Create/Update action has different matching behavior: it does not update the triggering opportunity and ignores Find Opportunity results.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Update opportunity), based on GHL articles `155000004753` and `155000002476`.
