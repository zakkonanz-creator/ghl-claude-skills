# Action: Send Review Request

- **UI name:** Send review request · **Category:** Communication · **Priority:** CORE
- **JSON `type`:** `review_request` · **Screenshot:** `102-review-req-panel.png`
- **Premium:** no · **Description:** "Send a Review Request to the contact"

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| REVIEW TYPE | dropdown ("Select") | **SMS / E-mail / WhatsApp** | `attributes.review_type` (`sms`\|`email`\|`whatsapp`) | required |
| OVERRIDE REVIEW LINK | dropdown | **No override** (default) / custom link | `attributes.overrideReviewLink` (`"default"` or a link) | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000276 kind=action -->
```json
{ "name": "Send review request", "type": "review_request",
  "attributes": { "type": "review_request", "review_type": "sms", "overrideReviewLink": "default" } }
```

## Quirks
- Review request **message content is configured in Reputation settings** (location-level), not in this action panel — the action only picks channel + link override.
- Not workflow-data-dependent beyond the reputation config.
