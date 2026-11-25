# Action: Drip

- **UI name:** Drip · **Category:** Internal · **Priority:** LONG_TAIL (B5-4)
- **JSON `type`:** `drip`
- **Screenshot:** `screenshots/b5-004-drip.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Drip mode` | yes | `name` | |
| BATCH SIZE | number | positive count | `100` | yes | `attributes.batchSize` | Number of contacts advanced per batch. |
| DRIP INTERVAL | number | positive duration | `1` | yes | `attributes.interval.value` | |
| Interval unit | custom select | `minutes`; `hours`; `days` | `minutes` | yes | `attributes.interval.timeUnit` | |
| Review drip schedule → Check | button | previews ten scheduled batches from the current time | n/a | no | inferred / uncaptured: preview is not a separate saved field | The preview displayed batch number and local schedule. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000248 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000248",
  "order": 3,
  "attributes": {
    "batchSize": 100,
    "interval": {
      "timeUnit": "minutes",
      "value": 1
    },
    "type": "drip",
    "configuredAt": "2026-07-17T00:26:44.155Z"
  },
  "name": "Drip mode",
  "type": "drip",
  "parentKey": "00000000-0000-4000-8000-000000000234"
}
```

## Location-data-dependent fields

None observed.

## Quirks

- `configuredAt` is persisted as an ISO timestamp generated when the action is configured.
- Check is a read-only preview; with batch size 100 and interval 1 minute it showed ten batches one minute apart.

## Official runtime semantics

- Documented limits are batch size 1–10,000 and intervals of 1–60 minutes, 1–24 hours, or 1–7 days. Each entrant receives its own schedule; contacts already queued retain the previous batch size after edits.
- Moving a workflow to Draft and republishing does not create a burst. Workflow time windows shift scheduled execution into allowed windows. Source: [HighLevel Drip](https://help.gohighlevel.com/support/solutions/articles/155000003360).
