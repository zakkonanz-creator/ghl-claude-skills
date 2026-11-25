# Action: Split

- **UI name:** Split · **Category:** Internal · **Priority:** LONG_TAIL (B5-9)
- **JSON `type`:** `workflow_split`
- **Screenshot:** `screenshots/b5-009-split.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Split` | yes | `attributes.name` | Top-level saved `name` is an untranslated UI key. |
| DISTRIBUTION TYPE | fixed selector | `Random Split` | `Random Split` | yes | `attributes.condition` | Persists `random-split`. |
| Path name | text, repeatable | free text | `Path A`; `Path B` | yes | `attributes.paths[].name` | Also mirrored in transitions and generated transition child nodes. |
| Path percentage | number, repeatable | percentages totaling 100 | `50`; `50` | yes | `attributes.extras.weightDistribution.<path-id>` | Map keys are generated path IDs. |
| Add path | button | adds another route | n/a | no | `attributes.paths[]` | Representative capture uses the two default paths. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000322 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000322",
  "parentKey": "00000000-0000-4000-8000-000000000259",
  "type": "workflow_split",
  "name": "workflow.asideSection.headerMeta.workflowSplit",
  "attributes": {
    "name": "Split",
    "cat": "multi-path",
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000323",
        "name": "Path A",
        "condition": "Path A",
        "conditionType": "default",
        "isPrimaryBranch": false,
        "description": "",
        "attributes": {}
      }
    ],
    "type": "workflow_split",
    "paths": [
      {
        "name": "Path A",
        "id": "00000000-0000-4000-8000-000000000323"
      }
    ],
    "condition": "random-split",
    "extras": {
      "weightDistribution": {
        "00000000-0000-4000-8000-000000000323": 50,
        "00000000-0000-4000-8000-000000000204": 50
      }
    }
  },
  "order": 8,
  "cat": "multi-path",
  "next": [
    "00000000-0000-4000-8000-000000000323",
    "00000000-0000-4000-8000-000000000204"
  ]
}
```

## Location-data-dependent fields

None observed.

## Quirks

- Split is a node family: the parent points to generated `transition` child nodes, one per path.
- The parent duplicates path metadata across `transitions`, `paths`, `next`, and `extras.weightDistribution`.
- The top-level name persisted as `workflow.asideSection.headerMeta.workflowSplit`, while the editable name is `attributes.name`.

## Official runtime semantics

- A Split supports up to five paths and their weights must total 100%.
- Assignment is sticky: a contact that re-enters follows the same path. Source: [HighLevel Split](https://help.gohighlevel.com/support/solutions/articles/155000003304).
