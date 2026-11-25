# Action: Appointment booking conversation AI bot

- **JSON `type`:** `appointment_booking_conversation_ai`
- **Screenshot:** `b1-015-appointment-booking-conversation-ai-bot.png`

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| ACTION NAME | text | node `name` | |
| CALENDAR | calendar picker | `attributes.calendarId` | Saved lab fixture `zzz-spike-calendar` |
| PERSONALITY | textarea | `attributes.personality` | Required |
| ADDITIONAL INSTRUCTIONS | textarea | `attributes.additionalInstructions` | UI marks required in current panel |
| MAXIMUM MESSAGES LIMIT… | number 5–25 | `attributes.botResponsesLimit` | Saved minimum 5 |
| TIME OUT (VALUE) | number | `attributes.timeOutDuration` | Saved 1 |
| TIME OUT (UNIT) | select | `attributes.timeOutDurationUnit` | Minutes/hours/days; saved hours |
| CHANNEL | select | `attributes.channel` | Live options Facebook, Instagram, SMS, WhatsApp; saved SMS |
| DON'T LET THE BOT SEND CONFIRMATION MESSAGE | checkbox | `attributes.shouldBotNotSendConfirmationMessage` | Saved false |
| WAIT TIME BEFORE RESPONDING (IN SECONDS) | number | `attributes.aiReplyWaitTime` | Default 10 |
| Branches | fixed transitions | `attributes.transitions` | Time Out; Appointment Was Booked; Appointment Not Booked |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000196 nodeId=00000000-0000-4000-8000-000000000237 kind=action -->
```json
{
  "name": "Appointment booking conversation AI bot",
  "type": "appointment_booking_conversation_ai",
  "attributes": {
    "calendarId": "<calendarId>",
    "personality": "Friendly and concise",
    "additionalInstructions": "Use the selected calendar.",
    "botResponsesLimit": 5,
    "timeOutDuration": 1,
    "timeOutDurationUnit": "hours",
    "channel": "SMS",
    "shouldBotNotSendConfirmationMessage": false,
    "aiReplyWaitTime": 10,
    "transitions": [
      {
        "name": "Time Out",
        "conditionType": "pre-defined"
      }
    ]
  }
}
```

No response before timeout follows the not-booked outcome. The workflow remains Draft/unpublished and was not executed.
