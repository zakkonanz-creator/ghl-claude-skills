# Action: Send RCS

- **Screenshot:** `screenshots/b1-027-send-rcs.png`
- **Status:** ⛔ feature + sender-gated — BETA row says `This feature is not enabled for your location.`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| RCS Sender ID | approved-sender picker | yes | inferred / uncaptured | |
| Message | plain text | yes | inferred / uncaptured | Must also work as fallback SMS |

## Gate evidence

The location-level RCS feature is disabled and no approved Sender ID is available. RCS automatically falls back to billed SMS when unsupported. No enablement or sender registration was attempted, no action was saved, and no JSON is claimed.
