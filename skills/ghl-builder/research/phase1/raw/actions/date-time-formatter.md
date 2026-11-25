# Action: Date/time formatter

- **UI name:** Date/time formatter · **Category:** Internal · **Priority:** LONG_TAIL (B5-3)
- **JSON `type`:** `datetime_formatter`
- **Screenshot:** `screenshots/b5-003-date-time-formatter.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Format and Compare date fields` before mode selection | yes | `name` | Selecting `Format date` changed the saved name to `Format date`. |
| ACTION TYPE | custom select | `Format date`; `Format Date and Time`; `Compare dates` | none | yes | `attributes.action` | Saved `format_date`. Other variants are uncaptured and their exact conditional paths are intentionally omitted. |
| FIELD | tree selector | `Specific Date`; `Current Date`; expandable `Contact`, `Appointment`, `Phone Call`, `Array Formatter`, `Voice AI`, `Conversation AI`, `Custom Code`, `Custom Fields`, `Company`, `Custom Values` | none | yes for Format date | `attributes.format.fromField` | Saved `current_date`. Custom Fields/Values and upstream action branches are data-dependent. |
| Specific Date picker | date picker | appears when FIELD = Specific Date | n/a | inferred / uncaptured | not in representative JSON | Conditional branch not used. |
| FROM FORMAT | custom select | date format catalog; auto-selected `YYYY-MM-DD (2023-12-21)` for Current Date | `YYYY-MM-DD` for Current Date | yes | `attributes.format.fromFormat` | |
| TO FORMAT | custom select | `YYYY-MM-DD`; `MM-DD-YYYY`; `MM/DD/YYYY`; `MM/DD/YY`; `DD-MM-YYYY`; `DD/MM/YYYY`; `DD/MM/YY`; `DD MMM YYYY`; `D MMMM YYYY`; `MMMM D, YYYY`; `MMM DD, YYYY`; `MMMM Do YYYY`; Unix seconds `X`; Unix milliseconds `x` | none | yes | `attributes.format.toFormat` | Saved `MM/DD/YYYY`. |
| Format Date and Time controls | conditional controls | date-time formats and timezone controls | n/a | inferred / uncaptured | not in representative JSON | Mode observed in ACTION TYPE; exact conditional rows not captured. |
| Compare dates controls | conditional controls | two date operands/comparison settings | n/a | inferred / uncaptured | not in representative JSON | Mode observed in ACTION TYPE; exact conditional rows not captured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000234 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000234",
  "stepIndex": 1,
  "order": 2,
  "attributes": {
    "type": "datetime_formatter",
    "action": "format_date",
    "format": {
      "type": "date",
      "fromField": "current_date",
      "fromFormat": "YYYY-MM-DD",
      "toFormat": "MM/DD/YYYY"
    }
  },
  "name": "Format date",
  "type": "datetime_formatter",
  "parentKey": "00000000-0000-4000-8000-000000000232"
}
```

## Location-data-dependent fields

- FIELD → Custom Fields: location custom-field catalog; the existing `zzz-spike-date` fixture is a date-compatible source.
- FIELD → Custom Values: location custom-value catalog.
- FIELD also exposes prior action outputs, whose branches depend on the workflow graph.

## Quirks

- Choosing `Current Date` automatically set FROM FORMAT to `YYYY-MM-DD`.
- Format labels show examples, while saved JSON stores format tokens only.

## Official runtime semantics

- The formatter emits output variables for downstream actions; documented examples include formatted date/time and comparison results. Older “premium” labeling is legacy rather than a current usage requirement.
- Source: [HighLevel Date/Time Formatter](https://help.gohighlevel.com/support/solutions/articles/48001238249).
