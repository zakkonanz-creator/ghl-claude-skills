# Action: Meta conversion API

- **UI name:** Meta conversion API · **Category:** Marketing · **Priority:** LONG_TAIL (B5-18)
- **JSON `type`:** `facebook_conversion_api`
- **Screenshot:** `screenshots/b5-018-meta-conversion-api.png`
- **Integration:** saved in Draft with inert `zzz-spike-*` test values; no external account connected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Meta Conversion API` | yes | `name` | |
| SELECT THE CONNECTION TYPE | radio | `INTEGRATION`; `AD MANAGER` | `INTEGRATION` | yes | `attributes.connection_type` | Saved `INTEGRATION`; Ad manager variant is inferred / uncaptured. |
| EVENT TYPE | custom select | observed `Funnel Event`; other connection-dependent event types inferred / uncaptured | `Funnel Event` | yes | `attributes.event_type` | Persists `funnel_event`. |
| ACCESS TOKEN | text | Meta access token | empty | yes | `attributes.access_token` | Saved inert test text, not a real credential. |
| DATASET ID | text | Meta dataset/pixel ID | empty | yes | `attributes.pixel_id` | UI label maps to saved `pixel_id`. |
| FACEBOOK EVENT NAME | custom select | Meta standard event names | `Lead` | yes | `attributes.event_name` | |
| VALUE | text with variable picker | numeric/merge value | empty | no | `attributes.value` | Saved string `1`. |
| CURRENCY | fixed display | `USD` | `USD` | yes | `attributes.currency` | |
| TEST CODE | text | Meta test event code | empty | no | `attributes.test_event_code` | UI warns to remove after testing; saved inert `TESTZZZ` in Draft. |
| CUSTOM MAPPING | toggle | exposes FBCLID for funnel, Facebook Lead ID for lead, or IGSID for Instagram DM events | off | no | inferred / uncaptured | Conditional fields not included in representative saved node. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000282 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000282",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 8,
  "attributes": {
    "type": "facebook_conversion_api",
    "event_type": "funnel_event",
    "access_token": "zzz-spike-token",
    "event_name": "Lead",
    "pixel_id": "zzz-spike-dataset",
    "currency": "USD",
    "connection_type": "INTEGRATION",
    "value": "1",
    "test_event_code": "TESTZZZ"
  },
  "name": "Meta Conversion API",
  "type": "facebook_conversion_api",
  "parentKey": "00000000-0000-4000-8000-000000000261"
}
```

## Location-data-dependent fields

- AD MANAGER and event catalogs may depend on connected Meta assets. The captured Integration route accepted direct inert values without connecting an account.

## Quirks

- DATASET ID persists as `pixel_id`.
- This action was listed as likely integration-gated, but the Integration route saved normally in Draft with direct test values.
- The test code is persisted and must be removed before any production use, matching the UI warning.

## Official runtime semantics

- Connection type **Integrations** requires manual Pixel ID and CAPI access token; **Ad Manager** auto-populates pixels/tokens. A connected Meta integration and pixel are prerequisites, plus a CAPI token unless using Ad Manager.
- Event types are trigger-restricted: Funnel events pair with Form Submitted, Survey Submitted, Customer Booked Appointment, or Order Form Submission; Lead events pair only with Facebook Lead Form Submission or Pipeline Stage Change for Facebook-originated contacts; Instagram DM events pair with any contact-creation trigger.
- For a Lead event whose Stage Name is `Purchase`, Value and Currency (default USD) are mandatory. Custom Mapping can send a stored FBCLID for stage-change attribution. Source: [HighLevel Meta Conversion API](https://help.gohighlevel.com/support/solutions/articles/155000003691).
