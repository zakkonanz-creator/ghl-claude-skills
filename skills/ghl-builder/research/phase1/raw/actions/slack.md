# Action: Slack

- **UI name:** Slack message · **Default action name:** Send notification to Slack
- **Screenshot:** `screenshots/b1-008-slack.png`
- **Status:** ⛔ premium + integration-gated — panel shows both `Premium` and `Slack connection required`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | Visible before gate |
| Slack account | integration picker | yes | inferred / uncaptured | Requires external connection |
| Event type | select | yes | inferred / uncaptured | Direct message; private channel; public channel |
| Recipient/channel | Slack-backed picker | yes | inferred / uncaptured | Conditional on event type |
| Message | composer | yes | inferred / uncaptured | Downstream of connection gate |

## Gate evidence

The native panel was stopped at `Connect your account`. Slack is a premium per-execution action and requires a connected Slack workspace. No external account or billing-capable integration was connected, no action was saved, and no JSON is claimed.
