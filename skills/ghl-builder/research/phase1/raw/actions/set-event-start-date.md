# Action: Set event start date

- **UI name:** Set event start date (panel title: Event start date) · **Category:** Internal · **Priority:** LONG_TAIL (B5-8)
- **JSON `type`:** `event_start_date`
- **Screenshot:** `screenshots/b5-008-set-event-start-date.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Set event start time` | yes | `name` | |
| TYPE | custom select | `Custom field`; `Specific date/time`; `Specific day` | none | yes | `attributes.event_start_type` | Saved Custom field as `custom_field`. Other modes are inferred / uncaptured. |
| SELECT CUSTOM FIELD | text with custom-variable picker | custom-field merge value; recommended formats `MM-DD-YYYY HH:MM` and `DD-MMM-YYYY HH:MM` | empty | yes for Custom field | `attributes.value` | Saved `{{contact.zzzspikedate}}`. |
| Specific date/time controls | conditional date/time picker | fixed date and time | n/a | inferred / uncaptured | not in representative JSON | TYPE option observed but not selected. |
| Specific day controls | conditional controls | day/time selection | n/a | inferred / uncaptured | not in representative JSON | TYPE option observed but not selected. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000259 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000259",
  "order": 7,
  "attributes": {
    "type": "event_start_date",
    "event_start_type": "custom_field",
    "value": "{{contact.zzzspikedate}}"
  },
  "name": "Set event start time",
  "type": "event_start_date",
  "parentKey": "00000000-0000-4000-8000-000000000257"
}
```

## Location-data-dependent fields

- SELECT CUSTOM FIELD uses the location's custom-variable catalog. This capture uses date field `zzz-spike-date` (`<dateFieldId>`, field key `contact.zzzspikedate`).

## Quirks

- The action-picker label, panel title, and default saved name differ: Set event start date, Event start date, and Set event start time.
- Production corpus comparison confirmed the same compact Custom field shape: `type`, `event_start_type`, and merge-field `value`.

## Official runtime semantics

- This action sets the event time used by downstream waits. For contacts arriving after the event, documented options are proceed normally, jump to a selected step, or skip outbound communication until the next wait.
- Scheduling uses the account timezone, and a later Set Event Start Date replaces the earlier value. Source: [HighLevel Set Event Start Date](https://help.gohighlevel.com/support/solutions/articles/48001202723).
