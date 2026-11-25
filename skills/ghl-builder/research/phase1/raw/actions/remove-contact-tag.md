# Action: Remove Contact Tag

- **UI name:** Remove contact tag · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `remove_contact_tag` (node default name "Remove Tag")
- **Screenshot:** `079-rm-tag-panel.png`
- **Premium:** no

## Config panel fields
Identical to Add Contact Tag: single **TAGS** multiselect (required, location-dependent), + ACTION NAME.

| UI label | Input type | Source | JSON path |
|---|---|---|---|
| ACTION NAME | text | — | node `name` ("Remove Tag") |
| TAGS | multiselect (chips) | location tags | `attributes.tags` (array of names) |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000281 kind=action -->
```json
{
  "name": "Remove Tag", "type": "remove_contact_tag",
  "attributes": { "tags": ["zzz-spike-tag"], "type": "remove_contact_tag" }
}
```
Note: this node echoes `attributes.type` = `"remove_contact_tag"` (Add Tag does not). Tags by **name**.

## Location-data-dependent fields
- TAGS → `GET /locations/{loc}/tags?limit=200`. Create via `POST /locations/{loc}/tags {name}`.

## Quirks
- Same as add-contact-tag: tags stored by name, must pre-exist, multiselect requires ≥1.
