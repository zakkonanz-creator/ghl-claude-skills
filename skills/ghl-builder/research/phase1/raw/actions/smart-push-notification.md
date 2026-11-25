# Smart push notification

- **UI name:** Smart push notification · **Category:** Communities · **Priority:** LONG_TAIL (B4-15)
- **JSON `type`:** `custom-push-notification`
- **Screenshot:** `screenshots/b4-015-smart-push-notification.png`
- **Status:** captured and saved natively in Draft

## Config panel fields

| UI label | Input type | Options / source | Default | Required | JSON path | Notes |
|---|---|---|---|---|---|---|
| ACTION NAME | enabled text | free text in the current live panel | `Smart push notification` | yes | `name` | Official docs say it cannot be customized, which conflicts with the observed enabled, non-readonly input. |
| TITLE | text/merge input | text and contact variables; max 100 chars | empty | yes | `attributes.title` | |
| MESSAGE BODY | text/merge input | text and contact variables; max 300 chars | empty | yes | `attributes.body` | |
| REDIRECTION | custom select | `Communities`; `Courses` | empty | yes | `attributes.redirectionUrl` | Saved lowercase token. |

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000181 nodeId=00000000-0000-4000-8000-000000000219 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000219",
  "order": 5,
  "attributes": {
    "title": "ZZZ spike title",
    "body": "ZZZ spike message",
    "redirectionUrl": "communities",
    "type": "custom-push-notification",
    "__customInputs__": {}
  },
  "name": "Smart push notification",
  "type": "custom-push-notification",
  "workflowsActionType": "INTERNAL",
  "parentKey": "00000000-0000-4000-8000-000000000217"
}
```

## Official runtime semantics

- Sends a push notification through the Client Portal mobile app. Only registered Client Portal users receive it; other contacts receive nothing.
- Title is required/max 100 characters, body is required/max 300, and redirection is required with only Communities or Courses—no external URL.
- Source: [HighLevel Smart Push Notification](https://help.gohighlevel.com/support/solutions/articles/155000004592).

## Quirks

- Live-vs-official discrepancy: the current panel exposes ACTION NAME as an enabled, non-readonly text input, while the official article says the action name is prefilled and cannot be customized. The representative capture retained the default name.
