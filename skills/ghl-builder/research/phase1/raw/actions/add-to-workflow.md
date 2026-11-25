# Action: Add To Workflow

- **UI name:** Add to workflow · **Category:** Internal · **Priority:** CORE
- **JSON `type`:** `add_to_workflow` · **Screenshot:** `095-add-to-wf-panel.png`
- **Premium:** no · **Description:** "Adds the Contact to another workflow"

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| WORKFLOW | dropdown ("Select") | **any other workflow** in location | `attributes.workflow_id` (**single id string**) | required; location-dependent |
| PASS INPUT TRIGGER PARAMETERS | toggle | on/off | `attributes.input_trigger_params` (bool) | passes the original trigger's params into the target workflow |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000172 kind=action -->
```json
{
  "name": "Add to Workflow",
  "type": "add_to_workflow",
  "attributes": {
    "type": "add_to_workflow",
    "workflow_id": "00000000-0000-4000-8000-000000000173",
    "input_trigger_params": false
  }
}
```
`workflow_id` here is a **single string** (`remove_from_workflow` uses an **array** — engine must handle both). Verified against the live saved node (see verify metadata comment above; run `verify/verify-item.mjs --doc raw/actions/add-to-workflow.md`).

## Location-data-dependent
- WORKFLOW list → `GET /workflow/{loc}/list?type=workflow&...`. Resolve target by name→id. (Live list observed: ZZZ-SPIKE-capture-1/census/replay-2/replay-3.)

## Quirks
- `workflow_id` here is a **single string**; `remove_from_workflow` uses an **array**. Engine must handle both shapes.
