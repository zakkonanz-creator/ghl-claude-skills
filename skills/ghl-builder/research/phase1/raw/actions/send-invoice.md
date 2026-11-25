# Action: Send invoice

- **UI name:** Send invoice · **Category:** Payments
- **JSON `type`:** `payments_create_invoice`
- **Screenshot:** `screenshots/b6-007-send-invoice.png`
- **Premium:** no
- **Status:** ⛔ prerequisite-gated — invoice template and connected payment gateway required

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Send invoice` | yes | `name` | |
| FROM USER | user dropdown | location users | none | yes | inferred / uncaptured: `attributes.userId` | |
| INVOICE TEMPLATE | async dropdown | invoices-api `template/list-select-options` | none | yes; gate | inferred / uncaptured: `attributes.templateId` | Lab lacked a usable invoice template/gateway configuration. |
| PAYMENT MODE | radio | Live (`"true"`), Test (`"false"`) | Live | yes | inferred / uncaptured: `attributes.liveMode` | String metadata values. |
| CHANNEL | dropdown | Email & Text, Email, Text | Email & Text | yes | inferred / uncaptured: `attributes.action` | Values `sms_and_email`, `email`, `sms`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000307 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000307",
  "order": 2,
  "attributes": {
    "type": "payments_create_invoice"
  },
  "name": "Send invoice",
  "type": "payments_create_invoice",
  "parentKey": "00000000-0000-4000-8000-000000000308"
}
```

## Gate evidence and limits

- The screenshot/default unsaved panel is the UI-field evidence: it exposed all controls but could not satisfy the required template/gateway prerequisite. No gateway was connected.
- Exact type and field metadata came from live builder state. The minimal Draft-only node is a read-back-verified mechanical witness, does not reopen its panel in a fresh read-only tab, and is not an executable invoice action.

## Official runtime semantics

- Creates one invoice per execution. Test mode creates non-chargeable sandbox invoices. Email & Text falls back to email-only if the contact has no phone.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000003494
