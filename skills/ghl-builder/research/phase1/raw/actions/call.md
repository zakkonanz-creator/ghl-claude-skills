# Action: Call

- **UI name:** Call · **Category:** Communication
- **JSON `type`:** `call` · **Screenshot:** `b1-001-call.png`, `b1-001-call-advanced.png`
- **Premium:** no

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | Saved as `Call` |
| CALL WHISPER | textarea | `attributes.whisper_message` | Optional TTS played to the answering user, replayed up to 3 times; billed $0.00084 per 100 characters |
| Call timeout (s) | number, 1–600 | `attributes.timeout` | Saved representative value 21 |
| DISABLE VOICEMAIL DETECT | toggle | `attributes.disable_detect_voicemail` | Saved off; enabling removes detection delay, but voicemail then counts as a live answer |
| CONNECT CALL AFTER KEYPRESS | toggle | `attributes.call_connect` | Saved on |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000198 kind=action -->
```json
{
  "name": "Call",
  "type": "call",
  "attributes": {
    "timeout": 21,
    "whisper_message": "ZZZ spike call whisper",
    "disable_detect_voicemail": false,
    "call_connect": true
  }
}
```

## Behavior and prerequisites

The action calls the contact's assigned user; if unassigned it uses the company phone. A keypress bridges the receiver to the contact when `call_connect` is enabled. For workflow **Stop on Response**, only the contact's response counts; whether voicemail is excluded depends on voicemail detection remaining enabled. The workflow remains Draft/unpublished.
