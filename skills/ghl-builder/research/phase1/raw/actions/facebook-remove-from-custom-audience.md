# Action: Facebook - Remove from custom audience

- **UI name:** Facebook - Remove from custom audience · **Category:** Marketing · **Priority:** LONG_TAIL (B5-16)
- **JSON `type`:** `facebook_remove_from_custom_audience`
- **Screenshot:** `screenshots/b5-016-facebook-remove-from-custom-audience.png`
- **Status:** ⛔ integration-gated — Facebook connection required; no account was connected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Connect your account | button | Facebook OAuth | n/a | gate | inferred / uncaptured | Protocol forbids connecting an external account. |
| ACTION NAME | text | free text | `Remove from customer audience - Facebook` | yes | `name` | Default uses “customer,” unlike picker/panel “custom.” |
| FACEBOOK CUSTOMER AUDIENCE ID | text/select | connected Facebook audience catalog/ID | empty | yes | inferred / uncaptured | Not reachable as a usable value before connection. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000260 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000260",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 6,
  "attributes": {
    "type": "facebook_remove_from_custom_audience"
  },
  "name": "Remove from customer audience - Facebook",
  "type": "facebook_remove_from_custom_audience",
  "parentKey": "00000000-0000-4000-8000-000000000254"
}
```

## Gate evidence and limits

- Panel explicitly displayed `Facebook connection required` and `Connect your account`.
- Exact type came from live builder action metadata. The minimal Draft-only node is a machine-checkable gate witness, not a complete executable audience action.
- No Facebook account, audience, credential, or billing setting was connected.

## Official runtime semantics

- HighLevel has no dedicated article for this action. Official Meta integration notes indicate that an audience feeding a lookalike cannot be deleted until the dependent lookalike is removed.
- Source: [HighLevel Facebook integration](https://help.gohighlevel.com/support/solutions/articles/155000002294).
