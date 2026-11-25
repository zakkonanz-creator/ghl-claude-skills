# Action: WhatsApp interactive messages

- **Screenshot:** `screenshots/b1-032-whatsapp-interactive-messages.png`
- **Status:** ⛔ subscription/integration-gated — `You do not have WhatsApp subscription!`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | |
| Message type | quick replies / list / location / contact / website | yes | inferred / uncaptured | One type per message |
| Type-specific content | structured editor | yes | inferred / uncaptured | Quick replies max 3; footer ≤60 chars |
| Branches | generated outcomes | automatic | inferred / uncaptured | Includes Link Opened, Not Delivered, Timeout as applicable |

## Gate evidence

The action requires both the WhatsApp subscription/integration and an open 24-hour customer-service window. No subscription or account was connected, no action was saved, and no JSON is claimed.

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000196 nodeId=none kind=action -->
> **GATED STUB — non-machine-checkable-by-design.** No action was saved because: the sub-account has no WhatsApp subscription or connected account.
