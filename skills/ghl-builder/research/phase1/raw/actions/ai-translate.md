# Action: AI translate

- **UI name:** AI translate · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `workflow_ai_translate_content`
- **Screenshots:** `screenshots/b8-005-ai-translate.png`, `screenshots/b8-005-ai-translate-saved.png`
- **Premium:** yes — $0.01 per execution under Workflow AI billing.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | top-level `name` | Canvas label. |
| FROM LANGUAGE | text input with custom-value picker | explicit source language | yes | `attributes.from` | Captured `English`; the source language must be specified. |
| TO LANGUAGE | text input with custom-value picker | explicit destination language | yes | `attributes.to` | Captured `Spanish`. |
| INPUT TEXT | textarea with custom-value picker | free text or dynamic value | yes | `attributes.inputText` | Text to translate. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000283 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000283",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000213",
  "order": 1,
  "attributes": {
    "from": "English",
    "to": "Spanish",
    "inputText": "Hello, how are you?",
    "type": "workflow_ai_translate_content",
    "__customInputs__": {},
    "prompt": "Translate the below Text from English to Spanish \n\nText:\nHello, how are you?\n Only return the translated text in response without any other text."
  },
  "name": "AI translate",
  "type": "workflow_ai_translate_content",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000324"
}
```

The builder derives and saves `attributes.prompt` from the three visible inputs; an engine should reproduce that generated instruction as well as the source fields. The translated text is exposed as an output variable for downstream actions. Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Workflow AI actions).
