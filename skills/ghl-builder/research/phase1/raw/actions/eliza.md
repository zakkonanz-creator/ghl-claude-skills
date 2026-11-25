# Action picker category: Eliza

- **UI name:** Eliza · **Category:** External AI · **Priority:** LONG_TAIL
- **Screenshot:** `screenshots/b8-007-eliza-expanded.png`
- **Status:** ⛔ non-action category — there is no standalone Eliza action row or savable node

## Picker evidence

Searching the live action picker for `Eliza` returns a collapsible category named **Eliza**, not an action. Expanding it exposes exactly two executable child actions:

1. Eliza AI appointment booking
2. Send to Eliza agent platform

Because the category itself cannot be selected, it has no configuration panel, JSON `type`, saved node, or machine-verifiable workflow state. Its two child actions are documented separately. This is therefore documented to the picker gate rather than represented by invented JSON.

## Runtime context

Eliza is the legacy conversational appointment-booking bot. No official deprecation notice was found, although Conversation AI Appointment Booking is the current-generation equivalent.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Eliza).
