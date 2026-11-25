# Action: WhatsApp media

- **Checklist label:** Whatsapp: media · **Live UI name:** WhatsApp media
- **Screenshot:** `screenshots/b1-035-whatsapp-media.png`
- **Status:** ⛔ subscription/integration-gated — `You do not have WhatsApp subscription!`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | |
| FROM NUMBER | WhatsApp number picker | yes | inferred / uncaptured | |
| MEDIA TYPE | select | yes | inferred / uncaptured | Image/video/audio/document |
| MEDIA | System upload / Media library | yes | inferred / uncaptured | Type-specific size/format limits apply |
| Caption | text | conditional | inferred / uncaptured | Appears for supported types; ignored for audio |

## Gate evidence

The live media source controls were enumerated to the missing-subscription gate. Delivery works only inside an open 24-hour customer-service window; outbound media links expire after 30 days. No subscription/account/number was connected, no media was uploaded, no action was saved, and no JSON is claimed.
