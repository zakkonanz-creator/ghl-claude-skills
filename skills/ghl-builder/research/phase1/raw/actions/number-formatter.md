# Action: Number formatter

- **UI name:** Number formatter · **Category:** Internal · **Priority:** LONG_TAIL (B5-7)
- **JSON `type`:** `number_formatter`
- **Screenshot:** `screenshots/b5-007-number-formatter.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Format and generate Numeric fields` | yes | `name` | Selecting a mode changed it to `Format number`. |
| ACTION TYPE | custom select | `Text to Number`; `Format number`; `Format phone number`; `Format currency`; `Random number` | none | yes | `attributes.action` | Saved Format number as `string_to_formatted_number`; other modes have conditional controls and are inferred / uncaptured. |
| SELECT FIELD | tree selector | contact/workflow fields, prior action outputs, custom fields/values | none | yes | `attributes.format.fromField` | Saved `zzz-spike-number` as `{{contact.zzzspikenumber}}`. |
| INPUT DECIMAL MARK | custom select | `Period (123.45)`; comma alternative | `Period (123.45)` | yes | `attributes.format.options.inputDecimalMark` | |
| TO FORMAT | custom select | comma-group/period-decimal; period-group/comma-decimal; space-group/comma-decimal; space-group/period-decimal | none | yes | `attributes.format.options.outputNumberFormat` | Saved comma grouping plus period decimal. |
| Text to Number controls | conditional controls | source number text and parsing settings | n/a | inferred / uncaptured | not in representative JSON | Mode observed but not selected. |
| Format phone number controls | conditional controls | source phone value and output formatting | n/a | inferred / uncaptured | not in representative JSON | Mode observed but not selected. |
| Format currency controls | conditional controls | source number and currency formatting | n/a | inferred / uncaptured | not in representative JSON | Mode observed but not selected. |
| Random number controls | conditional controls | random range/settings | n/a | inferred / uncaptured | not in representative JSON | Mode observed but not selected. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000257 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000257",
  "stepIndex": 2,
  "order": 6,
  "attributes": {
    "type": "number_formatter",
    "format": {
      "fromField": "{{contact.zzzspikenumber}}",
      "options": {
        "inputDecimalMark": "period",
        "outputNumberFormat": "g:comma_d:period"
      },
      "fromFieldType": "string",
      "toFieldType": "number"
    },
    "action": "string_to_formatted_number"
  },
  "name": "Format number",
  "type": "number_formatter",
  "parentKey": "00000000-0000-4000-8000-000000000258"
}
```

## Location-data-dependent fields

- SELECT FIELD includes location custom fields/values and upstream workflow outputs. This capture uses `zzz-spike-number`.

## Quirks

- Although the selected mode is named Format number, the saved action token is `string_to_formatted_number`.
- The output-format enum encodes grouping and decimal characters in one token: `g:comma_d:period`.
- The custom numerical field is persisted with `fromFieldType: "string"` and the formatter output with `toFieldType: "number"`.

## Official runtime semantics

- HighLevel documents five operations whose outputs are available downstream: number formatting, phone formatting, currency formatting, text-to-number, and random-number generation.
- Phone inputs need a country code; currency uses locale rules; Text to Number strips currency formatting; Random Number supports ranges and decimal precision. Source: [HighLevel Number Formatter](https://help.gohighlevel.com/support/solutions/articles/155000003355).
