# Trigger: Video tracking

- **JSON `type`:** `video_event` · **Screenshot:** `screenshots/b2-021-video-tracking.png` · **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Video Tracking` | yes | `name` | |
| Add filters | conditional builder | Funnel; Video; Video Duration % (25/50/75/100 plus operators) | none | no | `conditions[]` | Saved empty; no funnel/video fixture, so connected-ID JSON is uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000177 nodeId=<id007> kind=trigger -->
```json
{"id":"<id007>","active":false,"conditions":[],"type":"video_event","masterType":"highlevel","name":"Video Tracking","actions":[{"workflow_id":"00000000-0000-4000-8000-000000000177","type":"add_to_workflow"}],"location_id":"<locationId>","schedule_config":{}}
```

## Runtime semantics

- Requires a GHL-funnel-hosted video and an existing CRM contact. Disable the progress bar for accurate tracking; `>=` implements at-least thresholds. Closing a video re-evaluates the trigger, so re-entry loops are possible. Source: https://help.gohighlevel.com/support/solutions/articles/155000003142
