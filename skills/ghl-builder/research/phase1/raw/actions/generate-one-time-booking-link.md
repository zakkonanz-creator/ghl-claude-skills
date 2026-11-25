# Action: Generate one time booking link

- **UI name:** Generate one time booking link · **Category:** Appointments
- **JSON `type`:** `calendars_generate_one_time_booking_link`
- **Screenshots:** `screenshots/b6-011-generate-one-time-booking-link.png`, `screenshots/b6-011-generate-one-time-booking-link-fixture.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Generate one time booking link` | yes | `name` | |
| CALENDAR | calendar dropdown | active location calendars | none | yes | `attributes.calendarId` | Captured `zzz-spike-calendar`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000320 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000320",
  "stepIndex": 1,
  "order": 8,
  "attributes": {
    "calendarId": "<calendarId>",
    "type": "calendars_generate_one_time_booking_link",
    "__customInputs__": {}
  },
  "name": "Generate one time booking link",
  "type": "calendars_generate_one_time_booking_link",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000268"
}
```

## Fixture and capture evidence

- The empty catalog initially showed `No Data`. Created the permitted active Personal calendar fixture `zzz-spike-calendar` in Calendar Settings, selected it in the native panel, then saved and read back the complete Draft node.
- No link was generated because the workflow was not published or executed.

## Official runtime semantics

- Generates a fresh unique scheduling link per execution. It is single-use and expires when booked; the result is available as the action's `One Time Link` custom value.
- The current live panel additionally says: `The link will auto expire in 30 days from the date of generation.` This time limit was absent from the cited official article captured in the batch notes, so the live UI is newer or more specific.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000003461
