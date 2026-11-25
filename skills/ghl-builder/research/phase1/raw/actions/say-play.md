# Action: Say or play message (IVR)

- **UI name:** Say or play message · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_say`
- **Screenshot:** `screenshots/b7-015-say-play.png`
- **Premium:** no; phone/IVR-context gated
- **Status:** ⛔ prerequisite-gated — Start IVR Trigger is not present/assignable in this workflow

## Gate-visible and documented fields

The picker disabled the action and displayed `Start IVR Trigger should be present to use this action`. The saved minimal witness nevertheless reopens its default live panel, so its controls were enumerated read-only.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Say or play message` | yes | top-level `name` | Reopened live panel. |
| SAY OR PLAY MESSAGE | select | text-to-speech or recorded/uploaded audio | unselected (`Select template`) | yes | inferred / uncaptured | No mode saved. |
| TEXT TO SAY | text/merge-value input | free text or custom variable | empty (`Please Input`) | when text-to-speech selected | inferred / uncaptured | Exact live label and placeholder. |
| LANGUAGE | select | English (US) | unselected (`Select template`) | conditional | inferred / uncaptured | Official runtime support is US English only. |
| MESSAGE VOICE | select | Man / Woman | unselected (`Select template`) | conditional | inferred / uncaptured | No value saved. |
| NUMBER OF LOOPS | number input | repetition count | empty (`Please Input`); helper says default 1 | conditional | inferred / uncaptured | No value saved. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000277 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000277",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 6,
  "attributes": {
    "type": "ivr_say"
  },
  "name": "Say or play message",
  "type": "ivr_say",
  "parentKey": "00000000-0000-4000-8000-000000000194"
}
```

## Gate evidence and limits

- The disabled live picker card exposed exact type `ivr_say` in its DOM ID and showed the Start IVR prerequisite message.
- The screenshot/default disabled picker is the prerequisite-gate evidence. The saved witness reopens its default live panel, which is the UI-field evidence above.
- Local production corpora had no real saved IVR action node from which to derive the blocked configuration schema; all executable configuration paths remain explicitly inferred/uncaptured.
- No message, audio upload, phone number, call, billing feature, or publication was involved.

## Official runtime note

- The action can use text-to-speech or prerecorded audio. `.wav` is recommended because `.mp3` may not always be compatible; text-to-speech supports US English with Man/Woman voices and defaults to one loop.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Say or play message), based on GHL article `155000001200`.
