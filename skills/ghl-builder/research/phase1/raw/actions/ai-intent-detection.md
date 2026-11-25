# Action: AI intent detection

- **UI name:** AI intent detection · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `workflow_ai_intent_detection`
- **Screenshots:** `screenshots/b8-003-ai-intent-detection.png`, `screenshots/b8-003-ai-intent-detection-saved.png`
- **Premium:** yes — $0.01 per execution under Workflow AI billing.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | top-level `name`; `attributes.__name__` | Canvas label. |
| INPUT TEXT | textarea with custom-value picker | free text or dynamic value | yes | `attributes.inputText` | Text whose sentiment/intent is classified. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000293 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000293",
  "parentKey": "00000000-0000-4000-8000-000000000294",
  "parent": "00000000-0000-4000-8000-000000000228",
  "type": "workflow_ai_intent_detection",
  "name": "AI intent detection",
  "attributes": {
    "inputText": "John is a very good person",
    "type": "workflow_ai_intent_detection",
    "__customInputs__": {},
    "cat": "multi-path",
    "convertToMultipath": true,
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000295",
        "name": "Positive",
        "fields": {
          "branchKey": "POSITIVE"
        },
        "meta": {
          "__branchKey__": "predefined_Positive"
        },
        "conditionType": "pre-defined"
      }
    ],
    "__name__": "AI intent detection"
  },
  "order": 1,
  "cat": "multi-path",
  "workflowsActionType": "INTERNAL",
  "next": [
    "00000000-0000-4000-8000-000000000295"
  ]
}
```

## Fixed branches

The action always saves three locked, pre-defined transitions in this order: `Positive` (`branchKey:"POSITIVE"`), `Negative` (`"NEGATIVE"`), and `None` (`"NONE"`). Every transition ID also appears in `next[]` and identifies a separate `type:"transition"` child node whose `parent` and `parentKey` point to the intent-detection parent. An engine must emit the parent plus all three transition children.

These branches are fixed; the action does not support custom intents. `None` covers neutral text or results where the model has low confidence. For mixed sentiment, the model follows the dominant overall sentiment. The action does not expose confidence scores.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Workflow AI actions).
