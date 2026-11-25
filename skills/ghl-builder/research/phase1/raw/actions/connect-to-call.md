# Action: Connect to call (IVR)

- **UI name:** Connect to call · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_connect_call`
- **Screenshot:** `screenshots/b7-011-connect-to-call.png`
- **Premium:** no; phone/IVR-context gated
- **Status:** ⛔ prerequisite-gated — Start IVR Trigger is not present/assignable in this workflow

## Gate-visible and documented fields

The picker disabled the action and displayed `Start IVR Trigger should be present to use this action`. The minimal saved witness nevertheless reopens a read-only/default live panel, allowing the controls below to be enumerated; values remain uncaptured because no executable IVR context exists.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Connect to call` | yes | top-level `name` | Reopened live panel. |
| CONNECT CALL TO | destination group | SELECT USERS; Add custom number | empty/undefined user display | yes | inferred / uncaptured | Live copy allows up to 10 numbers. |
| SELECT USERS | user multiselect | location users | empty | conditional | inferred / uncaptured | Current empty panel displayed `undefined`; no user was selected. |
| Add custom number | repeatable phone input control | custom telephone numbers | none | conditional | inferred / uncaptured | Alternative/additional destination. |
| ADD WHISPER MESSAGE | checkbox toggle | off / on | off | no | inferred / uncaptured | Conditional variant was toggled read-only and restored without saving. |
| TEXT TO SAY | text/merge-value input | free text or custom variable | empty | when whisper enabled | inferred / uncaptured | Whisper-only field. |
| LANGUAGE | select | English (US) observed | English (US) | when whisper enabled | inferred / uncaptured | US English only. |
| MESSAGE VOICE | select | Woman observed; official Man/Woman enum | Woman | when whisper enabled | inferred / uncaptured | Whisper-only field. |
| NUMBER OF LOOPS | number input | repetition count | 1 | when whisper enabled | inferred / uncaptured | Whisper-only field. |
| ADVANCED SETTINGS | disclosure | collapsed / expanded | collapsed | no | not persisted itself | Expanded read-only for the rows below. |
| DETECT VOICEMAIL | checkbox toggle | off / on | off | no | inferred / uncaptured | Live warning says it incurs charges and may add a minor delay; never enabled. |
| RECORD CALL | checkbox toggle | off / on | off | no | inferred / uncaptured | Never enabled. |
| TIMEOUT (SECONDS) | number input | live copy: minimum 5, maximum 600 | blank input; copy says default 10 | no | inferred / uncaptured | Current panel differs from the official-note minimum 1; current UI copy is recorded here. |
| TIME LIMIT (SECONDS) | number input | live copy: maximum 4 hours | blank input; copy says default 1 hour | no | inferred / uncaptured | Current panel differs from older official-note 24-hour/no-limit wording; current UI copy is recorded here. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000193 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000193",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 3,
  "attributes": {
    "type": "ivr_connect_call"
  },
  "name": "Connect to call",
  "type": "ivr_connect_call",
  "parentKey": "00000000-0000-4000-8000-000000000278"
}
```

## Gate evidence and limits

- The live picker card was disabled (`cursor-not-allowed`, opacity 50%) and its DOM ID exposed the exact native type `ivr_connect_call`; the picker rendered the prerequisite message verbatim.
- A minimal Draft-only node was API-injected and read back solely as a machine-checkable gate witness. It is not executable and does not claim the uncaptured configuration schema.
- The screenshot/default disabled picker is the prerequisite-gate evidence. Contrary to the initial expectation, the saved minimal witness does reopen its live panel; that reopened default panel and the read-only conditional toggles are the field evidence above.
- The local production corpora were searched for real `ivr_*` action nodes before injection; they contained only downstream nested-dropdown references, not a reusable IVR node shape.
- No phone number was assigned, no call was placed, no billing feature was enabled, and the workflow was never published.

## Official runtime notes

- Transfers may target system users or custom numbers, with up to 10 numbers simultaneously.
- Web-app routing does not support blind or warm transfers.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Connect to call), based on GHL article `155000001200`.
