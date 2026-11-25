# Trigger: Transcript generated

- **Screenshot:** `screenshots/b1-010-transcript-generated.png`
- **Status:** ⛔ prerequisite-gated — live panel says `Call Transcription is currently disabled. Please enable it to use this trigger for Calls and IVR types.`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | yes | inferred / uncaptured | Default `Transcript Generated` |
| Type | select | yes | inferred / uncaptured | Live options: Calls, IVR, Voice AI |
| Call Type | filter | no | inferred / uncaptured | Official downstream filter |
| Call Direction | filter | no | inferred / uncaptured | Official downstream filter |
| minimum Call Duration | filter | no | inferred / uncaptured | Official downstream filter |

## Gate evidence

The panel and Type dropdown were enumerated. Enabling account-level call transcription via `Go to settings` is outside this batch's read-only prerequisite boundary, so it was not changed. Only GHL-transcribed calls fire; external/imported and failed transcriptions do not. No trigger was saved and no JSON is claimed.
