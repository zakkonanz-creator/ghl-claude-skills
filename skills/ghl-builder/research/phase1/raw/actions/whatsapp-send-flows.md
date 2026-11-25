# Action: Whatsapp: send flows

- **Screenshot:** `screenshots/b1-034-whatsapp-send-flows.png`
- **Status:** ⛔ subscription/integration/fixture-gated — `You do not have WhatsApp subscription!`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | |
| SELECT WHATSAPP FLOW | approved-flow picker | yes | inferred / uncaptured | Built under Settings > WhatsApp > Flows |
| TIMEOUT TIME FOR FLOWS | number | yes | inferred / uncaptured | |
| TIME OUT (UNIT) | select | yes | inferred / uncaptured | Minutes/hours/days; default Hours visible |

## Gate evidence

The panel was enumerated to the missing-subscription gate. Open-window sends must follow the Window Check Open branch; WhatsApp Coexistence is unsupported. No subscription/account/Flow was created or connected, no action was saved, and no JSON is claimed.
