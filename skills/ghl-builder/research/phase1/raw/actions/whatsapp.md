# Action: WhatsApp

- **Screenshot:** `screenshots/b1-031-whatsapp.png`
- **Status:** ⛔ subscription/integration-gated — panel says `You do not have WhatsApp subscription!` and `Integrate WhatsApp now!`

## Config surface to gate
| UI field | Input type | Required | JSON mapping | Notes |
|---|---|---|---|---|
| ACTION NAME | text | yes | inferred / uncaptured | Default `WhatsApp` |
| SELECT WHATSAPP TEMPLATE | approved-template picker | yes in current panel | inferred / uncaptured | Free-form `None` only inside open service window |
| ENABLE BRANCHES | toggle | no | inferred / uncaptured | Generates branches for template quick-reply buttons |

## Gate evidence

The sub-account lacks the paid WhatsApp add-on ($10/month before Meta usage charges). No subscription or Meta connection was initiated, no template was selected, no action was saved, and no JSON is claimed.

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000196 nodeId=none kind=action -->
> **GATED STUB — non-machine-checkable-by-design.** No action was saved because: the sub-account has no WhatsApp subscription or Meta connection.
