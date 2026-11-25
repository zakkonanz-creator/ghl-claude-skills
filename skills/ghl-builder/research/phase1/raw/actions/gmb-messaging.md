# Action: GMB messaging

- **Screenshot:** `screenshots/b1-003-gmb-messaging.png`
- **Status:** ⛔ product-gated — picker item is disabled and exposes the literal tooltip `this_option_is_no_longer`

## Config surface to gate

| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | Legacy default `GMB` |
| MESSAGE | message composer | yes | inferred / uncaptured | Legacy custom values + trigger links |

## Gate evidence

The live action picker still lists **GMB messaging**, but the row is disabled; therefore no panel can be opened and no node can be saved. Google removed Business Profile chat on July 31, 2024. No integration was connected and no JSON is claimed.
