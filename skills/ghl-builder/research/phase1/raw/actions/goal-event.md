# Action: Goal event

- **UI name:** Goal event (panel title `Workflow goal`) · **Category:** Internal · **Priority:** LONG_TAIL (B5-5)
- **JSON `type`:** `workflow_goal`
- **Screenshot:** `screenshots/b5-005-goal-event.png`
- **Premium:** no premium notice observed

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Goal` | yes | `name` | |
| SELECT TYPE OF GOAL | custom select | `Received an Email Event`; `Clicked a trigger link`; `Added a contact Tag`; `Removed a contact Tag`; `Appointment status`; `Payment Received`; `Form Submitted`; `Document Status`; `Invoice paid`; `Review request clicked`; `User Replied`; `Task status` | `Received an Email Event` | yes | `attributes.segments[].conditions[].goal_condition` | Saved `add_contact_tag`. Each type changes the conditional selector below. |
| PICK EMAIL STEP TO WAIT FOR | workflow-step select | earlier email actions | `Select a step` | required for Received an Email Event; inferred / uncaptured | not in representative JSON | Default branch showed no selected step. |
| SELECT EMAIL EVENT | conditional select | email event catalog | none | required for Received an Email Event; inferred / uncaptured | not in representative JSON | Exact values/paths omitted because the branch was not saved. |
| SELECT CONTACT TAG | searchable location select | location tag catalog; `Add New tag` control | none | yes for Added/Removed contact Tag | `attributes.segments[].conditions[].extras.tags[]` | Saved tag name `zzz-spike-tag`, not its ID. |
| IF CONTACT REACHES THIS GOAL ACTION WITHOUT MEETING ITS CONDITIONS | custom select | `End this workflow`; `Continue anyway`; `Wait until the goal is met` | `End this workflow` | yes | `attributes.action` | Saved `exit`. Exact enum values for the other two choices are uncaptured. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000202 nodeId=00000000-0000-4000-8000-000000000303 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000303",
  "order": 4,
  "attributes": {
    "op": "or",
    "segments": [
      {
        "op": "or",
        "conditions": [
          {
            "goal_condition": "add_contact_tag",
            "extras": {
              "tags": [
                "zzz-spike-tag"
              ]
            },
            "id": "00000000-0000-4000-8000-000000000304"
          }
        ]
      }
    ],
    "type": "workflow_goal",
    "action": "exit"
  },
  "name": "Goal",
  "type": "workflow_goal",
  "parentKey": "00000000-0000-4000-8000-000000000248"
}
```

## Location-data-dependent fields

- SELECT CONTACT TAG fetches the location tag catalog (the same location tags endpoint used by tag actions/triggers). Saved JSON stores tag names.
- Email-step and trigger-link branches depend on earlier nodes in this workflow.
- Form, appointment, document, invoice, payment, task, and user-reply goal branches depend on location/workflow data; their exact conditional selectors are uncaptured.

## Quirks

- Goal conditions use an `op`/`segments`/`conditions` structure rather than the `if_else` condition schema.
- A condition receives its own UUID-like `id`.
- The goal can jump a contact forward from anywhere in the workflow; the fallback action controls what happens if the contact reaches the goal node normally without meeting it.

## Official runtime semantics

- A workflow supports at most one Goal. A matching contact jumps immediately to it and skips intermediate actions; after the Goal is met, it is not re-evaluated for that contact.
- Multiple selected values use OR semantics. Goal monitoring runs continuously, regardless of workflow time windows. Source: [HighLevel Goal Event](https://help.gohighlevel.com/support/solutions/articles/155000003328).
