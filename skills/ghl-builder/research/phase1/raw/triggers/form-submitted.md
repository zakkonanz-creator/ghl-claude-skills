# Trigger: Form submitted

- **UI name:** Form submitted · **Category:** Events · **Priority:** CORE
- **JSON `type`:** `form_submission`
- **Screenshot:** `screenshots/codex-006-form-submitted.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| CHOOSE A WORKFLOW TRIGGER | trigger picker button | native trigger catalog | `Form submitted` | yes | `type:"form_submission"`, `masterType:"highlevel"` | |
| WORKFLOW TRIGGER NAME | text input | free text | `Form Submitted` | yes | `name` | |
| FILTERS → field | dropdown | Standard: `Form is`, `Terms and Conditions`; Custom field → `zzz_spike_field` | none | no | `conditions[]` | |
| Form is | searchable multiselect | **location-dependent** form catalog | none | yes when used | form-ID condition | The lab returned `No Data`; no form existed. Exact ID mapping remains TODO until a safe `zzz-spike-*` form fixture exists. |
| Terms and Conditions | select | `No`, `Yes` | none | yes when used | `field:"formData.termsAndConditions"`, `operator:"=="`, boolean `value` | Captured Yes = `true`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000174 nodeId=<id054> kind=trigger -->
```json
{
  "id": "<id054>",
  "active": false,
  "conditions": [
    {
      "operator": "==",
      "field": "formData.termsAndConditions",
      "value": true,
      "title": "Terms and Conditions",
      "type": "select"
    }
  ],
  "type": "form_submission",
  "masterType": "highlevel",
  "name": "Form Submitted",
  "actions": [{ "workflow_id": "00000000-0000-4000-8000-000000000174", "type": "add_to_workflow" }],
  "workflow_id": "00000000-0000-4000-8000-000000000174",
  "location_id": "<locationId>",
  "schedule_config": {}
}
```

## Location-data-dependent fields

- `Form is` fetches the location form catalog. The picker opened successfully but displayed `No Data` in this lab.
- Custom field uses the location contact custom-field catalog.

## Quirks

- A form filter is optional; the trigger can listen for all form submissions.
- Boolean labels `No`/`Yes` serialize as JSON booleans, not strings.
- No unproven form-creation API was used; the representative static filter was saved instead.
