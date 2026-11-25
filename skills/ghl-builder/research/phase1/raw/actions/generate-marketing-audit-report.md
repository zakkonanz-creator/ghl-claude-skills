# Action: Generate marketing audit report

- **UI name:** Generate marketing audit report · **Category:** Marketing · **Priority:** LONG_TAIL (B5-17)
- **JSON `type`:** `generate_marketing_audit_report`
- **Screenshot:** `screenshots/b5-017-generate-marketing-audit-report.png`
- **Status:** ⛔ feature-gated — Prospecting Tool is not enabled for this account

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Generate marketing audit report` | yes | `name` | |
| BUSINESS NAME | disabled text with contact-field placeholder | contact/company merge field | empty | yes | inferred / uncaptured | Disabled by Prospecting Tool gate. |
| ADDRESS | disabled text with contact-field placeholder | `{{contact.full_address}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| CITY | disabled text with contact-field placeholder | `{{contact.city}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| STATE | disabled text with contact-field placeholder | `{{contact.state}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| ZIPCODE / POSTAL CODE | disabled text with contact-field placeholder | `{{contact.postal_code}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| COUNTRY / COUNTRY CODE | disabled text with contact-field placeholder | `{{contact.country}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| PHONE | disabled text with contact-field placeholder | `{{contact.phone}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| EMAIL | disabled text with contact-field placeholder | `{{contact.email}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |
| WEBSITE | disabled text with contact-field placeholder | `{{contact.website}}` or equivalent | empty | no | inferred / uncaptured | Disabled by gate. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000261 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000261",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 7,
  "attributes": {
    "type": "generate_marketing_audit_report"
  },
  "name": "Generate marketing audit report",
  "type": "generate_marketing_audit_report",
  "parentKey": "00000000-0000-4000-8000-000000000260"
}
```

## Gate evidence and limits

- Panel displayed `Prospecting Tool Not Enabled` and instructed contacting the agency admin. All nine report inputs were disabled; native save rejected the required Business Name.
- Exact type came from the live builder action metadata. The minimal Draft-only node is a machine-checkable gate witness, not a complete executable report schema.
- The API-injected minimal witness did not reopen its panel in two fresh reviewer tabs; the captured screenshot and default disconnected panel remain the UI evidence for the Prospecting Tool gate.
- The Prospecting Tool was not enabled and no agency/account setting was changed.

## Official runtime semantics

- The Prospecting Tool must be enabled and subscribed on the subaccount before this action can run. Business matching uses the contact's Business Name, Website URL, Address, Email, and Phone.
- The report attaches to the prospect in Marketing → Prospecting Tool. Report Link and Business Name are exposed as variables for downstream email/SMS. Source: [HighLevel Generate Marketing Audit Report](https://help.gohighlevel.com/support/solutions/articles/155000007392).
