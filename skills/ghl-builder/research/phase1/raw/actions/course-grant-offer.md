# Course grant offer

- **UI name:** Course grant offer · **Category:** Membership · **Priority:** LONG_TAIL (B4-29)
- **JSON `type`:** `membership_grant_offer`
- **Screenshot:** `screenshots/b4-029-course-grant-offer.png`
- **Status:** ⛔ resource-gated — required pre-existing Memberships offer is absent/unselected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Course grant offer` | yes | `name` | |
| OFFER | custom select | pre-existing Memberships Offers | `Select` | yes | inferred / uncaptured | Required offer prevented native save. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000271 kind=action -->
```json
{"id":"00000000-0000-4000-8000-000000000271","order":6,"attributes":{"type":"membership_grant_offer"},"name":"Course grant offer","type":"membership_grant_offer","parentKey":"00000000-0000-4000-8000-000000000219"}
```

## Gate evidence and limits

- The default panel exposes required OFFER with `Select`; no offer was configured and native save could not produce an executable node. The screenshot/default unsaved panel is UI evidence; the exact type came from selected-panel state and the minimal Draft witness is mechanical-only.

## Official runtime semantics

- Grants a pre-existing Memberships offer; offers cannot be created from the workflow. Existing access is not duplicated and progress is not reset, but later workflow steps still run.
- Credentials/magic links require a separate email. A workflow welcome email disables the default membership Welcome Email. Sources: [HighLevel Course Grant Offer](https://help.gohighlevel.com/support/solutions/articles/155000003378), [welcome-email behavior](https://help.gohighlevel.com/support/solutions/articles/155000002845).
