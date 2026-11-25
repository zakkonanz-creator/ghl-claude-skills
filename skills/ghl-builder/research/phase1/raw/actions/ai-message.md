# Action: AI message

- **Screenshot:** `screenshots/b1-013-ai-message.png`
- **Status:** ⛔ context-gated — disabled picker action says `Custom or Conversation AI Trigger should be present to use this action`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Prompt/instructions | text composer | yes | inferred / uncaptured | Generates one contextual AI message |
| Wait for Contact Reply | checkbox | no | inferred / uncaptured | Pauses flow when enabled |

## Gate evidence

The action exists in the Standard builder picker but requires a Custom or Conversation AI trigger context. It was not opened or saved; no JSON is claimed.
