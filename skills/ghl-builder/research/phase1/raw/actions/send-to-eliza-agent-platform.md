# Action: Send to Eliza agent platform

- **UI name:** Send to Eliza agent platform · **Category:** Eliza / External AI · **Priority:** LONG_TAIL
- **Native picker type:** `send_to_eliza`
- **Screenshot:** `screenshots/b8-010-send-to-eliza-agent-platform.png`
- **Status:** ⛔ subscription-gated — requires an Eliza Agent Platform subscription and the sub-account must first be added in Eliza

## Gate-visible configuration

The subscription gate replaces the configuration panel, so no editable fields or saved node JSON are exposed. The native row ID is `cmp-act-opt__dv--add-action-send_to_eliza`. The gate text states:

- `Oops, this action is available only to those who have subscribed to Eliza agent platform`
- `If you have already purchased Eliza Agent Platform, please add this sub-account in Eliza first`

No purchase, subscription, external connection, or account linking was attempted.

## Runtime behavior

When configured, the action immediately delivers the contact to the Eliza Agent Platform for conversation. This differs from the legacy `Send to Eliza` tag, which waits for an inbound message before pushing the contact. Officially documented channels are Email, SMS, GMB, Facebook Messenger, Instagram, Reviews, and Calls.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Send to Eliza agent platform).
