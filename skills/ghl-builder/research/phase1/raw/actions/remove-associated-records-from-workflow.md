# Action: Remove associated records from workflow

- **UI name:** Remove associated records from workflow · **Category:** Associations · **Priority:** LONG_TAIL
- **JSON `type`:** `remove_associated_records_from_workflow`
- **Screenshot:** `screenshots/b3-028-worker-roundtrip.png`
- **Fixture:** associated object `custom_objects.zzz_spike_b3_record`; target Draft workflow `ZZZ-SPIKE-b3-associated-destination` (`00000000-0000-4000-8000-000000000169`)

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Remove associated records from workflow` | yes | `name` | |
| SELECT AN OBJECT | select | objects associated with the current workflow record | empty | yes | `attributes.associatedObject` | Saved `custom_objects.zzz_spike_b3_record`. |
| ASSOCIATION LABEL | multi-select | association labels for selected object | `Please Select` | conditional | `attributes.associationLabel[]` | Saved association ID. Not applicable to contact↔company. |
| WORKFLOW | select | compatible workflows from which associated records can be removed | empty | yes | `attributes.WorkflowId` | Saved the custom-object-based Draft fixture workflow. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000285 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000285",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 15,
  "attributes": {
    "associatedObject": "custom_objects.zzz_spike_b3_record",
    "associationLabel": ["000000000000000000000009"],
    "WorkflowId": "00000000-0000-4000-8000-000000000169",
    "type": "remove_associated_records_from_workflow",
    "__customInputs__": {}
  },
  "name": "Remove associated records from workflow",
  "type": "remove_associated_records_from_workflow",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000256"
}
```

## Quirks

- The action removes associated records from a chosen compatible workflow; it does not remove the underlying association. Availability and prerequisites mirror the Add variant.
- With no matching associated records, no records are removed.
