# Action: Instagram interactive messenger

- **Screenshot:** `screenshots/b1-022-instagram-interactive-messenger.png`
- **Status:** ⛔ trigger + integration-gated — picker requires an Instagram comment, customer-replied, or new-follower trigger

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Message | composer | yes | inferred / uncaptured | Meta 24-hour window |
| Buttons or quick replies | mutually exclusive modes | no | inferred / uncaptured | Replies cannot combine with attachments |
| Wait Step | timeout | yes | inferred / uncaptured | Default 1 minute; Default Timeout branch |

## Gate evidence

Exact live prerequisite: `Instagram - Comment(s) on a post, Customer replied or Instagram new follower Trigger should be present to use this action`. A connected Instagram account is additionally required. No trigger/account was added, no action was saved, and no JSON is claimed.
