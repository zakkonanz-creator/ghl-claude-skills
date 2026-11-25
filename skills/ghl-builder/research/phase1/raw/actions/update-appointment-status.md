# Action: Update Appointment Status

- **UI name:** Update appointment status · **Category:** Appointments · **Priority:** CORE
- **JSON `type`:** `update_appointment_status` · **Screenshots:** `125-appt-status-panel.png`, `126-appt-status-options.png`, `screenshots/b8-014-r4-update-appointment-status-invalid.png`, `screenshots/b8-014-r4-update-appointment-status-noshow-panel.png`
- **Premium:** no
- **Description:** "Changes the status of an Appointment. If the Contact was added via an appointment Trigger, that appointment is updated; otherwise the most recent appointment the Contact carries is updated." → **operates on the runtime appointment; NO calendar fixture needed to configure/save.**

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| CATEGORY | dropdown | **Appointment** (default) | `attributes.category` (`"appointment"`) | |
| STATUS | dropdown ("Select") | **new / confirmed / cancelled / Showed / No-show / invalid** | `attributes.status_type` | required |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000243 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000243",
  "order": 11,
  "attributes": {
    "category": "appointment",
    "type": "update_appointment_status",
    "status_type": "confirmed"
  },
  "name": "Update appointment status",
  "type": "update_appointment_status",
  "parentKey": "00000000-0000-4000-8000-000000000244"
}
```
The full status enum is now verified: **`new`**, **`confirmed`**, **`cancelled`**, **`showed`**, **`noshow`**, **`invalid`**. UI labels `Showed` and `No-show` serialize exactly as lowercase `showed` and `noshow` (no hyphen).

### Fresh B8 R4 saved-node audit

| UI / enum | B8 node ID | Provenance |
|---|---|---|
| invalid → `invalid` | `00000000-0000-4000-8000-000000000275` | native panel save; strict Verified JSON witness above |
| new → `new` | `00000000-0000-4000-8000-000000000330` | fresh B8 full-workflow save/readback |
| cancelled → `cancelled` | `00000000-0000-4000-8000-000000000331` | fresh B8 full-workflow save/readback |
| Showed → `showed` | `00000000-0000-4000-8000-000000000332` | fresh B8 full-workflow save/readback |
| No-show → `noshow` | `00000000-0000-4000-8000-000000000333` | fresh B8 full-workflow save/readback + reopened native panel visibly showing `No-show` |

The production corpora independently contain `new`, `cancelled`, `confirmed`, `showed`, and `noshow`, matching the fresh B8 encodings.

## Location-data-dependent
- None for config. Targets the enrolled contact's appointment at runtime.
