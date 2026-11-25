# Action: Assign to User

- **UI name:** Assign to user · **Category:** Contact · **Priority:** CORE
- **JSON `type`:** `assign_user` · **Screenshot:** `124-assign-user-panel.png`
- **Premium:** no · **Description:** "Assigns the contact to a user. Specify the user or add multiple for round-robin assignment"
- **Status:** ✅ **RESOLVED** — a real user (Test User, id `<userId>`) now exists on the lab; exact JSON captured (below).

## Fields  (`verified: saved-node` — node `811d92e8…` / `<userId>` in ZZZ-SPIKE-harvest)
| UI label | Input | Options / source | JSON path (VERIFIED) | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| USERS | multiselect ("Select users") + "⋮" menu | **location users** | `attributes.user_list` (array of userIds) + `traffic_weightage`/`traffic_index`/`total_index` (round-robin encoding) | multiple = round-robin (weights + slot indexes) |
| ONLY APPLY TO UNASSIGNED CONTACTS | toggle | on/off | `attributes.only_unassigned_contact` (bool) | |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000245 kind=action -->
```json
{ "id": "00000000-0000-4000-8000-000000000245",
  "order": 12,
  "name": "Assign to user", "type": "assign_user",
  "attributes": {
    "type": "assign_user",
    "user_list": ["<userId>"],
    "only_unassigned_contact": false,
    "traffic_split": "equally",
    "traffic_weightage": { "<userId>": 1 },
    "traffic_index": [ { "id": "<userId>", "indexes": [1] } ],
    "total_index": 1
  },
  "parentKey": "00000000-0000-4000-8000-000000000243" }
```
Round-robin encoding: `user_list` (ids) + `traffic_split` (`"equally"` | weighted) + `traffic_weightage` (id→weight) + `traffic_index` (id→slot indexes) + `total_index` (sum of slots). For a single user: weight 1, index [1], total 1. Multiple users for round-robin populate all four structures.

## Location-data-dependent
- USERS → `GET /users/search?companyId={company}&locationId={loc}&limit=50` → `{users:[{id,name,email}]}`. Engine resolves user name/email→id per location. **N/A on locations with 0 users.**

## Quirks
- Real `attributes` is the round-robin structure above (not a simple `users[]`). Engine must build `user_list` + `traffic_weightage`/`traffic_index`/`total_index` consistently (equal split = weight 1 each, sequential indexes).
