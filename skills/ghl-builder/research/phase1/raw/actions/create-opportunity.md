# Action: Create opportunity (new split action)

- **UI name:** Create opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `internal_create_opportunity`
- **Screenshot:** `screenshots/b7-003-create-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Create opportunity` | no | top-level `name` | Canvas label. |
| PIPELINE | searchable select | location pipelines | first/selected pipeline; lab showed `ZZZ-SPIKE-pipeline` | yes | `attributes.pipelineId` | Stores pipeline ID. |
| Duplicate opportunity | read-only status pill | location opportunity setting; observed `Disabled` | location setting | no | not persisted; explicitly uncaptured because it is informational | The panel explains that when duplicates are disabled, an existing opportunity in the same pipeline prevents execution. |
| FIELDS → field | repeatable searchable select | Standard Fields: Opportunity Name, Pipeline Stage, Opportunity Value, Status, Opportunity Source, Lost Reason, Expected Close Date, Forecast Probability; plus location Custom Fields | none | no | `attributes.__customInputFields__[].filterField` | Add field creates a field/value pair. |
| Pipeline Stage → value | select | stages belonging to selected pipeline | first stage (`ZZZ Stage 1`) | no | matching entry `.value`; `dataType:"SINGLE_OPTIONS"`, `valueFieldType:"select"` | Stores stage ID. |
| Opportunity Name → value | text/merge-value input | free text or custom value | empty | no | matching entry `.value`; `dataType:"TEXT"`, `valueFieldType:"string"` | Captured `zzz-spike-b7 opportunity`. |
| Opportunity Value → value | numeric/merge-value input | number or custom value | empty | no | matching entry in `__customInputFields__` | Exact `dataType` not captured in the saved representative variant. |
| Status → value | select | Open, Won, Lost, Abandoned | empty | no | matching entry `.value`; saved `open` | Selecting Lost enables Lost Reason. |
| Opportunity Source → value | text/merge-value input | free text or custom value | empty | no | matching entry in `__customInputFields__` | Exact `dataType` not captured in the saved representative variant. |
| Lost Reason → value | select | location lost-reason catalog | disabled until Status = Lost | conditional | matching entry in `__customInputFields__` | Conditional variant enumerated from the live panel; uncaptured because saved Status is Open. |
| Expected Close Date → value | date/merge-value input | date/custom value | empty | no | matching entry in `__customInputFields__` | Exact serialized value not captured in the saved representative variant. |
| Forecast Probability → value | numeric/merge-value input | probability/custom value | empty | no | matching entry in `__customInputFields__` | Exact serialized value not captured in the saved representative variant. |
| Custom Fields → value | field-type dependent | location opportunity custom fields | empty | no | `filterField:"custom_fields.{fieldId}"` in `__customInputFields__` | Location dependent; representative variant uses standard fields only. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000311 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000311",
  "order": 2,
  "attributes": {
    "pipelineId": "<pipelineId>",
    "type": "internal_create_opportunity",
    "__customInputFields__": [
      {
        "__customInputs__": {},
        "dataType": "SINGLE_OPTIONS",
        "filterField": "pipelineStageId",
        "value": "00000000-0000-4000-8000-000000000168",
        "valueFieldType": "select"
      },
      {
        "__customInputs__": {},
        "dataType": "TEXT",
        "filterField": "name",
        "value": "zzz-spike-b7 opportunity",
        "valueFieldType": "string"
      },
      {
        "__customInputs__": {},
        "dataType": "SINGLE_OPTIONS",
        "filterField": "status",
        "value": "open",
        "valueFieldType": "select"
      }
    ],
    "__customInputs__": {}
  },
  "name": "Create opportunity",
  "type": "internal_create_opportunity",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000292"
}
```

## Location-data-dependent fields

- PIPELINE and Pipeline Stage come from the location opportunity pipeline catalog (`GET /opportunities/pipelines?locationId={locationId}`); resolve pipeline and stage names to IDs.
- Custom Fields and Lost Reason are location catalogs. Their concrete values were not selected in the representative saved node.

## Quirks

- This is the new split Create action, not deprecated `create_opportunity`. It uses camelCase `pipelineId` and the generic `__customInputFields__` array.
- Field order is preserved in `__customInputFields__`.
- Status labels serialize lowercase (`Open` → `open`).
- Official defaults when fields are omitted: Pipeline is mandatory; Stage uses the pipeline's first stage; Opportunity Name uses the contact name; Source is empty; Status is Open; Value is 0.
- When duplicate opportunities are disabled in location settings, deduplication is by associated contact ID, not opportunity name. The action requires an associated contact and cannot create from webhook data that lacks contact information.
- This is one half of the new split replacing the deprecated combined Create/Update Opportunity action; existing workflows using the old action remain compatible.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Create opportunity), based on GHL article `155000004752`.
