# Action: Add to Notes

- **UI name:** Add to notes · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `add_notes` (node "Note") · **Screenshot:** `086-add-note-panel.png`
- **Premium:** no

## Fields
| UI label | Input | Source | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| TITLE | text (+merge) | free | `attributes.title` | |
| NOTE | rich text (formatting toolbar + merge fields) | free HTML | `attributes.html` | GHL `<p style>` shape |
| COLOR | swatch picker (10 colors) | fixed palette | `attributes.color` (hex, e.g. `#FEF0C7`) | default yellow `#FEF0C7` |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000242 kind=action -->
```json
{ "id": "00000000-0000-4000-8000-000000000242",
  "order": 5,
  "name": "Note", "type": "add_notes",
  "attributes": { "title": "Harvest note title",
    "html": "<p style=\"padding-left: 0px!important;\">Harvest note body {{contact.first_name}}</p>",
    "color": "#FEF0C7", "type": "add_notes" },
  "parentKey": "00000000-0000-4000-8000-000000000281" }
```
Not location-dependent. Merge fields pass through.
