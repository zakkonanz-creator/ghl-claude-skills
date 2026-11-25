# Action: Email verification

- **UI name:** Email verification · **Category:** Contact · **Priority:** LONG_TAIL
- **JSON `type`:** `contact_email_verification`
- **Screenshot:** `screenshots/b3-010-email-verification.png`
- **Premium/billed:** yes when executed; saved in Draft only

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Email verification` | yes | `name` | Only configurable field. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000265 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000265",
  "order": 4,
  "attributes": {
    "type": "contact_email_verification",
    "__customInputs__": {}
  },
  "name": "Email verification",
  "type": "contact_email_verification",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000252"
}
```

## Runtime semantics and safety

- Execution requires LC Email Verification enabled and the contact not excluded from verification.
- Official billing is $2.50 per 1,000 verifications. This workflow remained Draft and was never executed.
- Result categories are Valid, Risky, or Invalid; downstream If/Else can inspect `isEmailVerified` before sending email.
