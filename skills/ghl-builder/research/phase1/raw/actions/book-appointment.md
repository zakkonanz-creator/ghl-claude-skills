# Action: Book appointment

- **UI name:** Book appointment · **JSON `type`:** `appointment_booking`
- **Screenshot:** `b1-016-book-appointment.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | |
| APPOINTMENT TITLE | text/custom values | `attributes.title` | Required |
| CALENDAR | calendar picker | `attributes.calendarId` | Saved lab fixture |
| TIMEZONE | timezone picker | `attributes.timezone` | Defaults account timezone |
| START DATE & TIME | date/time picker | `attributes.startDateTime` | Stored ISO UTC |
| TEAM MEMBER | user picker | `attributes.assignedUserId` | Appears after calendar selection; required |
| OVERRIDE AVAILABILITY | toggle | `attributes.ignoreFreeSlots` | Saved false |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000209 kind=action -->
```json
{
  "name": "Book appointment",
  "type": "appointment_booking",
  "attributes": {
    "title": "ZZZ spike appointment",
    "calendarId": "<calendarId>",
    "timezone": "America/Los_Angeles",
    "startDateTime": "2026-07-24T19:00:00.000Z",
    "assignedUserId": "<userId>",
    "ignoreFreeSlots": false,
    "type": "appointment_booking"
  }
}
```

This standard workflow action schedules a fixed appointment and is distinct from the auto-looping Conversation AI Flow **Book appointment** action. It was saved only in the Draft workflow and not executed.
