# Trigger: Contact tag

- **UI name:** Contact tag · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `contact_tag`
- **Screenshot:** `screenshots/codex-001-contact-tag.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Contact tag` | yes | `type` = `contact_tag`; `masterType` = `highlevel` | Shared trigger-panel control. |
| WORKFLOW TRIGGER NAME | text input | free text | `Contact Tag` | yes | `name` | |
| FILTERS → field | custom dropdown | `Tag added`; `Tag removed`; `Custom field` → location custom fields (observed `zzz_spike_field`) | none | no; saving without filters is allowed | `conditions[].title`, `field`, `id` | Add filters inserts another condition row. |
| Tag added / Tag removed → tag | searchable multiselect | **location-dependent** tag names; observed `zzz-spike-tag` | none | yes when that filter is selected | `conditions[].value` | Tag names, not IDs, are stored. The UI phrase “includes” maps to `index-of-true`. |

### Filter mappings

| Filter UI | Operators / values | JSON mapping |
|---|---|---|
| Tag added | implicit **includes**; values from location tags | `field:"tagsAdded"`, `operator:"index-of-true"`, `type:"select"`, `id:"tag-added"` |
| Tag removed | implicit **includes**; values from location tags | `field:"tagsRemoved"`, `operator:"index-of-true"`, `type:"select"`, `id:"tag-removed"` |
| Custom field (`zzz_spike_field`, TEXT) | `Contains phrase`; `Exact match phrase`; `Intent type`; `Is not empty`. Exact-match accepts one or more phrase chips. | Captured exact match: `field:"contact.<customFieldId>"`, `operator:"string-matches-any-of"`, `value:["spike-value"]`, `title:"zzz_spike_field"`, `type:"string"`, `id:"<customFieldId>"` |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id003> kind=trigger -->
```json
{
  "id": "<id003>",
  "active": false,
  "conditions": [
    {
      "operator": "index-of-true",
      "field": "tagsAdded",
      "value": "zzz-spike-tag",
      "title": "Tag added",
      "type": "select",
      "id": "tag-added"
    },
    {
      "operator": "index-of-true",
      "field": "tagsRemoved",
      "value": "zzz-spike-tag",
      "title": "Tag removed",
      "type": "select",
      "id": "tag-removed"
    },
    {
      "operator": "string-matches-any-of",
      "field": "contact.<customFieldId>",
      "value": ["spike-value"],
      "title": "zzz_spike_field",
      "type": "string",
      "id": "<customFieldId>"
    }
  ],
  "type": "contact_tag",
  "masterType": "highlevel",
  "name": "Contact Tag",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- Tag values → `GET backend.leadconnectorhq.com/locations/{locationId}/tags` (location tag catalog). JSON stores the selected tag **name**.
- Custom field branch → location custom-field search endpoint; field/operator shape varies by custom-field type.

## Quirks

- The saved canvas summary is `Tag added includes "zzz-spike-tag"`.
- The panel warns that only tag additions after publish qualify; existing tagged contacts require retroactive enrollment.
- Draft read-back correctly reports `active:false`.
