# Action: Google Sheets

- **UI name:** Google Sheets · **Category:** Send data · **Priority:** LONG_TAIL (B5-12)
- **JSON `type`:** `google_sheets`
- **Screenshot:** `screenshots/b5-012-google-sheets.png`
- **Premium:** yes
- **Status:** ⛔ integration-gated — Google Sheets connection required; no external account was connected

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| Connect your account | button | Google Sheets OAuth | n/a | gate | inferred / uncaptured | Protocol forbids connecting an external account. |
| ACTION NAME | text | free text | `Send data to Google Sheets` | yes | `name` | |
| ACTION | custom select | unavailable until connection | `Select an action` | yes | inferred / uncaptured | Picker did not open while disconnected. |
| Connected-action controls | conditional controls | spreadsheet/action-specific | n/a | inferred / uncaptured | Not reachable before OAuth gate. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000203 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000203",
  "parent": "00000000-0000-4000-8000-000000000204",
  "order": 2,
  "attributes": {
    "type": "google_sheets"
  },
  "name": "Send data to Google Sheets",
  "type": "google_sheets",
  "parentKey": "00000000-0000-4000-8000-000000000205"
}
```

## Gate evidence and limits

- Native Save action rejected the disconnected panel with `Oops! Looks like you've missed out on some fields`.
- The exact action type came from the builder's live action metadata (`type: google_sheets`); a minimal Draft-only node was API-injected and server-read-back verified solely to provide a machine-checkable gate witness.
- No connected action, spreadsheet, worksheet, mapping, credential, or billing setting was configured. This JSON is not a complete executable Google Sheets schema.

## Official runtime semantics

- Google Sheets is a premium action priced at $0.01 per execution after the first 100 free lifetime executions. It requires Google OAuth access to Drive and Sheets.
- Connected configuration selects drive type, spreadsheet, and worksheet. Column headers become dynamic mapping fields and must be refreshed after sheet changes. Source: [HighLevel Google Sheets](https://help.gohighlevel.com/support/solutions/articles/155000003294).
