# Action: Eliza AI appointment booking

- **Picker name:** Eliza AI appointment booking · **Panel title:** Add appointment booking AI bot
- **Category:** Eliza / External AI · **Priority:** LONG_TAIL
- **Native picker type:** `add_appointment_booking_ai_bot`
- **Screenshot:** `screenshots/b8-008-eliza-ai-appointment-booking.png`
- **Status:** ⛔ plan-gated — live panel says the feature is supported in the **Agency pro plan** and offers `Upgrade now`

## Gate-visible and documented fields

The current account cannot pass the plan gate, so no configuration controls or node JSON are exposed. The fields below are official behavior, explicitly uncaptured in this location.

| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| Calendar | location calendar select | yes | inferred / uncaptured | Calendar whose slots the bot fetches and offers. |
| Timeout | duration | yes | inferred / uncaptured | Total bot processing duration. |
| Booked branch | fixed outcome branch | automatic | inferred / uncaptured | Appointment successfully booked. |
| Timeout branch | fixed outcome branch | automatic | inferred / uncaptured | No reply before timeout. |
| Other failures branch | fixed outcome branch | automatic | inferred / uncaptured | Covers no slots, comprehension failure, and technical failure. |

## Gate evidence and runtime behavior

The native picker row ID is `cmp-act-opt__dv--add-action-add_appointment_booking_ai_bot`. Selecting it opens only the Agency Pro upgrade gate; therefore no action was saved and no JSON is claimed. The bot converses with the contact, fetches available times from the selected calendar, and suggests slots. An optional Eliza Agent Platform subscription can escalate unsuccessful bookings to humans.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Eliza AI appointment booking).
