# Trigger: Start IVR trigger

- **UI name:** Start IVR trigger · **Category:** IVR · **Priority:** LONG_TAIL
- **JSON `type`:** `ivr_incoming_call`
- **Screenshot:** `screenshots/b7-016-start-ivr.png`
- **Premium:** no; owned phone-number prerequisite
- **Status:** ⛔ prerequisite-gated — the live phone-number selector returned `No result found.`

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | fixed trigger picker | native trigger catalog | `Start IVR trigger` | yes | `type:"ivr_incoming_call"` | Exact type also exposed by picker DOM ID `cmp-trig-opt__dv--add-trigger-ivr_incoming_call`. |
| WORKFLOW TRIGGER NAME | text | free text | `Start IVR Trigger` | yes | `name` | Reopened saved witness. |
| FILTERS → In phone number | required multiselect | eligible phone numbers owned by this location | empty; live selector: `No result found.` | yes | `conditions[0]` | Mandatory and cannot be deleted. One number can be assigned to only one IVR workflow. |
| Add filters | button | no additional IVR-specific filter was exposed | none | no | inferred / uncaptured | No optional filter was added; the required phone-number condition remains the operative filter. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=<id027> kind=trigger -->
```json
{
  "id": "<id027>",
  "active": false,
  "actions": [
    {
      "workflow_id": "00000000-0000-4000-8000-000000000190",
      "type": "add_to_workflow"
    }
  ],
  "conditions": [
    {
      "id": "inbound-twilio-number",
      "operator": "contains-any",
      "field": "inbound_number",
      "value": [
        "+12025550100"
      ],
      "title": "In phone number",
      "type": "multiselect"
    }
  ],
  "type": "ivr_incoming_call",
  "masterType": "highlevel",
  "workflow_id": "00000000-0000-4000-8000-000000000190",
  "location_id": "<locationId>",
  "name": "Start IVR Trigger",
  "belongs_to": "workflow",
  "schedule_config": {}
}
```

## Gate evidence and witness limit

- The native panel automatically added `In phone number`; attempting to save it empty showed `One or more filter(s) is/are empty`, and opening its value selector showed `No result found.`
- The loaded production builder bundle supplied the exact mandatory condition definition: ID `inbound-twilio-number`, field `inbound_number`, operator `contains-any`, and type `multiselect`. No condition key was guessed.
- To provide a machine-verifiable inactive witness without acquiring or assigning a number, the saved Draft trigger uses fictional non-owned number `+12025550100`. It is not an executable IVR configuration and does not satisfy the real owned-number prerequisite.
- The trigger remains `active:false`; no phone number was bought, assigned, called, billed, or published.

## Runtime semantics

- An incoming call to the assigned owned number starts the workflow. A phone number can belong to only one IVR workflow at a time.
- If a caller hangs up mid-flow, the contact still advances: IVR-specific actions are skipped, while non-IVR actions continue.
- The trigger is not marked premium, but real calls consume telephony usage.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Start IVR trigger), based on GHL article `155000001200`.
