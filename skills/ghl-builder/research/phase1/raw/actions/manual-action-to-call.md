# Action: Manual action to call

- **UI name:** Manual call · **Checklist label:** Manual action to call
- **JSON `type`:** `manual-call` · **Screenshot:** `b1-005-manual-action-to-call.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | Default `Manual call` |
| ASSIGN TO USER | user multiselect | inferred / uncaptured | Selected user with contact access → selected user; selected user without access → contact owner; none selected → contact owner; if neither exists → Unassigned. Saved blank. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000197 kind=action -->
```json
{
  "name": "Manual call",
  "type": "manual-call",
  "attributes": {}
}
```

This creates a task in **Conversations > Manual Actions**. The workflow advances only after that manual task is completed or deleted; placing a call elsewhere does not advance it. Workflow remains Draft/unpublished.
