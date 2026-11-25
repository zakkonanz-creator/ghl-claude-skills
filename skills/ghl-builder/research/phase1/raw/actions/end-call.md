# Action: End call (IVR)

- **UI name:** End call · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_hangup`
- **Screenshot:** `screenshots/b7-012-end-call.png`
- **Premium:** no; phone/IVR-context gated
- **Status:** ⛔ prerequisite-gated — Start IVR Trigger is not present/assignable in this workflow

## Gate-visible and documented fields

The picker disabled the action and displayed `Start IVR Trigger should be present to use this action`. The saved minimal witness nevertheless reopens its default live panel, so its base and conditional controls were enumerated read-only.

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `End call` | yes | top-level `name` | Reopened live panel. |
| ADD VOICE INSTRUCTIONS | checkbox toggle | off / on | off | no | inferred / uncaptured | Off means immediate disconnect. Toggled read-only and restored without saving. |
| SAY OR PLAY MESSAGE | select | Say a message or play/upload audio | unselected (`Select template`) | when voice instructions enabled | inferred / uncaptured | Conditional control was exposed but no mode was selected/saved. |
| TEXT TO SAY | text/merge-value input | free text or custom variable | empty (`Please Input`) | conditional | inferred / uncaptured | Visible after enabling voice instructions. |
| LANGUAGE | select | US English per official docs | unselected (`Select template`) | conditional | inferred / uncaptured | No value saved. |
| MESSAGE VOICE | select | Man / Woman | unselected (`Select template`) | conditional | inferred / uncaptured | No value saved. |
| NUMBER OF LOOPS | number input | repetition count | empty input; helper text says default 1 | conditional | inferred / uncaptured | No value saved. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000250 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000250",
  "parent": "00000000-0000-4000-8000-000000000192",
  "order": 8,
  "attributes": {
    "type": "ivr_hangup"
  },
  "name": "End call",
  "type": "ivr_hangup",
  "parentKey": "00000000-0000-4000-8000-000000000251"
}
```

## Gate evidence and limits

- The disabled live picker card exposed exact type `ivr_hangup` in its DOM ID and showed the Start IVR prerequisite message.
- The screenshot/default disabled picker is the prerequisite-gate evidence. Contrary to the initial expectation, the saved witness does reopen its live panel; that reopened panel and the temporary conditional toggle are the UI-field evidence above.
- Local production corpora had no real saved IVR action node from which to derive the blocked conditional schema; those fields remain explicitly inferred/uncaptured.
- No phone number, call, billing feature, or publication was involved.

## Official runtime note

- Default behavior disconnects immediately. An optional Say/Play message can run immediately before disconnect.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (End call), based on GHL article `155000001200`.
