# Action: Remove From Workflow

- **UI name:** Remove from workflow · **Category:** Internal · **Priority:** CORE
- **JSON `type`:** `remove_from_workflow` · **Screenshot:** `093-rm-from-wf-panel.png`
- **Premium:** no · **Description:** "Removes the Contact from a specific workflow"

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| WORKFLOW | dropdown | **"Current workflow"** (default) or any other workflow (location-dependent) | `attributes.workflow_id` (array of workflow ids) | "Current" resolves to this workflow's own id |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000238 kind=action -->
```json
{ "name": "Remove from Workflow", "type": "remove_from_workflow",
  "attributes": { "type": "remove_from_workflow", "workflow_id": ["00000000-0000-4000-8000-000000000171"] } }
```

## Location-data-dependent
- WORKFLOW list → `GET /workflow/{loc}/list?type=workflow&...`. "Current workflow" = the workflow being built (self id). Resolve target workflow by name→id at build time.
