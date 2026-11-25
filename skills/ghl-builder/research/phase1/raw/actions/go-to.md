# Action: Go To (Goto)

- **UI name:** Go to · **Category:** Internal · **Priority:** CORE
- **JSON `type`:** `goto` · **Screenshot:** `101-goto-panel.png`
- **Premium:** no · **Description:** "Go To enables you to take your Contact to other branch or step."

## Fields
| UI label | Input | JSON path | Notes |
|---|---|---|---|
| Action Name * | text | node `name` | only panel field |

## Destination selection — **canvas interaction, not a panel field**
Panel note: *"After you click 'Save action', you'll be prompted to select Go-To destinations."* → the target step is chosen by **clicking a node on the canvas** after saving, not via a dropdown. The chosen target node id is stored in `attributes` (target step reference).

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000286 kind=action -->
```json
{ "id": "00000000-0000-4000-8000-000000000286",
  "order": 0,
  "name": "zzz-spike Go To", "type": "goto",
  "attributes": {
    "type": "goto",
    "targetNodeId": "00000000-0000-4000-8000-000000000266"
  },
  "parentKey": "00000000-0000-4000-8000-000000000287",
  "parent": "00000000-0000-4000-8000-000000000287" }
```
**Destination key is `attributes.targetNodeId`** (the target action node's id) — NOT `targetStep` (my earlier guess). Verified from a real saved goto whose `targetNodeId` = the SMS node's id (node `292202c8…`, steps v18; API-injected inside an if_else branch, renders on canvas + panel opens clean — screenshots `fixer-017-panel-goto.png`, `fixer-016-panel-ifelse.png`; shape matches production corpus `a production workflow` goto nodes exactly).

## Quirks / engine note
- **Destination is chosen by a post-save canvas click** in the UI, but for the Phase-2 API engine just set `attributes.targetNodeId` = the destination node's id directly (verified). `goto` carries `parentKey`/`parent` = the node it hangs under (e.g. a branch id).
- `goto` opens/references another step (Phase-0: `transition`/`if_else`/`find_opportunity`/`goto`).
