# Action: Send estimate

- **UI name:** Send estimate · **Category:** Payments
- **JSON `type`:** `payments_create_estimate`
- **Screenshot:** default `screenshots/b6-006-send-estimate.png`; fixture available `screenshots/b6-006-send-estimate-fixture.png`
- **Premium:** no

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | text | free text | `Send estimate` | yes | `name` | |
| FROM USER | user dropdown | location users | none | yes | `attributes.userId` | Captured Test User. |
| ESTIMATE TEMPLATE | async dropdown | invoices-api `estimate/template/options/list` | none | yes | `attributes.templateId` | Captured `zzz-spike-estimate`. |
| ESTIMATE MODE | radio | Live (`"true"`), Test (`"false"`) | Live | yes | `attributes.liveMode` | Captured Live; stored value is a string. |
| SENDING MODE | dropdown | Send Directly, Create as Draft | Send Directly | yes | `attributes.sendMode` | Captured `sendDirectly`; alternate `createDraft`. |
| CHANNEL | dropdown | Email & Text, Email, Text | Email & Text | yes | `attributes.action` | Captured `sms_and_email`; alternates `email`, `sms`. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000195 nodeId=00000000-0000-4000-8000-000000000321 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000321",
  "order": 4,
  "attributes": {
    "userId": "<userId>",
    "templateId": "000000000000000000000007",
    "liveMode": "true",
    "sendMode": "sendDirectly",
    "action": "sms_and_email",
    "type": "payments_create_estimate",
    "__customInputs__": {}
  },
  "name": "Send estimate",
  "type": "payments_create_estimate",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000309"
}
```

## Fixture and capture evidence

- Created `zzz-spike-estimate` through the live Estimates API with one minimal `zzz-spike-item`, then selected it in the native action panel.
- Native panel Save action + top Save produced the verified node. No workflow execution, delivery, gateway connection, or publication occurred.

## Official runtime semantics

- Requires payments/processor, an active template, and valid email/phone for the selected channel. Lifecycle: Sent, Viewed, Accepted, Declined, Paid.
- A deactivated From User must be replaced with an active user.
- Official source: https://help.gohighlevel.com/support/solutions/articles/155000003705
