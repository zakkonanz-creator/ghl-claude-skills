# Action: AI Agent

- **UI name:** AI Agent · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `ai_agent`
- **Screenshots:** `screenshots/b8-006-ai-agent.png`, `screenshots/b8-006-ai-agent-advanced.png`, `screenshots/b8-006-ai-agent-saved.png`
- **Premium:** yes — model tokens are billed, and any premium tool the agent invokes also incurs that tool's execution charge.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| Action Name | text input | free text | yes | top-level `name` | Canvas label. |
| Template | template selector | Build Your Own and available templates | no | **uncaptured as a distinct key** | Captured Build Your Own has no separate template key; templates prefill the underlying configuration. |
| Instructions | rich-text editor with custom-value picker | free text / dynamic values | yes | `attributes.prompt` | `Enhance prompt` can rewrite the entered instructions. |
| Model | select | available AI models | yes | `attributes.model` | Captured `GPT-5.2 (Low thinking)` → `gpt-5.2`. |
| Tools | repeatable tool picker | workflow tools such as Send Email, Update Contact, Create Opportunity | no | `attributes.tools[]` | Captured empty. Official limit: up to 10 non-built-in tools. Premium tools retain their own execution billing. |
| Advanced Options | collapsible section | Conversation Memory, Output Format, Output Description | no | child fields below | Collapsed by default. |
| Conversation Memory | switch | off / on | no | `attributes.memoryEnabled` | Captured `false`. |
| Output Format | select | None, Text, JSON schema | no | `attributes.outputFormat` | Captured Text → `text`; JSON exposes schema configuration. |
| Output Description | textarea | free text | no | `attributes.outputDescription` | Captured empty string. Describes the requested output. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000214 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000214",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000213",
  "order": 2,
  "attributes": {
    "prompt": "Analyze the contact context and return a concise recommended next step.",
    "model": "gpt-5.2",
    "tools": [],
    "outputFormat": "text",
    "outputDescription": "",
    "memoryEnabled": false
  },
  "name": "AI Agent",
  "type": "ai_agent",
  "parentKey": "00000000-0000-4000-8000-000000000283"
}
```

The action plans and executes against the tools supplied to it and makes its configured output available downstream. Built-in cross-channel conversation history and call-transcript retrieval work without additional setup. Standard built-in tools such as SMS, Update Contact, and Add Tag add no premium execution charge; premium tools retain their own execution charges. Unlike the other captured Workflow AI nodes, this saved shape does not contain `attributes.type`, `attributes.__customInputs__`, or top-level `workflowsActionType`.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 AI Agent).
