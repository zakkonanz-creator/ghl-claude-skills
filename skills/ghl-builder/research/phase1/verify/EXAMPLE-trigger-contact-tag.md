# EXAMPLE (trigger) — Contact Tag  [demonstrates the ## Verified JSON format for triggers]

> This is a **format example** for VERIFY-PROTOCOL.md, not a harvest deliverable. The real
> Contact-tag trigger file is owned by the trigger harvester (`raw/triggers/contact-tag.md`).
> It shows how a trigger doc must carry a machine-checkable `## Verified JSON` block so
> `verify/verify-item.mjs` can diff it against the live `GET /trigger` response.

- **UI name:** Contact tag · **JSON `type`:** `contact_tag`
- Verified against the live trigger in `ZZZ-SPIKE-codex-triggers`.

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id003> kind=trigger -->
```json
{
  "id": "<id003>",
  "type": "contact_tag",
  "masterType": "highlevel",
  "name": "Contact Tag",
  "actions": [ { "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" } ],
  "conditions": [
    { "operator": "index-of-true", "field": "tagsAdded", "value": "zzz-spike-tag", "title": "Tag added", "type": "select", "id": "tag-added" }
  ]
}
```
Notes for readers: the documented JSON need only contain the keys/paths the doc *claims* — the
verifier checks each documented key exists in reality with a matching type (extra real keys like
`date_added`/`belongs_to` are allowed). `conditions` is documented as a 1-element array here; the
verifier compares array element-type, not full contents, so documenting one representative
condition is sufficient (the prose/field-table should still describe the full condition set).
