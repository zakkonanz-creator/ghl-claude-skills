# Action: Text formatter

- **UI name:** Text formatter · **Category:** Internal · **Priority:** LONG_TAIL (B5-10)
- **JSON `type`:** `text_formatter`
- **Screenshot:** `screenshots/b5-010-text-formatter.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Action Name | text | free text | `Text formatter` | yes | `name` | Selecting a mode changed the name to `Upper case`. |
| Action Type | custom select | `Upper case`; `Lower case`; `Title case`; `Capitalize`; `Default value`; `Trim`; `Trim whitespace`; `Replace text`; `Find`; `Word count`; `Length`; `Split text`; `Remove HTML tags`; `Extract email`; `Extract URL` | none | yes | `attributes.formatterType` | Saved `upper_case`; modes with extra controls are inferred / uncaptured. |
| Select Field | tree selector | contact/workflow fields and prior action outputs | none | yes | `attributes.field` | Saved Contact → First Name. |
| Mode-specific controls | conditional controls | e.g. default, length, replacement, or delimiter values | n/a | inferred / uncaptured | `attributes.extras` for applicable modes | Upper case requires no extras and saved `{}`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000216 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000216",
  "stepIndex": 1,
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 0,
  "attributes": {
    "type": "text_formatter",
    "extras": {},
    "formatterType": "upper_case",
    "field": "{{contact.first_name}}"
  },
  "name": "Upper case",
  "type": "text_formatter",
  "parentKey": "00000000-0000-4000-8000-000000000204"
}
```

## Location-data-dependent fields

- Select Field includes the location's custom fields/values and available upstream action outputs. The representative uses a stable standard Contact field.

## Quirks

- Because this action was added after Split, it is nested under the generated Path B transition and carries both `parent` and `parentKey`.
- Upper case persists an empty `extras` object; conditional modes populate mode-specific settings there.

## Official runtime semantics

- Text Formatter operates on text values only. Each operation exposes its own parameters—for example replacement text, delimiter/index, trimming choice, or fallback value—and makes the result available downstream.
- Source: [HighLevel Text Formatter](https://help.gohighlevel.com/support/solutions/articles/155000003361).
