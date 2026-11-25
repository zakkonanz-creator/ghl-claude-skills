# Action: Instagram DM

- **Screenshot:** `screenshots/b1-004-instagram-dm.png`
- **Status:** ⛔ integration-gated — live panel states `Instagram connection required` and offers `Connect your account`

## Config surface to gate

| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | Default `Instagram DM` |
| TEMPLATES | connected-account template picker | no | inferred / uncaptured | Panel shows `Select template` |
| MESSAGE | rich text composer | yes | inferred / uncaptured | `Write with AI` available |
| Add attachments | upload or URL | no | inferred / uncaptured | `Upload from system` and `+ Add` URL control |

## Gate evidence

The native panel was enumerated only to its connection gate. Delivery also requires the contact to have messaged the connected Instagram page within Meta's 24-hour window. No Instagram account was connected, no action was saved, and no JSON is claimed.
