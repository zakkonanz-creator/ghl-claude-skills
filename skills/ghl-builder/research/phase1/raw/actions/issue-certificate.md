# Issue certificate

- **UI name:** Issue certificate · **Category:** Certificates · **Priority:** LONG_TAIL (B4-32)
- **JSON `type`:** `issue_certificates_workflow`
- **Screenshot:** `screenshots/b4-032-issue-certificate.png`
- **Status:** ⛔ resource-gated — no certificate/badge template exists (`No Data`)

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Issue certificate` | yes | `name` | |
| TEMPLATES | searchable custom select | Certificates templates from the location Certificates API | empty; picker displayed `No Data` | yes | inferred / uncaptured | Missing template prevented native save. Live metadata identifies field `templateId`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000272 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000272",
  "order": 8,
  "attributes": { "type": "issue_certificates_workflow" },
  "name": "Issue certificate",
  "type": "issue_certificates_workflow",
  "parentKey": "00000000-0000-4000-8000-000000000270"
}
```

## Gate evidence and limits

- Opening required TEMPLATES displayed `No Data`. The screenshot/default unsaved panel is UI evidence; the exact type and `templateId` requirement came from live selected-panel metadata. The minimal Draft node is a machine-checkable witness, not executable configuration.
- Live panel copy says the selected certificate template is sent by email and warns that some custom values may be blank and should be rechecked before sending.

## Official runtime semantics

- Issues a certificate or badge template from any trigger. A template under Memberships → Certificates is prerequisite, and issued items appear under Issued Certificates.
- Official articles do not confirm automatic email delivery, while the current live panel explicitly says the selected certificate is sent by email; this UI/documentation difference is recorded rather than reconciled by assumption.
- Sources: [HighLevel Certificates](https://help.gohighlevel.com/support/solutions/articles/155000002376), [certificate and badge workflows](https://help.gohighlevel.com/support/solutions/articles/155000005887).
