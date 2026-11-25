# Action: If / Else (Condition)

- **UI name:** If / else · **Category:** Internal · **Priority:** CORE
- **JSON `type`:** `if_else` (node name defaults to "Condition") · **Description:** "Fork the Contact journey through this workflow based on conditions."
- **Screenshots:** `050-if-else-panel.png`, `051-ifelse-field-dropdown.png` (field categories), `052-ifelse-contact-details.png`, `057-ifelse-field-picked.png`
- **Premium:** no

## Panel structure

| UI label | Input type | Options / source | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` (default "Condition") | |
| SCENARIO RECIPE | dropdown | "Build your own" (default) + pre-built condition templates | (pre-fills branches) | quick-start templates |
| BRANCHES → Branch(es) | repeatable branch blocks | each = named branch with condition segments | `attributes.branches[]` | **Add branch**, **Reorder branches** |
| — condition row: **field** | searchable categorized dropdown ("Select" → "All fields") | see field catalog below | `attributes.branches[].segments[].conditions[].conditionSubType` | `conditionType` stores the field family. |
| — condition row: **operator** | dropdown ("Select operator") | field-type-dependent (see operators) | matching `.conditionOperator` | |
| — condition row: **value** | input (appears after operator) | free / picker | matching `.conditionValue` | Omitted for unary operators such as `has_value`. |
| — **AND / OR** join + "Add segment" | toggle + button | AND \| OR | `segments[]` (segment = OR group; conditions within = AND) | |
| None/else branch | auto | "When no condition is met" | last top-level `next[]` ID + separate child `attributes.else:true` | always present |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000246 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000246",
  "order": 21,
  "attributes": {
    "currentRecipeType": "CUSTOM",
    "branches": [
      {
        "id": "00000000-0000-4000-8000-000000000287",
        "name": "zzz Branch A",
        "segments": [
          {
            "__segmentId": "00000000-0000-4000-8000-000000000313",
            "operator": "and",
            "conditions": [
              {
                "conditionType": "contact_detail",
                "conditionSubType": "<customFieldId>",
                "conditionOperator": "==",
                "conditionValue": "Alice",
                "__conditionId": "00000000-0000-4000-8000-000000000314",
                "ifElseNodeId": "",
                "isWait": false
              }
            ]
          }
        ],
        "operator": "and",
        "showErrors": false,
        "branchNameError": "Branch name cannot be empty!"
      }
    ],
    "operator": "and",
    "if": true,
    "conditionName": "zzz-spike Condition",
    "version": 2,
    "noneBranchName": "None"
  },
  "name": "zzz-spike Condition",
  "type": "if_else",
  "cat": "conditions",
  "next": [
    "00000000-0000-4000-8000-000000000287",
    "00000000-0000-4000-8000-000000000315",
    "00000000-0000-4000-8000-000000000318"
  ],
  "comments": [],
  "nodeType": "condition-node",
  "parentKey": "00000000-0000-4000-8000-000000000180"
}
```
**Key facts (all verified from the real node):**
- Branches live in `attributes.branches[]`; there is **NO separate `else` object** — the ELSE/fallthrough is the **last entry of the node's `next[]`** array (a "None" branch, `attributes.noneBranchName`). So a 2-branch if_else has `next` = `[branchA-id, branchB-id, noneBranch-id]`.
- **Each branch is ALSO its own node in `templates[]`** (type `if_else`, id = the branch id from `attributes.branches[].id`): `nodeType:"branch-yes"` with `attributes:{if:false, conditionName:<parent's conditionName>, operator:"and", branches:[]}`, plus `sibling:[other-branch-ids]`, `parentKey`/`parent` = the parent condition node, and its own `next` = first node inside that branch. The ELSE child is `nodeType:"branch-no"`, name "None", `attributes:{else:true}`. The parent condition node itself carries `nodeType:"condition-node"`, `cat:"conditions"`, `comments:[]`. An engine composing if_else must write the parent + one child node per branch + the None child (4 nodes total for a 2-branch condition). Verified: composed exactly this way via API (fixer 2026-07-16, nodes `515080dc`/`8bda9dac`/`43a2bc37`/`e57b4830` in steps file v18), renders as a true canvas fork with condition prose ("If \"zzz_spike_field\" is \"Alice\"") and the panel round-trips field+operator (screenshots `fixer-016-panel-ifelse.png`, `fixer-001-injected-fit.png`).
- Condition shape: `{ conditionType, conditionSubType (field id/key), conditionOperator, conditionValue, __conditionId, ifElseNodeId, isWait }`. NOT `{field, operator, value}` (my earlier guess).
- `conditionType` = category (`contact_detail`, …); `conditionSubType` = the specific field (custom field → its **ID**).
- Verified exact `conditionOperator` strings now include equality **`"=="`**, unary has-value **`"has_value"`**, and multi/single-option membership **`"index-of-true"`** (see below).
- Segment/branch join `operator` = `"and"` / `"or"` (lowercase). `attributes.operator` (node-level) = `"and"`.
- Extras: `currentRecipeType` (CUSTOM or a Scenario-Recipe name), `if:true`, `version:2`, per-branch `id`+`name`.

## Field catalog (condition "field" dropdown — top-level categories)
Captured live from the picker ("All fields"):
`Contact details` (→ **Standard fields**, **Custom Fields** [location-dependent], Contact First Attribution, Contact Last Attribution), `Company`, `Date/Time`, `Workflow trigger`, `Workflow contact`, `Events`, `Custom values` (location-dependent), `Contact reply`, `Inbound email`, `Appointment`, `Service booking`, `Rental booking`, `Note`, `Opportunities`, `Ecommerce stores`, `Invoice`, `Order`, `Payment`, `Video tracking`, `Courses`, `Inbound webhook trigger`.
Plus **action-output references** usable as fields: `Google Sheets lookup`, `Date/time formatter`, `Number formatter`, `Add task`, `Text formatter`, `Math operation`, `Custom webhook`, `GPT`, `Array formatter`, `Custom code`, `AI Agent`, `IVR Gather`, `IVR Connect call` (i.e. outputs of earlier action nodes can feed conditions).

## Operators (`conditionOperator` — field-type-dependent)
**Verified from saved nodes / production shapes:** equality = **`"=="`**; `Is not empty`/has a value = **`"has_value"`** and omits `conditionValue`; option membership/includes = **`"index-of-true"`** with `conditionValue` encoded as an array such as `["lead"]`. The rest are the standard UI operator families whose exact strings remain field-type-specific and uncaptured:
- **string/text:** is (`==`) / is not / contains / does not contain / starts with / ends with / is empty / is not empty
- **number:** = (`==`) / ≠ / > / < / ≥ / ≤ / is empty / is not empty
- **date:** before / after / on / is empty / is not empty (+ relative)
- **boolean/dnd:** is true / is false
- **tags / multi:** includes / does not include
The B8 R1 saved witness contains both non-equality variants and all four node-family members (condition parent, two branch children, None child). Local production corpora independently contained `has_value` and `index-of-true`, matching the saved strings. Remaining operator labels still require per-type capture rather than guessed spellings.

## Location-data-dependent fields
- **Custom Fields** (Contact details → Custom Fields): `GET /locations/{loc}/customFields/search?...` — resolve name→id.
- **Custom values**: `GET /locations/{loc}/customValues/`.

## Quirks / harvest notes
- The condition builder is a **portalled Vue component**; scripted field/operator selection is unreliable (resets on mis-click). For the Phase-2 engine, prefer **API-injecting** the `if_else` node with known `field`/`operator`/`value` strings and verifying via read-path render, rather than driving the builder.
- A branch with an empty condition **fails to save** ("Branch name cannot be empty!" / no valid condition) — the top-bar Save silently no-ops. Always populate at least one condition.
- SCENARIO RECIPE templates pre-fill valid conditions — useful as a fallback to see canonical condition JSON for common scenarios.
