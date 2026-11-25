# Action: Find opportunity

- **UI name:** Find opportunity · **Category:** Opportunity · **Priority:** LONG_TAIL
- **JSON `type`:** `find_opportunity`
- **Screenshot:** `screenshots/b7-004-find-opportunity.png`
- **Premium:** no gate shown

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Find opportunity` | no | top-level `name`; also `attributes.__name__` | Canvas label. |
| OPPORTUNITY TO BE FOUND | select | Most recently created opportunity; First created opportunity | Most recently created opportunity | yes | `attributes.sorting` | Captured `latest`; `first` is inferred from the alternate UI label and production shape, not saved here. |
| FIELDS → field | repeatable select | Opportunity ID, Opportunity Name, Pipeline, Pipeline Stage, Opportunity Value, Status, Owner, Followers, Tags, Created on, Lost Reason; location Custom Fields | none | no | `attributes.__customInputFields__[].filterField` | Pipeline Stage requires a pipeline selection to populate its stage values. |
| FIELDS → operator | field-dependent select | Pipeline exposed `Is` | none | yes once a field is added | matching entry `.value` | Captured Pipeline `Is` → `eq`. Other field operators are uncaptured. |
| FIELDS → value | field-dependent input/select | free value or location catalog | none | yes once operator requires it | matching entry `.secondValue` | Pipeline value stores pipeline ID. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000190 nodeId=00000000-0000-4000-8000-000000000310 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000310",
  "parentKey": "00000000-0000-4000-8000-000000000311",
  "type": "find_opportunity",
  "name": "Find opportunity",
  "attributes": {
    "sorting": "latest",
    "type": "find_opportunity",
    "__customInputFields__": [
      {
        "__customInputs__": {},
        "filterField": "pipeline_id",
        "value": "eq",
        "secondValue": "<pipelineId>"
      }
    ],
    "__customInputs__": {},
    "cat": "multi-path",
    "convertToMultipath": true,
    "transitions": [
      {
        "id": "00000000-0000-4000-8000-000000000312",
        "name": "Opportunity Found",
        "fields": [],
        "meta": {
          "__branchKey__": "predefined_Opportunity Found"
        },
        "conditionType": "pre-defined"
      },
      {
        "id": "00000000-0000-4000-8000-000000000192",
        "name": "Opportunity Not Found",
        "fields": [],
        "meta": {
          "__branchKey__": "predefined_Opportunity Not Found"
        },
        "conditionType": "pre-defined"
      }
    ],
    "__name__": "Find opportunity"
  },
  "order": 3,
  "cat": "multi-path",
  "workflowsActionType": "INTERNAL",
  "next": [
    "00000000-0000-4000-8000-000000000312",
    "00000000-0000-4000-8000-000000000192"
  ]
}
```

## Branch child nodes

Saving Find opportunity creates two additional `type:"transition"` nodes whose IDs exactly match `attributes.transitions[].id` and `next[]`, in order:

- `Opportunity Found` → `nodeId=00000000-0000-4000-8000-000000000312`, `cat:"transition"`, `parent` and `parentKey` both point to the Find node.
- `Opportunity Not Found` → `nodeId=00000000-0000-4000-8000-000000000192`, same structural shape.

An engine must create the parent Find node plus both transition children; branch contents attach through each transition node's `next`.

## Location-data-dependent fields

- Pipeline, Pipeline Stage, Lost Reason, users (Owner/Followers), tags, and Custom Fields use their corresponding location catalogs. The captured filter resolves `ZZZ-SPIKE-pipeline` through `GET /opportunities/pipelines?locationId={locationId}` and stores its ID.

## Quirks

- Find opportunity is a three-node multipath family, not a single linear node.
- Filter conditions use `value` for the operator and `secondValue` for the comparison value; Pipeline uses snake_case `filterField:"pipeline_id"`.
- At least one filter is mandatory; multiple filters are combined with AND.
- Exactly one matching opportunity is returned: Earliest (`First created`) or Latest (`Most recently created`) according to OPPORTUNITY TO BE FOUND. That result becomes the opportunity context for all downstream opportunity actions and takes precedence over a triggering opportunity.
- No match follows the Opportunity Not Found branch without stopping the workflow. Contactless inbound-webhook workflows must map filter values from webhook parameters.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (Find opportunity), based on GHL article `155000004751`.
