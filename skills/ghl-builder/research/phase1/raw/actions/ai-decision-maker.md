# Action: AI decision maker

- **UI name:** AI decision maker · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `workflow_ai_decision_maker`
- **Screenshot:** `screenshots/b8-001-ai-decision-maker.png`
- **Premium:** yes — the panel says “This is a premium action” and “Using this action will incur additional charges per execution”; official Workflow AI billing is $0.01 per execution.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | top-level `name`; `attributes.__name__` | Canvas label. |
| INSTRUCTIONS | textarea | free text and custom values | yes | `attributes.instructions` | Describe the decision and routing rules. |
| ADDITIONAL CONTEXT | textarea | free text and custom values | no | `attributes.information` | Optional context supplied to the model. |
| Default Branch → name | disabled text | fixed `Default Branch` | automatic | `attributes.transitions[].name` where `conditionType:"pre-defined"` | Locked fallback branch. |
| Default Branch → description | disabled textarea | fixed fallback description | automatic | matching `transitions[].fields.description` | Locked in the live panel. |
| Custom Branch → name | repeatable text | free text | yes per branch | user-defined `transitions[].name` | `New Branch` adds another branch. |
| Custom Branch → description | repeatable textarea | free text and custom values | yes per branch | matching `transitions[].fields.description` | Explains when the model should choose the branch. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000222 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000222",
  "type": "workflow_ai_decision_maker",
  "name": "AI decision maker",
  "attributes": {
    "instructions": "Route leads based on {{contact.engagement_score}} and {{contact.company_size}}. High scores (>60) or large companies go to sales. Medium scores (30-60) get nurturing. Low scores (<30) get re-engagement campaigns.",
    "information": "We sell to small (1-50), medium (51-200), and large (200+) companies. Engagement scores range 0-100. Large companies get priority regardless of score.",
    "type": "workflow_ai_decision_maker",
    "__customInputs__": {},
    "cat": "multi-path",
    "convertToMultipath": true,
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000223",
        "name": "Default Branch",
        "fields": {
          "description": "Go in this branch if none of the other branches make sense.",
          "branchKey": "none"
        },
        "meta": {
          "__branchKey__": "predefined_Default Branch"
        },
        "conditionType": "pre-defined"
      }
    ],
    "__name__": "AI decision maker"
  },
  "order": 0,
  "cat": "multi-path",
  "workflowsActionType": "INTERNAL",
  "next": [
    "00000000-0000-4000-8000-000000000223"
  ]
}
```

## Branch structure and behavior

The saved parent contains four `transitions`: the locked pre-defined fallback followed by three user-defined branches. Each transition ID is also present in the parent `next[]` in the same order and is the ID of a separate `type:"transition"` child node whose `parent` and `parentKey` point back to the decision-maker parent. An engine must emit the parent and every transition child, then attach downstream actions to the selected transition node.

The model evaluates the instructions and optional context at runtime. If no custom branch is a sensible match, it follows the locked Default Branch. The saved custom transitions use `conditionType:"user-defined"`; their `fields` contain `description` and an internal `branchKey`, and their `meta.__branchKey__` values are generated UUIDs.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Workflow AI actions).
