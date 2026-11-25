# Action: Voicemail

- **UI name:** Voicemail · **JSON `type`:** `voicemail`
- **Screenshot:** `b1-011-voicemail.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | Default `Voicemail` |
| DROP YOUR FILE | file upload | `attributes.attachment` | Saved MP3; UI exposes playback preview after upload |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000236 kind=action -->
```json
{
  "name": "Voicemail",
  "type": "voicemail",
  "attributes": {
    "attachment": {
      "url": "https://storage.googleapis.com/<bucket>/<path><bucket>/<path>",
      "name": "tts-george-sample.mp3",
      "size": 429706
    }
  }
}
```

This is a pre-recorded voicemail drop, not a live call. A representative existing project MP3 was uploaded only to the Draft spike workflow; the workflow was not published or executed.
