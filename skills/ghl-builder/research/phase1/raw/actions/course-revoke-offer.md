# Course revoke offer

- **UI name:** Course revoke offer · **Category:** Membership · **Priority:** LONG_TAIL (B4-30)
- **JSON `type`:** `membership_revoke_offer`
- **Screenshot:** `screenshots/b4-030-course-revoke-offer.png`
- **Status:** ⛔ resource-gated — required pre-existing Memberships offer is absent/unselected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Course revoke offer` | yes | `name` | |
| OFFER | custom select | pre-existing Memberships Offers | `Select` | yes | inferred / uncaptured | Required offer prevented native save. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000270 kind=action -->
```json
{"id":"00000000-0000-4000-8000-000000000270","order":7,"attributes":{"type":"membership_revoke_offer"},"name":"Course revoke offer","type":"membership_revoke_offer","parentKey":"00000000-0000-4000-8000-000000000271"}
```

## Gate evidence and limits

- The required OFFER remains `Select`; native save could not produce an executable action. Screenshot/default unsaved panel is UI evidence; the exact selected-panel type underpins a mechanical-only Draft witness.

## Official runtime semantics

- Revokes access to the selected offer. Official docs do not cover partial/module revocation, grace periods, or restore behavior. Source: [HighLevel Course Revoke Offer](https://help.gohighlevel.com/support/solutions/articles/155000003382).
