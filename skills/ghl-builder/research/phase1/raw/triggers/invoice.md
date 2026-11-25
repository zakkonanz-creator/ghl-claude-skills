# Trigger: Invoice

- **UI name:** Invoice · **Category:** Payments
- **JSON `type`:** `invoice`
- **Screenshot:** `screenshots/b6-001-invoice.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native trigger catalog | `Invoice` | yes | `type`, `masterType` | Shared trigger control. |
| WORKFLOW TRIGGER NAME | text | free text | `Invoice` | yes | `name` | |
| FILTERS → Invoice status | dropdown | Paid, Partially Paid, Sent, Viewed, Void | `Sent` | yes in the default panel | `conditions[].{field,operator,value,title,type}` | Live save captured `invoice.status == sent`. Official docs mention Overdue in the article title but omit it from the documented enum. |
| Add filters | condition builder | Tags, Custom Fields, Invoice Amount (including inclusive Between) | none | no | additional `conditions[]` | Option set is source-backed but not added in the saved representative node. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id031> kind=trigger -->
```json
{
  "id": "<id031>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "invoice.status",
      "value": "sent",
      "title": "Invoice status",
      "type": "select"
    }
  ],
  "type": "invoice",
  "masterType": "highlevel",
  "name": "Invoice",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Quirks and semantics

- The default panel preselects `Sent`, so the default save is not conditionless.
- Official guidance recommends separate workflows per status; a Paid workflow can remove contacts from reminder workflows.
- Saved in Draft and read back with `active:false`; the workflow was never published.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000002835
