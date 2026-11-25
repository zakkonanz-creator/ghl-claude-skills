# Action: GPT powered by OpenAI

- **UI name:** GPT powered by OpenAI · **Category:** Workflow AI / External AI · **Priority:** LONG_TAIL
- **JSON `type`:** `chatgpt`
- **Screenshots:** `screenshots/b8-009-gpt-powered-by-openai.png`, `screenshots/b8-009-gpt-powered-by-openai-saved.png`
- **Billing:** zero-markup token billing at OpenAI model rates; executions do not count against premium-execution limits. The generic panel still displays the premium-action notice.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| Action Name | text input | free text | yes | top-level `name` | Canvas label. |
| Model | select | GPT 5, 5.1, 5 Mini, 5 Nano, 4o, 4 Turbo, 4o Mini | yes | `attributes.model` | Captured default GPT 5 Mini → `gpt-5-mini`. |
| Action Type | select | Custom and model-supported preset tasks | yes | `attributes.actionType` | Captured `custom`; also drives `attributes.event` and `actionParams`. |
| Enable Chat History | switch | off / on | no | `attributes.actionParams.memoryKeyToggle`; `attributes.memoryKey` | Captured off. History is contact-specific; enabling it switches to GPT-4 models for larger context. |
| Prompt | textarea with custom-value picker | free text and merge fields | yes | `attributes.promptText` | Captured with a contact merge field. |
| Temperature | numeric control in documented/older UI | 0.1–1 | no | `attributes.temperature` | Current default Custom panel did not expose the control, but the saved node carries string `"0.2"`; exact presence is verified. |
| AI Memory Key / GPT History options | conditional controls when history is enabled | action or custom key; optional history exclusions | conditional | `attributes.actionParams.memoryKeyType`, `.memoryKeyCustom`; `attributes.excludeFromHistory`, `.excludeInstructionsFromHistory` | Captured defaults while history is off. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000212 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000212",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000213",
  "order": 3,
  "attributes": {
    "type": "chatgpt",
    "apiKey": "",
    "event": "simple-prompt",
    "model": "gpt-5-mini",
    "temperature": "0.2",
    "promptText": "Write a concise follow-up for {{contact.first_name}}.",
    "actionType": "custom",
    "actionParams": {
      "message": "",
      "categories": [],
      "length": "",
      "from": "",
      "to": "",
      "memoryKeyToggle": false,
      "memoryKeyType": "action",
      "memoryKeyCustom": ""
    },
    "memoryKey": "",
    "excludeFromHistory": false,
    "excludeInstructionsFromHistory": false
  },
  "name": "GPT powered by OpenAI",
  "type": "chatgpt",
  "parentKey": "00000000-0000-4000-8000-000000000214"
}
```

The generated response is exposed downstream as a GPT output (for example `{{chatgpt.1.response}}`) and can be stored in a custom field. `apiKey` is an empty string in the native managed-billing shape; no customer API key was entered.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 GPT powered by OpenAI).
