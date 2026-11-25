# Action: Stripe one time charge

- **UI name:** Stripe one-time charge · **Category:** Payments
- **JSON `type`:** `stripe_one_time_charge`
- **Screenshot:** `screenshots/b6-009-stripe-one-time-charge.png`
- **Premium:** no
- **Status:** ⛔ integration-gated — Stripe connection and a Stripe Customer ID/card on file required

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Stripe one-time charge` | yes | `name` | |
| STRIPE CUSTOMER ID | text/custom value | Stripe customer ID | blank | yes | inferred / uncaptured: `attributes.customerId` | Contact must already have a Stripe Customer ID. |
| DESCRIPTION | textarea | free text/custom values | blank | no | inferred / uncaptured: `attributes.description` | |
| AMOUNT | numeric/custom value | charge amount | blank | yes | inferred / uncaptured: `attributes.amount` | |
| CURRENCY | dropdown | Stripe-supported currencies | Select | yes | inferred / uncaptured: `attributes.currency` | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000269 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000269",
  "order": 6,
  "attributes": {
    "type": "stripe_one_time_charge"
  },
  "name": "Stripe one-time charge",
  "type": "stripe_one_time_charge",
  "parentKey": "00000000-0000-4000-8000-000000000306"
}
```

## Gate evidence and limits

- The native panel exposed the listed controls, but Stripe is not connected and no charge-capable Stripe customer fixture exists. Connecting Stripe or creating a real card-on-file customer is outside the lab-fixture allowance.
- The screenshot/default unsaved panel is the UI-field evidence. The saved minimal node is a mechanical read-back witness and is not executable.

## Official runtime semantics

- This is a one-time charge with no automatic retry. Failures appear in Stripe transaction history; refunds are handled in Stripe.
- HighLevel documents it for agencies charging sub-account admins, not for sub-accounts charging contacts.
- Official source: https://help.gohighlevel.com/support/solutions/articles/48001202784
