# Action: Manual action to SMS

- **UI name:** Manual SMS · **JSON `type`:** `manual-sms`
- **Screenshot:** `b1-006-manual-action-to-sms.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | Default `Manual SMS` |
| TEMPLATES | picker | inferred / uncaptured | Optional |
| MESSAGE | rich text | `attributes.body` | Required; representative text saved |
| Add attachments | upload or URL | `attributes.attachments` | Saved empty array |
| TEST PHONE NUMBER | phone text | inferred / uncaptured | Test-only, not part of saved execution node |
| ASSIGN TO USER | user multiselect | inferred / uncaptured | Selected user with contact access → selected user; selected user without access → contact owner; none selected → contact owner; if neither exists → Unassigned. Saved blank. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000199 kind=action -->
```json
{
  "name": "Manual SMS",
  "type": "manual-sms",
  "attributes": {
    "body": "ZZZ spike manual SMS",
    "attachments": []
  }
}
```

Creates a human task under **Conversations > Manual Actions** rather than sending automatically. Workflow remains Draft/unpublished.
