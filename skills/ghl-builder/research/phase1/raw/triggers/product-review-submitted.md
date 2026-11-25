# Trigger: Product review submitted

- **UI name:** Product review submitted · **Category:** Ecommerce
- **JSON `type`:** `leadgen_ecommerce_review_submitted`
- **Screenshot:** `screenshots/b6-023-product-review-submitted.png`
- **Premium:** no
- **Runtime prerequisite:** store reviews enabled

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Product Review Submitted` | yes | `name` | |
| Add filters | condition builder | Rating; Global Product; Store Name; Review Comment/Headline; User Email/Name | none | no | `conditions[]` | One Global Product per trigger; can run contact-less. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=<id069> kind=trigger -->
```json
{
  "id": "<id069>",
  "active": false,
  "conditions": [],
  "type": "leadgen_ecommerce_review_submitted",
  "masterType": "internal",
  "name": "Product Review Submitted",
  "actions": [{"workflow_id":"00000000-0000-4000-8000-000000000195","type":"add_to_workflow"}]
}
```

## Quirks and semantics

- Fires immediately on submission regardless of moderation status; editing a review does not re-fire it. Globally disabled reviews mean it never fires.
- Saved in Draft with `active:false`; never published. Official source: https://help.gohighlevel.com/support/solutions/articles/155000007386
