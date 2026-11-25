# Trigger: Order form submission

- **UI name:** Order form submission · **Category:** Payments
- **JSON `type`:** `two_step_form_submission`
- **Screenshot:** `screenshots/b6-002-order-form-submission.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker | native catalog | `Order form submission` | yes | `type`, `masterType` | UI label differs from JSON type. |
| WORKFLOW TRIGGER NAME | text | free text | `Order Form Submission` | yes | `name` | |
| Add filters | condition builder | Funnel/Website, Page, Product(s), Submission Type | none | no | `conditions[]` | Representative default save is conditionless. Submission Type official enum: Bump, Opt-In, Sale, Upsell. Location funnels/pages/products are location-dependent. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id096> kind=trigger -->
```json
{
  "id": "<id096>",
  "active": false,
  "conditions": [],
  "type": "two_step_form_submission",
  "masterType": "highlevel",
  "name": "Order Form Submission",
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000195",
      "type": "add_to_workflow"
    }
  ]
}
```

## Location-data-dependent fields

- Funnel/Website, Page, and Product filters use the location's commerce/page catalogs; their specific endpoints were not opened because the representative default node was saved without filters.

## Quirks and semantics

- Fires on submission; payment completion is not required. `Opt-In` specifically includes information entry without order completion.
- Saved in Draft and read back with `active:false`; never published.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000003253
