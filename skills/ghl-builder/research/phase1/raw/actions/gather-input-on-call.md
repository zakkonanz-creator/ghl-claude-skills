# Action: Gather input on call (IVR)

- **UI name:** Gather input on call · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_gather`
- **Screenshot:** `screenshots/b7-013-gather-input-on-call.png`
- **Premium:** no; phone/IVR-context gated
- **Status:** ⛔ prerequisite-gated — Start IVR Trigger is not present/assignable in this workflow

## Gate-visible and documented fields

The picker disabled the action and displayed `Start IVR Trigger should be present to use this action`. The minimal saved witness nevertheless reopens its default live panel, so the controls below were enumerated read-only.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Gather input on call` | yes | top-level `name` | Reopened live panel. |
| SAY OR PLAY MESSAGE | select | Say a message (TTS) or upload/play audio | unselected (`Select template`) | yes | inferred / uncaptured | No mode saved. |
| TEXT TO SAY | text/merge-value input | free text or custom variable | empty (`Please Input`) | conditional | inferred / uncaptured | Live helper describes keypad choices. |
| LANGUAGE | select | US English per official docs | unselected (`Select template`) | conditional | inferred / uncaptured | No value saved. |
| MESSAGE VOICE | select | Man / Woman | unselected (`Select template`) | conditional | inferred / uncaptured | No value saved. |
| NUMBER OF LOOPS | number input | repetition count | empty input; helper says default 1 | conditional | inferred / uncaptured | No value saved. |
| MATCH CONDITIONS | checkbox toggle | off / on | off | no | inferred / uncaptured | Toggled read-only and restored without saving. |
| Branch name | repeatable text | free text | empty (`Enter branch name`) | when Match Conditions enabled | inferred / uncaptured | Each named branch pairs with On key press. |
| On key press | digit input/selector | keypad digit | empty (`Enter value`) | per named branch | inferred / uncaptured | Add branch creates more; None branch is always shown. |
| ADVANCED SETTINGS | disclosure | collapsed / expanded | collapsed | no | not persisted itself | Expanded read-only. |
| STOP GATHERING AFTER (SECONDS) | number input | 5–30 seconds | empty (`Please Input`) | no | inferred / uncaptured | Exact current live label. |
| STOP GATHERING ON KEY PRESS | checkbox toggle | off / on | on | no | inferred / uncaptured | Default read from `aria-checked:true`; not changed. |
| STOP GATHERING AFTER (DIGITS) | number input | expected digit count | empty (`Please Input`) | no | inferred / uncaptured | Submits as soon as expected digits arrive. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000191 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000191",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 4,
  "attributes": {
    "type": "ivr_gather"
  },
  "name": "Gather input on call",
  "type": "ivr_gather",
  "parentKey": "00000000-0000-4000-8000-000000000193"
}
```

## Gate evidence and limits

- The disabled native picker card exposed exact type `ivr_gather` and the Start IVR prerequisite message.
- The screenshot/default disabled picker is the prerequisite-gate evidence. Contrary to the initial expectation, the saved witness reopens its live panel; that panel and the temporary Match Conditions toggle are the UI-field evidence above. The witness remains non-executable and does not claim branch serialization.
- Local production corpora had no real saved IVR action node; blocked branch/transition shapes were not guessed.
- No phone number, audio, call, billing feature, or publication was involved.

## Official runtime note

- The action plays a prompt, gathers keypad digits, and routes through named digit branches or the None branch for invalid/no input.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Gather input on call), based on GHL articles `155000003370` and `155000001200`.
