# Action: RCS interactive message

- **Screenshot:** `screenshots/b1-024-rcs-interactive-message.png`
- **Status:** ⛔ feature + sender-gated — disabled BETA row says `This feature is not enabled for your location.`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| RCS Sender ID | approved-sender picker | yes | inferred / uncaptured | Registered through HighLevel Support |
| Format | Standalone Card / Carousel | yes | inferred / uncaptured | Carousel 2–10 cards |
| Card content | title/description/media | yes | inferred / uncaptured | |
| Buttons | repeatable | no | inferred / uncaptured | Standalone ≤3; carousel ≤2/card; creates branches |
| Fallback SMS | text | yes | inferred / uncaptured | Billed at SMS rates if RCS fails |

## Gate evidence

The location-level BETA feature is disabled before configuration; an approved Sender ID would also be required. No enablement/support request or billing-capable setup was performed, no action was saved, and no JSON is claimed.
