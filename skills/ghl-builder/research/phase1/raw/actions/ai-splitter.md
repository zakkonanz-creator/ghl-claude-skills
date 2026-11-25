# Action: AI splitter

- **Screenshot:** `screenshots/b1-014-ai-splitter.png`
- **Status:** ⛔ context-gated — disabled picker action says `Custom or Conversation AI Trigger should be present to use this action`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Branching logic | description | yes | inferred / uncaptured | Analyzes previously collected conversation data |
| Custom branches | repeatable branch definitions | yes | inferred / uncaptured | Sends no message and collects no data |
| No Condition Met | catch-all branch | automatic | inferred / uncaptured | |

## Gate evidence

The action was enumerated at the Standard builder picker and cannot open without a Custom or Conversation AI trigger. No action was saved and no JSON is claimed.
