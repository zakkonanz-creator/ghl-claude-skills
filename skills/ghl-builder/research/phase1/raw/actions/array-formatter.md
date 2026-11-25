# Action: Array formatter

- **UI name:** Array formatter · **Category:** Internal · **Priority:** LONG_TAIL (B5-1)
- **JSON `type`:** `array_functions`
- **Screenshot:** `screenshots/b5-001-array-formatter.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Array formatter` | yes | `name` | Canvas label. |
| Select type | custom select | `Find`; `Find by index`; `Filter`; `Line items`; `Math functions` | none | yes | `attributes.action` | Saved representative: `find_by_index`. |
| Select field | tree selector | Array-valued outputs from earlier actions. Live tree exposed `Custom Code` → `#1 Custom code` → `items`; no options existed before an upstream array output was present. | none | yes | `attributes.find_by_index.fromField` | Stored expression includes action type and step index. Source is workflow-data-dependent, not location-data-dependent. |
| INDEX | number | integer array index | blank | yes for Find by index | `attributes.find_by_index.index` | Saved `0`. |
| Find criteria | conditional controls | appears only for `Find` | n/a | inferred / uncaptured | not in representative JSON | Conditional variant not saved; exact paths intentionally omitted. |
| Filter criteria | conditional controls | appears only for `Filter` | n/a | inferred / uncaptured | not in representative JSON | Conditional variant not saved; exact paths intentionally omitted. |
| Line item field builder | conditional controls | appears only for `Line items` | n/a | inferred / uncaptured | not in representative JSON | Conditional variant not saved; exact paths intentionally omitted. |
| Math operation controls | conditional controls | sum/min/max/average/count family described by picker | n/a | inferred / uncaptured | not in representative JSON | Conditional variant not saved; exact paths intentionally omitted. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000232 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000232",
  "stepIndex": 2,
  "order": 1,
  "attributes": {
    "type": "array_functions",
    "action": "find_by_index",
    "find_by_index": {
      "fromField": "{{custom_code.1.output.items}}",
      "filters": [],
      "fields": [],
      "index": 0,
      "operations": []
    },
    "referenceObject": {
      "name": "alpha",
      "amount": 10
    },
    "referencePath": "output.items[]",
    "_testResponseVersion": 1
  },
  "name": "Array formatter",
  "type": "array_functions",
  "parentKey": "00000000-0000-4000-8000-000000000233"
}
```

## Location-data-dependent fields

None observed. The Select field catalog depends on outputs of earlier workflow actions. Its value is an expression such as `{{custom_code.1.output.items}}`.

## Quirks

- A required array source is unavailable when no earlier action exposes an array; the tree displays `No options available.`
- A tested Custom code node was used as the source fixture. Its saved `output.items` array caused the `items` leaf to appear in the selector.
- The saved node includes a representative first element under `referenceObject` and its schema path under `referencePath`.

## Official runtime semantics

- HighLevel documents five functions: Find by field, Find by index, Filter, Line items to text, and Line item process. Inputs are limited to flat, one-dimensional arrays; supported sources include Shopify triggers, Inbound Webhook, and Custom Webhook, and formatter actions can be chained.
- The action was formerly premium and is now free. Source: [HighLevel Array Functions](https://help.gohighlevel.com/support/solutions/articles/155000001466).
