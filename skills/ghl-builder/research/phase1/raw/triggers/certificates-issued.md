# Certificates issued

- **UI name:** Certificates issued · **Category:** Certificates · **Priority:** LONG_TAIL (B4-31)
- **JSON `type`:** `certificates_issued_workflow`
- **Screenshot:** `screenshots/b4-031-certificates-issued.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Certificates Issued` | yes | `name` | Picker wording differs from official singular “Certificate Issued.” |
| Additional filters | optional filters | none officially documented | no filters | no | inferred / uncaptured | Add filters visible; per-template filtering is undocumented. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id057> kind=trigger -->
```json
{"id":"<id057>","active":false,"actions":[{"workflow_id":"00000000-0000-4000-8000-000000000181","type":"add_to_workflow"}],"conditions":[],"type":"certificates_issued_workflow","masterType":"internal","workflow_id":"00000000-0000-4000-8000-000000000181","location_id":"<locationId>","name":"Certificates Issued","workflowsTriggerType":"INTERNAL","schedule_config":{}}
```

## Official runtime semantics

- Fires when a course certificate is generated. Certificates and a template are prerequisites; issued certificates appear under Memberships → Certificates → Issued Certificates. No trigger filters are documented.
- Source: [HighLevel Certificates](https://help.gohighlevel.com/support/solutions/articles/155000002376).
