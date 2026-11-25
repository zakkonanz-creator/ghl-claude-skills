# Action: Send Internal Notification

- **UI name:** Send internal notification · **Category:** Communication · **Priority:** CORE
- **JSON `type`:** `internal_notification` (node "Internal Notification") · **Screenshots:** `088-internal-notif-panel.png`, `089-notif-types.png`, `screenshots/b8-015-r5-internal-sms-saved.png`, `screenshots/b8-015-r5-internal-whatsapp-saved.png`
- **Premium:** no · **Description:** "Send a notification to someone other than the contact"

## Fields
| UI label | Input | Options | JSON path | Notes |
|---|---|---|---|---|
| ACTION NAME | text | — | node `name` | |
| TYPE OF NOTIFICATION | dropdown ("Select a Type") | **Email / Notification (in-app) / SMS / WhatsApp** | `attributes.type` (sub-type) | selecting reveals sub-fields |

### Email sub-type panel fields (confirmed live, 2026-07-16):
`From name`, `From email`, **`To user type`** (dropdown "Select user type" — assigned user / specific user / etc.), **Notify followers** (Contact followers / Opportunity followers), `Cc`, `Bcc`, `Subject`, `Templates` (Select template — location email templates), `Message` (rich text). So the email sub-shape includes recipient targeting via `userType` + optional follower flags.

### Sub-field sets (payload nested under a key matching the sub-type — per Phase-0 read schema)
- **Email** → `attributes.email.{subject, html, userType, assignedOwners}` + recipient
- **SMS** → `attributes.sms.{body, userType, assignedOwners}`
- **Notification** (in-app) → `attributes.notification.{title, body, userType, redirectPage}`
- **WhatsApp** → `attributes.whatsapp.{body, userType, assignedOwners?}`

Recipient selection = **who to notify**: `userType` (`"user"` for a specific user — verified) + `selectedUser: [userIds]`. **Location-dependent** (users): `GET /users/search?companyId=&locationId=`.

## Captured attributes JSON — Email sub-type  (`verified: saved-node`)
```json
{ "name": "Internal Notification", "type": "internal_notification",
  "attributes": {
    "type": "email",
    "email": {
      "isCloned": false,
      "from_name": "", "from_email": "",
      "subject": "...", "html": "<p style=\"…verdana…16px…\">…</p>",
      "userType": "user",
      "selectedUser": ["<userId>"],
      "preHeader": "", "attachments": []
    } } }
```
**VERIFIED for the Email sub-type:** `attributes.type:"email"` + nested `attributes.email.{ from_name, from_email, subject, html, userType, selectedUser:[ids], preHeader, attachments, isCloned }`. Recipient = **`userType:"user"` + `selectedUser:[userIds]`** for a specific user (panel shows To User Type = "Particular user"). Production corpora also show `userType:"assign"` + `assignedOwners:["contact_owner"]` (assigned user) and `userType:"all"` (all users), and template mode `template_id` + `templatesource:"email-builder"` + `previewUrl` instead of `html`.

## Captured attributes JSON — Notification (in-app) sub-type  (`verified: saved-node` — node `ca492d48…`, steps v18, renders + panel round-trips: screenshot `fixer-013-panel-notif-app.png`)
```json
{ "name": "zzz-spike Internal Notif App", "type": "internal_notification",
  "attributes": {
    "type": "notification",
    "notification": {
      "type": "send_notification",
      "title": "zzz-spike app notif",
      "body": "zzz-spike in-app notification body {{contact.name}}",
      "redirectPage": "contact",
      "userType": "all"
    } } }
```
**VERIFIED for the Notification sub-type:** nested `attributes.notification.{ type:"send_notification", title, body, redirectPage, userType }`. `redirectPage` enum seen: `"contact"` (panel "Contact"), `"conversation"` (production). `userType:"all"` → panel "All users"; production also shows `userType:"assign"` (+ optional `assignedOwners:["contact_owner"]`).

## R5 SMS and WhatsApp sub-variants

### SMS live fields and saved shape

The live SMS panel exposes **To User Type** (All Users, Assigned owners, Custom Number, Particular User), optional Notify followers (Contact followers / Opportunity followers), Templates, Message, attachments, and a Test Phone Number / Send test SMS control. No test was sent. The B8 native save produced:

```json
{
  "id": "00000000-0000-4000-8000-000000000334",
  "attributes": {
    "type": "sms",
    "sms": {
      "body": "R5 internal SMS for {{contact.first_name}}.",
      "userType": "all",
      "attachments": []
    }
  },
  "name": "Internal Notification",
  "type": "internal_notification"
}
```

This matches production shapes `attributes.sms.{body,userType,assignedOwners?,attachments}`. `userType:"all"` needs no recipient array; production assigned-owner examples use `userType:"assign"` and may include `assignedOwners:["contact_owner"]`.

### WhatsApp live fields and saved shape

The WhatsApp subtype was **not integration-gated in this internal-notification panel** and saved successfully in Draft without connecting or sending WhatsApp. Its live fields are To User Type (**Assigned owners** or **Particular User** only), Assigned owners (Contact owner), optional follower toggles, Templates, and Message. Unlike SMS, this captured WhatsApp node has no `attachments` key. Its `body` is HTML-flavored even though the editor displayed plain text.

## Verified JSON
<!-- verify: workflowId=00000000-0000-4000-8000-000000000171 nodeId=00000000-0000-4000-8000-000000000288 kind=action -->
```json
{
  "id": "00000000-0000-4000-8000-000000000288",
  "order": 17,
  "attributes": {
    "type": "email",
    "email": {
      "isCloned": false,
      "from_name": "",
      "from_email": "",
      "subject": "zzz-spike internal email {{contact.name}}",
      "html": "<p style=\"margin:0px;font-family:verdana,geneva,sans-serif;font-size:16px; padding-left: 0px!important;\">zzz-spike internal notification body</p>",
      "userType": "user",
      "selectedUser": [
        "<userId>"
      ],
      "preHeader": "",
      "attachments": []
    }
  },
  "name": "zzz-spike Internal Notif Email",
  "type": "internal_notification",
  "parentKey": "00000000-0000-4000-8000-000000000289"
}
```

## Quirks
- Sub-type key in `attributes` matches the chosen `type` string. Email, in-app notification, SMS, and WhatsApp shapes are now captured; the strict machine-checkable witness above is the WhatsApp variant.
- Recipients reference location users (`selectedUser` = ids from `GET /users/search`).
