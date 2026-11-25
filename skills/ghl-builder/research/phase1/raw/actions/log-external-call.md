# Action: Log external call

- **JSON `type`:** `log-external-call` · **Screenshot:** `b1-023-log-external-call.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | |
| DIRECTION | text/custom value | `attributes.direction` | Required; inbound/outbound |
| DATE | ISO-8601 text/custom value | `attributes.date` | Blank uses current date/time |
| TO | phone text/custom value | `attributes.to` | Receiver number |
| FROM | phone text/custom value | `attributes.from` | Caller number |
| CALL STATUS | text/custom value | `attributes.status` | Saved `completed` |
| ATTACHMENT | URL/custom value | `attributes.attachments` | Recording; saved blank string |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000207 kind=action -->
```json
{
  "name": "Log external call",
  "type": "log-external-call",
  "attributes": {
    "direction": "inbound",
    "date": "",
    "to": "+15550001111",
    "from": "+15550002222",
    "status": "completed",
    "attachments": "",
    "type": "log-external-call"
  }
}
```

This logs a third-party dialer call into the contact conversation; it does not place a call. Draft workflow only, never executed.
