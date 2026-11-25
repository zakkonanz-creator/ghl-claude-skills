# Action: AI capture information

- **Screenshot:** `screenshots/b1-012-ai-capture-information.png`
- **Status:** ⛔ context-gated — Standard builder picker shows the action disabled with exact prerequisite text `Conversation AI or Custom Trigger should be present to use this action`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Objective | textarea, ≤500 chars | yes | inferred / uncaptured | Capture/qualify goal |
| Update Contact Field | field mapping | no | inferred / uncaptured | |
| Additional Instructions | textarea | no | inferred / uncaptured | |
| Response Example | textarea | no | inferred / uncaptured | |
| Skip if Filled | toggle | no | inferred / uncaptured | |
| Maximum Attempts | number | no | inferred / uncaptured | |
| Don't Proceed If Criteria Unmet | toggle + closing message | no | inferred / uncaptured | |
| Add Tag on completion | tag picker | no | inferred / uncaptured | |

## Gate evidence

The picker was enumerated in the Draft Standard builder workflow. The action is Flow/Conversation-AI-context dependent and cannot be opened in this workflow. No trigger context was added solely to bypass the gate, no action was saved, and no JSON is claimed.
