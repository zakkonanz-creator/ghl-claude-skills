# Action: Create appointment / booking note

- **UI name:** Create appointment / booking note · **Category:** Appointments
- **JSON `type`:** `calendars_create_appointment_note`
- **Screenshot:** `screenshots/b6-010-create-appointment-booking-note.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Create appointment / booking note` | yes | `name` | |
| APPOINTMENT ID | text/custom value | appointment ID | blank | conditional | `attributes.appointmentId` | Mandatory unless an appointment-based trigger supplies context. |
| NOTE | textarea/custom values | free text, under 5,000 characters | blank | yes | `attributes.body` | Validation is strictly less than 5,000 characters in live metadata. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000268 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000268",
  "order": 7,
  "attributes": {
    "appointmentId": "zzz-spike-appointment-id",
    "body": "zzz-spike appointment note",
    "__customInputs__": {},
    "type": "calendars_create_appointment_note"
  },
  "name": "Create appointment / booking note",
  "type": "calendars_create_appointment_note",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000269"
}
```

## Capture notes

- The native panel was configured with a non-executed placeholder appointment ID and a minimal note; the complete node was saved to Draft and read back. No appointment was modified and the workflow was not published.

## Official runtime semantics

- Adds an internal note to a calendar appointment, service booking, or rental booking; notes surface on Contact, Opportunity, and Conversation records.
- This is one of the two appointment actions supported after the Service Booking (v2) trigger.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000004580
