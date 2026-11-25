# Trigger: Opportunity created

- **UI name:** Opportunity created · **Category:** Opportunities · **Priority:** LONG_TAIL
- **JSON `type`:** `opportunity_created`
- **Screenshot:** `screenshots/b7-009-opportunity-created.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Opportunity created` | yes | `type:"opportunity_created"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Opportunity Created` | yes | `name` | Canvas label. |
| FILTERS → field | repeatable searchable picker | Assigned to, Expected close date, Forecast probability, In pipeline, Lead value, Lost reason, Status, Tag; Opportunity custom fields; compatible contact Custom fields | none | no | `conditions[]` | Live panel catalog. Officially documented core filters are Assigned To, Pipeline, Lead Value, Status, Has Tag, and Lost Reason. |
| FILTERS → operator | field-dependent dropdown | field-specific; Has Tag supports Equals, Not equals, Any of, None of | none | conditional | uncaptured `conditions[].operator` | The verified no-filter variant intentionally has an empty array because every filter is optional. |
| FILTERS → value | field-dependent input | location catalog or literal | empty | conditional | uncaptured `conditions[].value` | Pipeline/user/tag/lost-reason/custom-field choices are location dependent. |
| Add filters | button | adds another condition | none | no | another `conditions[]` element | No filters means every new opportunity enrolls. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=<id097> kind=trigger -->
```json
{
  "id": "<id097>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000190",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [],
  "type": "opportunity_created",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000190",
  "location_id": "<locationId>",
  "name": "Opportunity Created",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Assigned to, In pipeline, Tag, Lost reason, and custom-field values resolve their location catalogs when filters are configured.

## Runtime semantics and capture note

- All filters are optional. With `conditions:[]`, every newly logged opportunity fires the trigger.
- Official documentation does not distinguish whether manual, API-created, or workflow-created opportunities differ as sources.
- The panel was configured and its native local payload was captured from the builder's `validate-assets` request. After three top-save attempts emitted no network write, the WORKER protocol's fallback was used to POST that exact native payload; the resulting trigger was then read back and machine-verified.
- The draft trigger remains `active:false`; the workflow was never published.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Opportunity created), based on GHL article `155000003499`.
