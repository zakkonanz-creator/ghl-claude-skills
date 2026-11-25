# Member registered for group event

- **UI name:** Member registered for group event · **Category:** Communities · **Priority:** LONG_TAIL (B4-10)
- **JSON `type`:** `group_event_rsvp_created`
- **Screenshot:** `screenshots/b4-010-member-registered-for-group-event.png`
- **Status:** ⛔ resource-gated — required Group has no options

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Member Registered For Group Event` | yes | `name` | |
| Group + operator | custom filter | location community groups | unset | yes | inferred / uncaptured | Missing group prevented native save. |
| Event Title | optional text filter | group-event title | n/a | no | inferred / uncaptured | Official changelog; available after Group. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=<id053> kind=trigger -->
```json
{
  "id": "<id053>",
  "active": false,
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000181", "type": "add_to_workflow" }],
  "conditions": [],
  "type": "group_event_rsvp_created",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000181",
  "location_id": "<locationId>",
  "name": "Member Registered For Group Event",
  "schedule_config": {}
}
```

## Gate evidence and limits

- The default panel requires Group and native save created no trigger. The exact live-metadata type underpins a minimal empty-condition Draft witness; the screenshot/default unsaved panel is the UI evidence and the witness is mechanical-only.

## Official runtime semantics

- Fires when a member registers/RSVPs for a community group event. Group is required and Event Title is optional.
- Source: [official HighLevel Communities triggers changelog](https://ideas.gohighlevel.com/changelog/new-communities-triggers-in-workflows-automate-more-faster).
