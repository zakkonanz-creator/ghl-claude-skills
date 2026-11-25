# Action: Send recurring invoice

- **UI name:** Send recurring invoice · **Category:** Payments
- **JSON `type`:** `create_recurring_invoice`
- **Screenshot:** `screenshots/b6-008-send-recurring-invoice.png`
- **Premium:** no
- **Status:** ⛔ prerequisite-gated — invoice template and payment gateway required

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Send recurring invoice` | yes | `name` | |
| FROM USER | user dropdown | location users | none | yes | inferred / uncaptured: `attributes.userId` | |
| INVOICE TEMPLATE | async dropdown | invoices-api `template/list-select-options` | none | yes; gate | inferred / uncaptured: `attributes.templateId` | |
| PAYMENT MODE | toggle | Live / Test | Live (`"true"`) | yes | inferred / uncaptured: `attributes.liveMode` | Affects future invoices. |
| START DATE | radio + conditional date | Action Date (`triggerDate`), Fixed Date (`fixedDate`) | Action Date | yes | inferred / uncaptured: `attributes.startDateType`, `attributes.startDate` | Fixed date cannot be in the past. |
| END | dropdown + conditional input | Never (`never`), By (`by`), After (`after`) | Never | yes | inferred / uncaptured: `attributes.endType`, `attributes.endDate`, `attributes.count` | By is available for fixed start dates. |
| HOW OFTEN? | dropdown | Daily, Weekly, Monthly, Yearly | none | yes | inferred / uncaptured: `attributes.intervalType` | Controls conditional schedule fields. |
| EVERY X | positive integer | interval | blank | yes | inferred / uncaptured: `attributes.interval` | Weekly/monthly schedules also expose advance/day selectors; yearly exposes month/day. |
| ENABLE AUTOPAYMENT | toggle | enabled / disabled | enabled (`"true"`) | yes | inferred / uncaptured: `attributes.enableAutopayment` | Stripe; activates after first successful manual payment. |
| CHANNEL | dropdown | Email & Text, Email, Text | Email & Text | yes | inferred / uncaptured: `attributes.action` | Values `sms_and_email`, `email`, `sms`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000306 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000306",
  "order": 5,
  "attributes": {
    "type": "create_recurring_invoice"
  },
  "name": "Send recurring invoice",
  "type": "create_recurring_invoice",
  "parentKey": "00000000-0000-4000-8000-000000000321"
}
```

## Gate evidence and limits

- The native panel exposed the listed controls, but the lab has no invoice template or connected payment gateway. No gateway was connected.
- The screenshot/default unsaved panel is the UI-field evidence. The saved minimal node is a mechanical read-back witness, does not reopen its panel in a fresh read-only tab, and is not executable.

## Official runtime semantics

- Auto-Pay requires Stripe and starts only after the first successful manual payment. A failed Auto-Pay leaves the invoice unpaid.
- Live/Test changes affect future invoices only.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000005627
