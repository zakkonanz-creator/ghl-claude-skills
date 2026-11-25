# Action: Wait

- **UI name:** Wait · **Category:** Internal · **Priority:** CORE
- **JSON `type`:** `wait`
- **Screenshots:** `042-wait-panel.png` (card selector), `044-wait-setperiod-panel.png` (set-period sub-panel)
- **Premium:** no · **Description:** "Holds a contact for a specific time, until a condition exists, or until the contact replies."

## Wait-type selector (card picker — `attributes.type` + shape depends on choice)

The panel first shows **7 wait-type cards** ("How long do you want to wait?"). Selecting one opens a sub-panel; "Change type" returns to the picker.

| Card (UI) | Example shown | Likely `attributes.type` | Sub-panel fields |
|---|---|---|---|
| Until the contact replies | Wait for a reply on SMS, Email, etc. | `contact_reply` / reply-wait | reply channel(s), optional timeout |
| **For a set period of time** ✅ harvested | Ex: 2 days, 6 hours, 30 minutes | **`time`** | Time period (number), Unit (minutes/hours/days/…), Advance window toggle |
| Until a specific date/time | Ex: December 4th at 9:00 AM | `time` w/ absolute date | date/time picker |
| Until a recurring window opens (New) | Every Tuesday, 15th of each month | recurring | recurrence rule |
| Until a scheduled date/time | Ex: 1 hour before scheduled appointment | `appointment` | `appointmentStartAfter.{when,type,value,distributed{months,days,hours,minutes}}`, `appointmentCondition` |
| Until a user replies | Wait for a user to send a message to the contact | user_reply | channel/timeout |
| Until the contact takes a specific action | Ex: clicks a link, opens an email | event-wait | event type + timeout |

## Fields — "For a set period of time" sub-panel (harvested)

| UI label | Input type | Options / source | Default | JSON path | Notes |
|---|---|---|---|---|---|
| Action name | text | — | "Wait" | `attributes.name` / node `name` | |
| Selected wait type | card + "Change type" link | 7 types above | — | `attributes.type` (`time`) | |
| Time period | number stepper | integer | 0 | `attributes.startAfter.value` | |
| Unit | dropdown | minutes / hours / days / weeks / months / years (dropdown didn't expand in scrape; values inferred from read-schema + stepper) | minutes | `attributes.startAfter.type` | |
| Advance window | toggle | on/off | off | (adds business-hours/window constraint when on) | restricts when the wait can release |

## Fields — "Until a scheduled date/time" appointment variant (live harvested)

| UI label | Input type | Captured value | JSON path | Notes |
|---|---|---|---|---|
| Action name | text | `Wait until 1 hour before appointment` | node `name`; `attributes.name` | Both persist. |
| Selected wait type | card | Until a scheduled date/time | `attributes.type:"appointment"` | Live selected from the Wait card picker. |
| What type? | radio | Appointment / calendar event | `attributes.type:"appointment"` | Rental booking and invoice due date were visible alternatives but not captured. |
| Appointment source | automatic | workflow trigger `Customer Booked Appointment` | no separate key | The panel binds to the appointment-based trigger; no location ID was persisted. |
| When should the contact proceed? | radio | Before | `attributes.appointmentStartAfter.when:"before"` | At scheduled time and After were visible alternatives. |
| Months / days / hours / minutes | four numeric inputs | `0 / 0 / 1 / 0` | `attributes.appointmentStartAfter.distributed` | Also normalized to `type:"minutes", value:60`. |
| If this date has already passed | radio | Continue to next action | `attributes.appointmentCondition:"next"` | Other visible choices were go to a step and exit automation. |
| Skip outbound communication | radio/default control | selected by UI default | no dedicated key observed | The saved node added no extra field for the captured default. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000175 nodeId=00000000-0000-4000-8000-000000000176 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000176",
  "type": "wait",
  "name": "Wait until 1 hour before appointment",
  "attributes": {
    "type": "appointment",
    "name": "Wait until 1 hour before appointment",
    "cat": "",
    "appointmentStartAfter": {
      "when": "before",
      "type": "minutes",
      "value": 60,
      "distributed": { "months": 0, "days": 0, "hours": 1, "minutes": 0 }
    },
    "appointmentCondition": "next",
    "isHybridAction": true,
    "hybridActionType": "wait",
    "convertToMultipath": false,
    "transitions": []
  },
  "order": 0,
  "cat": ""
}
```

## Prior verified set-period witness

The original two-minute set-period capture remains preserved as a second mechanically observed shape. The appointment witness above is the document's single active `verify-item` marker.

Provenance: workflow `00000000-0000-4000-8000-000000000171`, node `00000000-0000-4000-8000-000000000280`, action.

```json
{
  "id": "00000000-0000-4000-8000-000000000280",
  "parentKey": "00000000-0000-4000-8000-000000000267",
  "type": "wait",
  "name": "Wait",
  "order": 2,
  "cat": "",
  "attributes": {
    "type": "time",
    "startAfter": { "type": "minutes", "value": 2, "when": "after" },
    "name": "Wait",
    "cat": "",
    "timePeriodInputMode": "standard",
    "unitInputMode": "standard",
    "isHybridAction": true,
    "hybridActionType": "wait",
    "convertToMultipath": false,
    "transitions": []
  }
}
```

## Quirks
- Set-period minimal replayable = `attributes: { type:"time", startAfter:{ type:<unit>, value:<n>, when:"after" } }`. The `isHybridAction`/`timePeriodInputMode`/`unitInputMode`/`convertToMultipath`/`transitions` fields are GHL defaults — include them to match native shape (server tolerates their absence untested; safest to echo).
- Appointment waits are live UI-saved and read-back verified on `ZZZ-SPIKE-p5-map-wait-appointment`. One hour before stores both `value:60`/`type:"minutes"` and the full distributed duration. `appointmentCondition:"next"` means continue immediately if the scheduled time has already passed.
- Engine support is deliberately limited to the persisted `before` + `appointmentCondition:"next"` variant. The visible `after`, go-to-step, and exit choices require their own saved harvest before engine support.
- "Advance window" and the absolute-date/recurring variants remain unmapped LONG_TAIL sub-variants.
- Not location-data-dependent (except appointment-wait references calendars/appointments).
