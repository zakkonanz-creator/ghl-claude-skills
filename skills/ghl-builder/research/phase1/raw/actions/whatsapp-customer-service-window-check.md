# Action: Whatsapp: customer service window check

- **Screenshot:** `screenshots/b1-033-whatsapp-customer-service-window-check.png`
- **Status:** ⛔ subscription/integration-gated — `You do not have WhatsApp subscription!`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | |
| CONVERSATION PHONE NUMBER | WhatsApp number picker | yes | inferred / uncaptured | No subscription means no number |
| Open | fixed branch | automatic | inferred / uncaptured | Free-form allowed within 24h |
| Closed | fixed branch | automatic | inferred / uncaptured | Approved Marketing/Utility template required |

## Gate evidence

The native action and fixed branch names were enumerated to the subscription gate. No WhatsApp subscription/account/phone was connected, no action was saved, and no JSON is claimed.

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000196 nodeId=none kind=action -->
> **GATED STUB — non-machine-checkable-by-design.** No action was saved because: the sub-account has no WhatsApp subscription, account, or phone number.
