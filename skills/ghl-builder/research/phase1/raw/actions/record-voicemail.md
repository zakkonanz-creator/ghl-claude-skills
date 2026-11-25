# Action: Record voicemail (IVR)

- **UI name:** Record voicemail · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_collect_voicemail`
- **Screenshot:** `screenshots/b7-014-record-voicemail.png`
- **Premium:** no; phone/IVR-context gated
- **Status:** ⛔ prerequisite-gated — Start IVR Trigger is not present/assignable in this workflow

## Gate-visible and documented fields

The picker disabled the action and displayed `Start IVR Trigger should be present to use this action`. The saved minimal witness nevertheless reopens its default live panel, so its base and conditional controls were enumerated read-only.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Record voicemail` | yes | top-level `name` | Reopened live panel. |
| PLAY BEEP | checkbox toggle | off / on | on | no | inferred / uncaptured | Indicates that recording has started. Exact live control ID: `cmp-ivr-record__play-beep`. |
| STOP RECORDING AFTER (SECONDS OF SILENCE) | whole-number input | seconds | empty input; helper says default 5 | no | inferred / uncaptured | Ends recording after the configured silence interval. |
| STOP RECORDING ON KEYPRESS | phone-key input | `0`–`9`, `*`, or `#` | empty; helper says no key by default | no | inferred / uncaptured | Lets the caller stop recording manually. |
| MAX RECORDING LENGTH | whole-number input | 1–14,400 seconds | empty input; helper says default 3,600 | no | inferred / uncaptured | Maximum voicemail duration. |
| ADD VOICE INSTRUCTIONS | checkbox toggle | off / on | off | no | inferred / uncaptured | Toggled read-only and restored without saving. |
| SAY OR PLAY MESSAGE | select | Say a message or record/upload audio | `Say a message` when voice instructions are enabled | when voice instructions enabled | inferred / uncaptured | Conditional control; no mode was saved. |
| TEXT TO SAY | text/merge-value input | free text or custom variable | empty | conditional | inferred / uncaptured | Visible after enabling voice instructions. |
| LANGUAGE | select | English (US) | `English (US)` | conditional | inferred / uncaptured | Exact reopened-panel value. |
| MESSAGE VOICE | select | Man / Woman | `Woman` | conditional | inferred / uncaptured | Exact reopened-panel value. |
| NUMBER OF LOOPS | number input | repetition count | helper says default 1 | conditional | inferred / uncaptured | No value saved. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000194 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000194",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 5,
  "attributes": {
    "type": "ivr_collect_voicemail"
  },
  "name": "Record voicemail",
  "type": "ivr_collect_voicemail",
  "parentKey": "00000000-0000-4000-8000-000000000191"
}
```

## Gate evidence and limits

- The disabled live picker card exposed exact type `ivr_collect_voicemail` in its DOM ID and showed the Start IVR prerequisite message.
- The screenshot/default disabled picker is the prerequisite-gate evidence. The saved witness reopens its live panel; that reopened panel and the temporary Add voice instructions toggle are the UI-field evidence above.
- Local production corpora had no real saved IVR action node from which to derive the blocked configuration schema; all executable configuration paths remain explicitly inferred/uncaptured.
- No phone number, recording, call, billing feature, or publication was involved.

## Official runtime note

- The action records caller audio. The recording is available in the contact's Conversations tab.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Record voicemail), based on GHL article `155000001200`.
