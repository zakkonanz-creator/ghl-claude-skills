# Action: Custom code

- **UI name:** Custom code · **Category:** Internal · **Priority:** LONG_TAIL (B5-2)
- **JSON `type`:** `custom_code`
- **Screenshot:** `screenshots/b5-002-custom-code.png`
- **Premium:** yes — the panel says additional charges apply per execution; workflow remains Draft and was not published

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Action name | text | free text | `Custom code` | yes | `name` | |
| Language | select | `Javascript` observed | `Javascript` | yes | `attributes.language` | Saved as lowercase `javascript`. |
| Property to include in code → Key | repeatable text | free text | example `number1`, `number2` | no | keys of `attributes.inputData` | `Add property` adds rows. Final saved representative intentionally uses an empty object. |
| Property to include in code → Value | repeatable text/custom-value picker | literal or prior-step/custom value | example `10`, `20` | yes when property row exists | values of `attributes.inputData` | The custom-value picker is workflow/location-data-dependent. |
| Code | Monaco code editor | JavaScript | example sum program | yes | `attributes.code` | Output must be a JavaScript object or array of objects. |
| Build with AI | button | AI-assisted editor | n/a | no; inferred / uncaptured | not persisted in representative JSON | Authoring aid, not a captured node field. |
| Snippets | button | code snippets | n/a | no; inferred / uncaptured | not persisted in representative JSON | Authoring aid. |
| Test your code | button + test drawer | test values per input property; Response and Console tabs | untested | yes before Save action | `attributes.output` | First click opens Test setup; the drawer's `Test your Code` runs it. A successful response is mandatory. |
| Format code | button | formatter | n/a | no; inferred / uncaptured | not persisted in representative JSON | Authoring aid. |
| Reference output | expandable output reference | last successful test output | none until tested | no | `attributes.output` | Also feeds downstream action pickers. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000233 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000233",
  "stepIndex": 1,
  "order": 0,
  "attributes": {
    "code": "output = { items: [{ name: 'alpha', amount: 10 }, { name: 'beta', amount: 20 }] }\n",
    "inputData": {},
    "language": "javascript",
    "output": {
      "items": [
        {
          "name": "alpha",
          "amount": 10
        },
        {
          "name": "beta",
          "amount": 20
        }
      ]
    }
  },
  "name": "Custom code",
  "type": "custom_code",
  "next": "00000000-0000-4000-8000-000000000232"
}
```

## Location-data-dependent fields

- Property values can use the standard custom-value picker, which exposes contact/location data and prior action outputs. The representative node uses literals/no input properties.

## Quirks

- Clicking the first `Test your code` button opens a test drawer; it does not execute immediately. Test values must be supplied there, then the drawer's `Test your Code` button executes the code.
- Save action is blocked with `Custom Code should be successfully executed before saving the action` until a successful test exists.
- The node's saved `output` is a concrete test response and becomes the schema source for downstream actions such as Array formatter.

## Official runtime semantics

- Custom Code is a premium action. JavaScript is the default language and Python is also supported; named inputs arrive through `inputData`.
- Output must be an object or an array of objects. A successful test is mandatory before save, and custom values are not passed during testing. Sources: [HighLevel Custom Code](https://help.gohighlevel.com/support/solutions/articles/155000003362), [Custom Code testing](https://help.gohighlevel.com/support/solutions/articles/155000002253).
