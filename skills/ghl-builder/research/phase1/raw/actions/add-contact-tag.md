# Action: Add Contact Tag

- **UI name:** Add contact tag · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `add_contact_tag` (node default name "Add Tag")
- **Screenshot:** `063-add-contact-tag-panel.png`, saved `078-add-contact-tag-saved.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | — | "Add Tag" | node name | node `name` | |
| TAGS | multiselect (chips) + "⋮" menu | **location-dependent** contact tags; supports **"Add New tag (…)"** to create inline | none | **yes** ("Tags cannot be empty") | `attributes.tags` (array of tag **names**, strings) | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000279 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000279",
  "order": 3,
  "name": "Add Tag",
  "type": "add_contact_tag",
  "attributes": { "tags": ["zzz-spike-tag"] },
  "parentKey": "00000000-0000-4000-8000-000000000280"
}
```

## Location-data-dependent fields
- **TAGS** → location tag list: `GET backend.leadconnectorhq.com/locations/{loc}/tags?limit=200` → `{tags:[{id,name,locationId}]}`.
- **Create a tag:** `POST /locations/{loc}/tags` body `{name}` → 201 `{tag:{id,name,locationId}}`. (Verified — created `zzz-spike-tag` id `<tagId>`.)

## Quirks
- **Tags are stored by NAME (string), not ID**, in `attributes.tags`. The engine only needs the tag name; the tag must already exist in the location (create it first via `POST /locations/{loc}/tags` if missing — the UI's "Add New tag" does this).
- Blank sandbox has **zero** tags initially — fixtures must be created.
- The UI tags multiselect is a portalled Vue component; scripted selection works only after the tag exists (typing a non-existent name shows "No Data → Add New tag").
