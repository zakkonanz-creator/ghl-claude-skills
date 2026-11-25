# Action: Add to Google Ads

- **UI name:** Add to Google Ads (panel title: Google Ads) · **Category:** Marketing · **Priority:** LONG_TAIL (B5-13)
- **JSON `type`:** `google_adword`
- **Screenshot:** `screenshots/b5-013-add-to-google-ads.png`
- **Status:** ⛔ integration-gated — no Google Ads conversion was available; no account was connected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Add to Google Ads` | yes | `name` | |
| CONVERSION | custom select | connected Google Ads conversion catalog | none; picker returned `No result found.` | yes | inferred / uncaptured | Hard gate prevented native save. |
| CURRENCY | fixed display | `USD` | `USD` | yes | inferred / uncaptured | Not saved because conversion was unavailable. |
| CONVERSION VALUE | text with variable picker | numeric/merge value | `1` | yes | inferred / uncaptured | Not saved because conversion was unavailable. |
| CUSTOM MAPPING | toggle | exposes GCLID, GBRAID, or WBRAID mappings | off | no | inferred / uncaptured | Conditional mapping fields could not produce a saved node without a conversion. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000206 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000206",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 3,
  "attributes": {
    "type": "google_adword"
  },
  "name": "Add to Google Ads",
  "type": "google_adword",
  "parentKey": "00000000-0000-4000-8000-000000000203"
}
```

## Gate evidence and limits

- The conversion picker returned `No result found.` and therefore the required CONVERSION field could not be satisfied.
- Exact type `google_adword` came from live builder action metadata. The minimal Draft-only node is a machine-checkable gate witness, not a complete executable conversion schema.
- No Google account, conversion, credential, custom mapping, or billing setting was created or connected.

## Official runtime semantics

- This sends offline conversions to a connected Google Ads account using click identifiers such as GCLID and requires a conversion action created in Google Ads first.
- It is documented only for Form Submission, Order Purchase, Number Pool Calling, Survey Submission, and Chat Widget triggers. Source: [HighLevel Add to Google Ads](https://help.gohighlevel.com/support/solutions/articles/155000003368).
