# Action: Add Task

- **UI name:** Add task · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** **`task-notification`** (VERIFIED by saved node — the "Add task" UI action writes `type:"task-notification"`, NOT `add_task`. My earlier "add_task" claim was wrong; the read-schema source a private read-schema note built from production workflow exports (not included) lists only `task-notification`.) · **Screenshot:** `090-add-task-panel.png`, `091-add-task-filled.png`
- **Premium:** no · **Description:** "Create a new task with a defined Due Date to be Assigned to a Specific user"

## Fields  (`verified: saved-node` — captured from a real save on ZZZ-SPIKE-harvest, node type `task-notification`)
| UI label | Input | Options / source | Required | JSON path (VERIFIED) | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text | — | — | node `name` | |
| TITLE * | text (+merge) | free | **yes** | `attributes.title` | |
| DESCRIPTION * | rich text (full toolbar: font, size, color, lists, link, image, code) | free HTML | **yes** | `attributes.body` (html — key is **`body`**, not "description") | |
| ASSIGN TO | dropdown (+ "⋮" menu) | **location users** | no (saved fine empty) | `attributes.assignedTo` (**single userId string**, `""` if unset) | location-dependent |
| DUE DATE * | Value (number) + Unit (dropdown: **Days/Weeks/Months/Years**) + Select time | relative offset | **yes** | `attributes.dueDate.{duration, unit, skipWeekends}` | keys are `duration`+`unit` (NOT value/time) |
| Skip weekends | toggle | on/off | no | `attributes.dueDate.skipWeekends` (bool) | nested inside dueDate, not top-level |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000247 kind=action -->
```json
{ "id": "00000000-0000-4000-8000-000000000247",
  "order": 13,
  "name": "Add task", "type": "task-notification",
  "attributes": {
    "title": "Harvest task title",
    "body": "<p style=\"margin:0px; padding-left: 0px!important;\">Harvest task description</p>",
    "assignedTo": "",
    "dueDate": { "duration": 3, "unit": "days", "skipWeekends": false },
    "type": "task_notification",
    "__customInputs__": {} },
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000245" }
```
Notes: node `type` = `task-notification`; the echoed `attributes.type` = `task_notification` (underscore). `assignedTo` was empty in this capture (assignee dropdown didn't commit) but the field is a **single userId string** (the ASSIGN TO panel is single-select, user resolves via `GET /users/search`). Unit values are capitalized in UI (Days/Weeks/Months/Years) → stored lowercase (`days`).

### Second verification (fixer, 2026-07-16) — API-injected node `a740ad66…`, steps file v18, renders + panel round-trips
```json
{ "name": "zzz-spike Add Task", "type": "task-notification",
  "attributes": {
    "type": "task_notification",
    "title": "zzz-spike task {{contact.name}}",
    "body": "zzz-spike task description",
    "assignedTo": "<userId>",
    "dueDate": { "duration": 3, "unit": "days", "time": 32400000, "skipWeekends": true },
    "__customInputs__": {} } }
```
Confirms: `assignedTo` = real userId round-trips (panel shows "Test User", screenshot `fixer-010-panel-task.png`); optional **`dueDate.time`** = ms-of-day (e.g. `32400000`; omitted when no time picked); plain-string `body` also accepted. Production corpus additionally shows `assignedTo:"contact.assigned_user"` (contact's assigned user) and `dueDate` as a merge-field STRING with `__customInputs__: {"dueDate":"duration-picker"}` — `__customInputs__` marks fields switched to custom/merge input mode.

## Location-data-dependent
- ASSIGN TO → `GET /users/search?companyId=&locationId=` → `assignedTo` = that user's id. A real user exists on the lab (`<userId>`).

## Quirks
- Required to save: TITLE + DESCRIPTION + DUE DATE (Value **and** Unit). ASSIGN TO is optional (saved with empty `assignedTo`).
- The DESCRIPTION → JSON key is **`body`** (surprising; not "description"). Due-date keys are **`duration`/`unit`** (not value/time). `skipWeekends` nests under `dueDate`.
