# Action: Send documents & contracts

- **UI name:** Send documents & contracts · **Category:** Payments
- **JSON `type`:** `proposals_estimates_send_document`
- **Screenshot:** default `screenshots/b6-005-send-documents-contracts.png`; fixture available `screenshots/b6-005-send-documents-contracts-fixture.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Send documents & contracts` | yes | `name` | |
| FROM USER | user dropdown | location users | none | yes | `attributes.userId` | Captured Test User. |
| TEMPLATE | async dropdown | Proposals API `templates/all` | none | yes | `attributes.templateId` | Captured `zzz-spike-doc-template`. |
| SENDING MODE | dropdown | Send Directly (`"true"`), Create as Draft (`"false"`) | Send Directly | yes | `attributes.sendDocument` | Captured Send Directly; value is a string. |
| CHANNEL | conditional dropdown | Email, Email & SMS, SMS | Email | yes when sending directly | `attributes.medium` | Captured Email. Hidden for Create as Draft. |
| ASSIGN SENDER FIELDS TO | conditional dropdown | From User, Template Owner | From User | no | inferred / uncaptured: `attributes.assignSenderFieldsTo` | Appears only when the selected template has sender-fillable fields. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000309 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000309",
  "order": 3,
  "attributes": {
    "userId": "<userId>",
    "templateId": "000000000000000000000006",
    "sendDocument": "true",
    "medium": "email",
    "type": "proposals_estimates_send_document",
    "__customInputs__": {}
  },
  "name": "Send documents & contracts",
  "type": "proposals_estimates_send_document",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000307"
}
```

## Fixture and capture evidence

- Created the minimal `zzz-spike-doc-template` fixture in Payments → Documents & Contracts → Templates, then selected it in the live action panel.
- Native panel Save action + top Save produced the verified node above. No workflow publication or delivery occurred.

## Official runtime semantics

- Requires a saved template and a contact with valid email. Template Owner means the user who last modified the template and controls whose signature fields populate.
- Document status is evaluated only on workflow entry; use the Documents & Contracts trigger for later status changes.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000004887
