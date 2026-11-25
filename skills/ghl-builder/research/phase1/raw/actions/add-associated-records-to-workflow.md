# Action: Add associated records to workflow

- **UI name:** Add associated records to workflow · **Category:** Associations · **Priority:** LONG_TAIL
- **JSON `type`:** `add_associated_records_to_workflow`
- **Screenshot:** `screenshots/b3-027-worker-roundtrip.png`
- **Fixture:** associated object `custom_objects.zzz_spike_b3_record`; destination Draft workflow `ZZZ-SPIKE-b3-associated-destination` (`00000000-0000-4000-8000-000000000169`)

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Add associated records to workflow` | yes | `name` | |
| SELECT AN OBJECT | select | objects associated with the current workflow record | empty | yes | `attributes.associatedObject` | Saved `custom_objects.zzz_spike_b3_record`. |
| ASSOCIATION LABEL | multi-select | association labels for the selected object | `Please Select` | conditional | `attributes.associationLabel[]` | Saved association ID `000000000000000000000009`. Not applicable to contact↔company. |
| WORKFLOW | select | destination workflows compatible with the selected associated-object type | empty | yes | `attributes.WorkflowId` | Saved the custom-object-based Draft fixture workflow. Key uses capital `W` and `I`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000256 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000256",
  "parent": "00000000-0000-4000-8000-000000000185",
  "order": 14,
  "attributes": {
    "associatedObject": "custom_objects.zzz_spike_b3_record",
    "associationLabel": ["000000000000000000000009"],
    "WorkflowId": "00000000-0000-4000-8000-000000000169",
    "type": "add_associated_records_to_workflow",
    "__customInputs__": {}
  },
  "name": "Add associated records to workflow",
  "type": "add_associated_records_to_workflow",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000255"
}
```

## Quirks

- The action enrolls associated records into another compatible workflow; it does not create associations. It is available from Contact-, Company-, and Custom-Object-based workflows.
- Destination workflows are filtered by the selected associated-object type.
