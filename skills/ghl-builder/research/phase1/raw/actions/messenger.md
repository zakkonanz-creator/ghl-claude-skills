# Action: Messenger

- **Screenshot:** `screenshots/b1-007-messenger.png`
- **Status:** ⛔ integration-gated — live panel states `Messenger connection required` and offers `Connect your account`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | Default `Messenger` |
| TEMPLATES | connected-page template picker | no | inferred / uncaptured | `Select template` |
| MESSAGE | rich text composer | yes | inferred / uncaptured | Custom values / Write with AI |
| Add attachments | upload or URL | no | inferred / uncaptured | Panel continues below captured viewport; enumerated from native control/corpus conventions |

## Gate evidence

The panel was enumerated to its Facebook connection gate only. Delivery requires a connected Facebook Page and a contact message to that Page within Meta's prior 24 hours. No account was connected, no action was saved, and no JSON is claimed.
