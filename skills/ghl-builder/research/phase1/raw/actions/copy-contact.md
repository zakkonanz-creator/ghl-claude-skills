# Action: Copy contact

- **UI name:** Copy contact · **Category:** Contact · **Priority:** LONG_TAIL
- **Screenshot:** `screenshots/b3-006-copy-contact.png`
- **Premium:** yes — panel states that this action incurs additional charges per execution
- **JSON `type`:** `copy_contact_to_subaccount`
- **Status:** saved in Draft only; never published or executed

## Config panel fields (visible before the gate)

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text input | free text | `Copy contact` | yes | `name` | Canvas label. |
| SELECT AN ACCOUNT | searchable account select | agency sub-account catalog; observed multiple account names | none | yes | `attributes.newLocations[].{value,label}` | Stores destination location ID and label. |
| ADD TAGS TO SUB-ACCOUNT | tag multiselect | selected destination account's tags / tag creation mapping | none | no | `attributes.tags[]` | Panel says tags will be created in the selected sub-account and mapped to the copied contact. |
| COPY TAGS | switch | on/off | off | no | `attributes.withTags` | Representative saved value `false`. |
| COPY CUSTOM FIELDS | switch | on/off | off | no | `attributes.withCustomFields` | Representative saved value `false`. |
| UPDATE CONTACT IF IT ALREADY EXISTS | switch | on/off | off | no | `attributes.updateIfExists` | Applies when duplicate contacts are disabled in the destination. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000182 nodeId=00000000-0000-4000-8000-000000000189 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000189",
  "order": 2,
  "attributes": {
    "type": "copy_contact_to_subaccount",
    "newLocations": [
      {
        "value": "<id063>",
        "label": "Target Sub-account"
      }
    ],
    "withTags": false,
    "withCustomFields": false,
    "tags": [],
    "updateIfExists": false
  },
  "name": "Copy contact",
  "type": "copy_contact_to_subaccount",
  "parentKey": "00000000-0000-4000-8000-000000000187"
}
```

## Location-data-dependent fields

- `SELECT AN ACCOUNT` loads the agency's available sub-accounts.
- Tag choices and mapping depend on the selected destination account.

## Premium safety

- Exact panel warnings: `This is a premium action` and `Using this action will incur additional charges per execution`.
- The node was configured and saved in Draft for schema capture only. The workflow was never published, tested, or executed, so no premium execution was triggered.
- Official limitation: standalone files/documents are not migrated; references can break if the source contact is later deleted.
