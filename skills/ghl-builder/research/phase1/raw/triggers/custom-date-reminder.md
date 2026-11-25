# Trigger: Custom date reminder

- **UI name:** Custom date reminder · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `custom_date_reminder`
- **Screenshot:** `screenshots/codex-003-custom-date-reminder.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Custom date reminder` | yes | `type` = `custom_date_reminder`; `masterType` = `highlevel` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Custom Date Reminder` | yes | `name` | |
| FILTERS → field family | hierarchical custom dropdown | `Contact date field`; `Has tag`; `Opportunity date field`; `Custom field` → observed `zzz_spike_field` | none | practically yes: a reminder needs a date source | `conditions[].title`, `field`, `operator`, `id` | Contact/Opportunity date families open a second value picker. |
| Contact date field → date field | searchable dropdown | **location-dependent** contact DATE fields; observed `zzz-spike-date` | none | yes when selected | `conditions[].value` = custom-field ID | JSON stores the custom-field ID, not name/key. |
| Match on the year along with the day and month | checkbox | off / on | off | no | top-level `match_year` | Captured enabled (`true`). |

### Filter mappings

| Filter UI | Operators / values | JSON mapping |
|---|---|---|
| Contact date field | implicit equality; values are contact DATE custom fields | `field:"contact.customFields"`, `operator:"custom-field-eq"`, `type:"select"`, `id:"custom-field"`, `value:<field-id>` |
| Has tag | tag membership; values are location tag names | tag membership condition |
| Opportunity date field | implicit selection from opportunity date fields | opportunity custom/date field condition |
| Custom field | observed `zzz_spike_field`; operators vary by data type | custom-field condition |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id064> kind=trigger -->
```json
{
  "id": "<id064>",
  "active": false,
  "schedule_config": {},
  "conditions": [
    {
      "operator": "custom-field-eq",
      "field": "contact.customFields",
      "value": "<dateFieldId>",
      "title": "Contact date field",
      "type": "select",
      "id": "custom-field"
    }
  ],
  "type": "custom_date_reminder",
  "masterType": "highlevel",
  "name": "Custom Date Reminder",
  "match_year": true,
  "custom_date_reminder_config": {
    "recordType": "contact",
    "customDateFieldId": "<dateFieldId>",
    "matchYear": true,
    "offsetDays": 0,
    "runHour": "8",
    "timezone": "",
    "last_run": ""
  },
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>"
}
```

## Location-data-dependent fields

- Contact DATE fields → location contact custom-field search endpoint. Fixture `zzz-spike-date` was created with ID `<dateFieldId>`, field key `contact.zzzspikedate`, data type `DATE`.
- Has tag → location tag catalog.
- Opportunity date field → location opportunity custom/date-field catalog.

## Quirks

- The DATE fixture did not appear as a top-level option. The UI path is `Contact date field` → `zzz-spike-date`.
- `match_year` is a top-level trigger property, not a condition field.
- Read-back also normalizes the selection into `custom_date_reminder_config`. Types are significant: `offsetDays` is a number, `runHour` is a string, and `matchYear` is boolean. The backend supplied the zero/default schedule members after the native save.
