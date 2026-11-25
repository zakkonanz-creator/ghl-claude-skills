# Action: AI summarize

- **UI name:** AI summarize · **Category:** Workflow AI · **Priority:** LONG_TAIL
- **JSON `type`:** `workflow_ai_summarize_text`
- **Screenshots:** `screenshots/b8-004-ai-summarize.png`, `screenshots/b8-004-ai-summarize-saved.png`
- **Premium:** yes — $0.01 per execution under Workflow AI billing.

## Config panel fields

| UI label | Input type | Options / source | Required | JSON path | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | top-level `name` | Canvas label. |
| MAX LENGTH | text input with custom-value picker | natural-language limit, e.g. words, characters, sentences, or paragraphs | yes | `attributes.maxLength` | Captured `3 sentences`; the value is a string, not a numeric field. |
| INPUT TEXT | textarea with custom-value picker | free text or dynamic value | yes | `attributes.inputText` | Text to summarize. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000211 nodeId=00000000-0000-4000-8000-000000000324 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000324",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000213",
  "order": 0,
  "attributes": {
    "maxLength": "3 sentences",
    "inputText": "Long source text to summarize.",
    "type": "workflow_ai_summarize_text",
    "__customInputs__": {}
  },
  "name": "AI summarize",
  "type": "workflow_ai_summarize_text",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000213"
}
```

The generated summary is exposed as an output variable for downstream actions, so multiple summarizers can be chained to reduce content progressively. The AI decides what information is important; the panel has no control for excluding specified content.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Workflow AI actions).
