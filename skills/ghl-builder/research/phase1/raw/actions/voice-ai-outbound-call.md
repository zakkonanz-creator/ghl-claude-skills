# Action: Voice AI outbound call

- **UI name:** Voice AI outbound call · **Category:** Voice AI · **Priority:** LONG_TAIL · **BETA**
- **JSON `type`:** `voice_ai_outbound_call`
- **Screenshot:** `screenshots/b7-017-voice-ai-outbound-call.png`
- **Premium / billing:** usage-billed; outbound/KYC prerequisite gate
- **Status:** ⛔ prerequisite-gated — outbound calling is disabled for this location

## Gate-visible and documented fields

The native unsaved panel stopped at `Outbound Calls Disabled` and instructed the user to enable outbound calls in Voice AI Agent settings for KYC and disclosure compliance. It did not expose the downstream configuration controls.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Voice AI outbound call` | yes | top-level `name` | Observed in the native unsaved gate panel. |
| AI Agent | select | outbound-enabled Voice AI agents | unavailable behind gate | yes | inferred / uncaptured | Required by official docs; the live gate prevented enumeration or serialization. |
| From Phone Number | select | eligible location phone numbers | unavailable behind gate | yes | inferred / uncaptured | Required by official docs; no number was selected or assigned. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000251 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000251",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 7,
  "attributes": {
    "type": "voice_ai_outbound_call"
  },
  "name": "Voice AI outbound call",
  "type": "voice_ai_outbound_call",
  "parentKey": "00000000-0000-4000-8000-000000000277"
}
```

## Gate evidence and limits

- The native picker DOM ID exposed exact type `voice_ai_outbound_call` and marked the action BETA.
- The screenshot/default unsaved panel is the UI evidence. It showed only ACTION NAME and the outbound-disabled compliance message; the minimal saved witness definitively does not reopen in the live builder.
- The saved node is a non-executable type witness only. Local production corpora did not contain a configured Voice AI outbound node, so no agent/phone schema was guessed.
- Outbound calling, KYC, billing, agent selection, phone selection, calling, and publication were not enabled or attempted.

## Official runtime constraints

- Requires outbound calling enabled, completed KYC, an eligible AI Agent, a From Phone Number, and a contact with a valid same-country domestic number; international calls are unsupported.
- Limits are 1,000 calls per location per day and 10 per minute; each number may be called once per day and at most 14 times in 14 days, only from 8 AM–8 PM in the contact's timezone. Excess calls roll to the next eligible day.
- The business is responsible for consent, opt-outs, and DND compliance. Usage includes Voice Engine, TTS/LLM, and telephony charges.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Voice AI outbound call), based on GHL articles `155000006598`, `155000006652`, and `155000008039`.
