# Action: Add to Google Analytics

- **UI name:** Add to Google Analytics (panel title: Google Analytics) · **Category:** Marketing · **Priority:** LONG_TAIL (B5-14)
- **JSON `type`:** `google_analytics`
- **Screenshot:** `screenshots/b5-014-add-to-google-analytics.png`
- **Integration:** no OAuth gate; saved with inert `zzz-spike-*` test values in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Add to Google Analytics` | yes | `name` | |
| ACTION TYPE | fixed selector | `Google Analytics 4` | `Google Analytics 4` | yes | `attributes.action_type` | Persists `google_analytics_4`. |
| MEASUREMENT ID | text | GA4 measurement ID | empty | yes | `attributes.measurement_id` | Saved inert `G-ZZZSPIKE`. |
| EVENT NAME | text | GA4 event name | empty | yes | `attributes.event` | UI notes event name should be mapped from GA4/UA. |
| API SECRET | text | GA4 Measurement Protocol API secret | empty | yes | `attributes.api_secret` | Saved inert fixture text, not a real credential. |
| EVENT VALUE | text | numeric/merge value | empty | no | `attributes.ga4_event_value` | Saved string `1`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000253 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000253",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 4,
  "attributes": {
    "type": "google_analytics",
    "action_type": "google_analytics_4",
    "measurement_id": "G-ZZZSPIKE",
    "event": "zzz_spike_event",
    "api_secret": "zzz-spike-secret",
    "ga4_event_value": "1"
  },
  "name": "Add to Google Analytics",
  "type": "google_analytics",
  "parentKey": "00000000-0000-4000-8000-000000000206"
}
```

## Location-data-dependent fields

None observed; all GA4 values are entered directly or through the custom-variable picker.

## Quirks

- This action was listed as likely integration-gated, but the live panel required no OAuth connection and saved normally in Draft.
- Event value persists as a string.

## Official runtime semantics

- HighLevel sends GA4 events through the Measurement Protocol using Measurement ID and API Secret. Google Analytics reporting can take 24–48 hours to show the event.
- Sources: [HighLevel Add to Google Analytics](https://help.gohighlevel.com/support/solutions/articles/155000003367), [Google Analytics integration notes](https://help.gohighlevel.com/support/solutions/articles/48001234199).
