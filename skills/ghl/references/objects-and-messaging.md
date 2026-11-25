# GHL — messaging depth & the custom-object data model

## Conversations & messaging

All routes below confirmed to exist (fake-ID probe → `400 not found`).

### Reads

| Route | Notes |
|---|---|
| `GET /conversations/{convId}` | single conversation |
| `GET /conversations/{convId}/messages` | messages in a conversation (paginated) |
| `GET /conversations/messages/{msgId}` | one message by id |
| `GET /conversations/messages/email/{emailMsgId}` | **email messages are separate** — distinct id space and route from SMS/other |
| `GET /conversations/messages/{msgId}/locations/{loc}/recording` | call recording audio |
| `GET /conversations/locations/{loc}/messages/{msgId}/transcription` | call transcription |

Email being a separate message type with its own id and endpoint is the main
gotcha here — a message id from the generic route won't necessarily resolve on
the email route and vice-versa.

### Writes / actions

| Route | Method | Notes |
|---|---|---|
| `/conversations/messages` | POST | **outbound send — executes.** Needs `type` + `contactId` |
| `/conversations/messages/inbound` | POST | log an inbound message (no send); needs `conversationId` or `contactId` |
| `/conversations/messages/upload` | POST | upload an attachment for a message |
| `/conversations/messages/{msgId}/schedule` | DELETE | cancel a scheduled message |
| `/conversations/messages/{msgId}/status` | PUT | update delivery status |
| `/conversations/` | POST | create conversation; needs `contactId` |

`type` on send is the channel — `SMS`, `Email`, `WhatsApp`, `IG`, `FB`,
`Custom`, etc. The exact enum wasn't captured because the API validates
`contactId` before `type`; POST with a **real** contactId and `{}` otherwise to
have it print the valid channel list. (Real contact is fine here — the missing
`type` makes it fail before anything sends. Do **not** add a `message` field
while probing.)

`/conversations/messages/inbound` is the safe way to record message history
without triggering an actual outbound send — useful for migrations and logging.

---

## The custom-object data model

GHL's data model is three system objects plus any custom objects the account
defines.

### Object keys — verified

`GET /objects/?locationId={loc}` on a fresh account returns only:

| key | plural label | type |
|---|---|---|
| `business` | Companies | SYSTEM_DEFINED |
| `opportunity` | Opportunities | SYSTEM_DEFINED |
| `contact` | Contacts | SYSTEM_DEFINED |

⚠️ **Key naming is not what you'd guess.** The Companies object key is
`business`, not `company`. User-created custom objects use a `custom_objects.`
prefix (e.g. `custom_objects.pet`). Always **list objects first** to get real
keys — a guessed key returns `404 not found`, which reads like a missing route
but is actually a wrong key.

### Object & record routes

| Route | Method | Result |
|---|---|---|
| `/objects/?locationId={loc}` | GET | list object schemas ✅ |
| `/objects/{key}?locationId={loc}&fetchProperties=true` | GET | schema + fields (use a **real** key) |
| `/objects/` | POST | create a custom object schema (route exists) |
| `/objects/{key}/records` | POST | create a record (route exists) |
| `/objects/{key}/records/{id}?locationId={loc}` | GET | one record ✅ |
| `/objects/{key}/records/search` | POST | search records (route exists) |

### Associations

`GET /associations/?locationId={loc}&limit=20&skip=0` — paginates with
`limit`/`skip`. System associations present by default:

| key | links |
|---|---|
| `OPPORTUNITIES_CONTACTS_ASSOCIATION` | opportunity ↔ contact |
| `BUSINESSES_CONTACTS_ASSOCIATION` | Primary Company ↔ contact |

| Route | Method | Result |
|---|---|---|
| `/associations/?locationId={loc}` | GET | list ✅ |
| `/associations/key/{keyName}?locationId={loc}` | GET | lookup by key |
| `/associations/` | POST | create a custom association (route exists) |
| `/associations/relations` | POST | create a relation between two records (route exists) |

**None of the object or association surface has any MCP equivalent** — this is
API-only territory, and it's where GHL's relational modelling (companies,
custom objects, record linking) actually lives. For any agency doing more than
flat contact lists, this is the highest-value API area.
