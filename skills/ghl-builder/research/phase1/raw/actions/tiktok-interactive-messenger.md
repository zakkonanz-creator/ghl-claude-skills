# Action: TikTok interactive messenger

- **Screenshots:** `screenshots/b1-028-tiktok-interactive-messenger.png`, `screenshots/b1-028-tiktok-interactive-messenger-gate.png`
- **Status:** ⛔ disabled BETA + integration-gated — action row is non-draggable/disabled in this location

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Message | plain text | yes | inferred / uncaptured | Despite the name, current TikTok API support is text-only |

## Gate evidence

The disabled BETA row was enumerated and hovered; the current DOM anomalously identifies it as `send_rcs`, so no schema is inferred from that id. Official prerequisites require the TikTok messaging integration. No external account was connected, no action was saved, and no JSON is claimed.
