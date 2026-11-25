# Action: Book appointment (Conversation AI)

- **Picker id:** `conversationai_book_appointment`
- **Screenshot:** `screenshots/b1-017-book-appointment-conversation-ai.png`
- **Status:** ⛔ context-gated — disabled Conversation AI row says `Conversation AI or Custom Trigger should be present to use this action`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Calendar Booking Prompt | textarea | yes | inferred / uncaptured | Auto-looping AI prompt |
| Select Calendar | calendar picker | yes | inferred / uncaptured | |
| Appointment Booked | branch | automatic | inferred / uncaptured | |
| Appointment Not Booked | branch | automatic | inferred / uncaptured | |

## Gate evidence

The picker contains two same-named rows: enabled Communication `appointment_booking` (captured separately) and disabled Conversation AI `conversationai_book_appointment`. The latter was hovered to expose the exact context prerequisite. It was not saved and no JSON is claimed.
