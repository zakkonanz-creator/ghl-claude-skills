# Action: Create/Update Opportunity

- **UI name:** Create/update opportunity · **Category:** Opportunity · **Priority:** CORE
- **JSON `type`:** `create_opportunity` · **Screenshots:** `117-opp-panel.png`, `118-opp-configured.png`, `screenshots/b8-013-r3-create-update-opportunity-duplicates.png`
- **Premium:** no · **⚠️ DEPRECATION NOTICE:** GHL will soon split this into separate **"Create Opportunity"** and **"Update Opportunity"** actions (the two legacy items in the census). Existing workflows unaffected. Prefer the split actions going forward — but `create_opportunity` still works and is what this combined action writes.

## Fields
| UI label | Input | Options / source | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| IN PIPELINE | dropdown | **location pipelines** | `attributes.pipeline_id` | required; location-dependent |
| IN PIPELINE STAGE | dropdown | stages of the chosen pipeline | `attributes.pipeline_stage_id` | required |
| OPPORTUNITY NAME | text (+merge) | free | `attributes.opportunity_name` | |
| OPPORTUNITY SOURCE | text (+merge) | free | `attributes.opportunity_source` | "empty → unchanged on update, or contact's source on create" |
| OPPORTUNITY VALUE | text (+merge) | number | `attributes.monetary_value` | (below fold) |
| STATUS | dropdown (below fold) | open / won / lost / abandoned | `attributes.opportunity_status` (`"open"` — production-corpus verified) | Not selected in the R3 witness, so absent there; exact path/value is from production. |
| Add field | button (below fold) | opportunity custom fields | `attributes.fields[]` | repeatable |
| ALLOW OPPORTUNITY TO MOVE TO ANY PREVIOUS STAGE IN PIPELINE | toggle (below fold) | on/off | `attributes.allow_backward` (bool — production-corpus verified, `a production workflow` node with `allow_backward: true`) | Off/absent in the R3 witness; exact key is production-corpus verified. |
| ALLOW DUPLICATE OPPORTUNITIES | toggle (below fold) | on/off | `attributes.allow_multiple` (boolean) | Saved `true`; when off, the key is omitted. |

**Correction:** there is **NO "Owner" dropdown** in this panel (my earlier "(Status / Owner / more)" row asserted one that doesn't exist). The real below-fold controls are: STATUS dropdown, "Add field", and the two toggles above.

**Successor split actions (production-corpus shapes, for the deprecation transition):** `internal_create_opportunity` uses `{pipelineId, __customInputFields__:[{filterField:"name"|"pipelineStageId"|"monetaryValue"|"status"|"custom_fields.<id>", value, dataType, valueFieldType, __customInputs__}], __customInputs__}`; `internal_update_opportunity` adds top-level `allowBackward` (camelCase!) and status/lostReason via the same `__customInputFields__` filterField rows (e.g. `status:"lost"` + `lostReasonId:<id>`). Note the key-style shift: legacy `create_opportunity` = snake_case (`allow_backward`), split actions = camelCase + filterField encoding.

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000230 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000230",
  "parent": "00000000-0000-4000-8000-000000000231",
  "order": 0,
  "attributes": {
    "fields": [],
    "type": "create_opportunity",
    "pipeline_id": "<pipelineId>",
    "pipeline_stage_id": "00000000-0000-4000-8000-000000000168",
    "opportunity_name": "",
    "opportunity_source": "",
    "monetary_value": "",
    "allow_multiple": true
  },
  "name": "Create or update opportunity",
  "type": "create_opportunity",
  "parentKey": "00000000-0000-4000-8000-000000000231"
}
```

## Location-data-dependent
- Pipelines/stages → `GET /opportunities/pipelines?locationId={loc}` → `{pipelines:[{id,name,stages:[{id,name,position}]}]}`.
- Fixture created: pipeline `ZZZ-SPIKE-pipeline` id `<pipelineId>`, stage 1 id `00000000-0000-4000-8000-000000000168`.
- **pipeline_id / pipeline_stage_id are IDs** — engine must resolve name→id per location.

## Quirks
- STATUS enum: `"open"` verified (legacy action, corpus); `"lost"` verified on the split `internal_update_opportunity` (with `lostReasonId`); `won`/`abandoned` inferred from UI labels.
- Legacy **Allow duplicate opportunities** serializes as `attributes.allow_multiple:true`; it is not `allow_duplicates`, and the false/default state omits the key rather than saving `false`.
