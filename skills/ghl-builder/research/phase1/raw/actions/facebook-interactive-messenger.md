# Action: Facebook interactive messenger

- **Screenshot:** `screenshots/b1-021-facebook-interactive-messenger.png`
- **Status:** ⛔ trigger + integration-gated — `Facebook - Comment(s) on a post or Customer replied Trigger should be present to use this action`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Message | composer | yes | inferred / uncaptured | Meta 24-hour window |
| Buttons | repeatable, max 3 | no | inferred / uncaptured | Open Website / Call Number / Perform Action; branches persist |
| Quick replies | repeatable, max 13 | no | inferred / uncaptured | Disappear after selection; incompatible with attachments |
| Wait Step | timeout | yes for branch timeout | inferred / uncaptured | Default branch |

## Gate evidence

The action is disabled without the required Facebook comment/customer-replied trigger. A connected Facebook Page is also required. Neither a trigger nor external Page connection was added; no action was saved and no JSON is claimed.
