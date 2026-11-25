# GHL v2 API — verified coverage matrix

Base: `https://services.leadconnectorhq.com` · Header: `Version: 2021-07-28`
Auth: `Authorization: Bearer pit-...` (sub-account Private Integration Token)

**Method:** every row below was probed against a real sub-account. Reads are
live GETs. Writes were probed with empty bodies and fake IDs (see the safety
rule in SKILL.md) — a `400`/`422` validation error proves the route exists
without creating anything.

Status column reflects what a **location-scoped PIT** sees. An OAuth marketplace
app may see more; that has not been verified here.

`{loc}` = locationId · `{co}` = companyId

---

## Reads — confirmed working (200)

| Resource | Endpoint |
|---|---|
| Location | `GET /locations/{loc}` |
| Contacts | `GET /contacts/?locationId={loc}` |
| Conversations | `GET /conversations/search?locationId={loc}` |
| Messages in a conversation | `GET /conversations/{convId}/messages` |
| Pipelines | `GET /opportunities/pipelines?locationId={loc}` |
| Opportunity search | `GET /opportunities/search?location_id={loc}` ⚠️ note `location_id`, not `locationId` |
| Calendars | `GET /calendars/?locationId={loc}` |
| Calendar groups | `GET /calendars/groups?locationId={loc}` |
| **Forms** | `GET /forms/?locationId={loc}` |
| Form submissions | `GET /forms/submissions?locationId={loc}` |
| **Surveys** | `GET /surveys/?locationId={loc}` |
| Survey submissions | `GET /surveys/submissions?locationId={loc}` |
| **Workflows** | `GET /workflows/?locationId={loc}` |
| **Funnels** | `GET /funnels/funnel/list?locationId={loc}` |
| Campaigns | `GET /campaigns/?locationId={loc}` |
| Custom fields | `GET /locations/{loc}/customFields` |
| Custom values | `GET /locations/{loc}/customValues` |
| Tags | `GET /locations/{loc}/tags` |
| Email templates | `GET /emails/builder?locationId={loc}` |
| Trigger links | `GET /links/?locationId={loc}` |
| Blog sites / authors | `GET /blogs/site/all`, `GET /blogs/authors` |
| Social accounts | `GET /social-media-posting/{loc}/accounts` |
| Products / prices | `GET /products/?locationId={loc}` |
| Orders / transactions / subscriptions | `GET /payments/{orders\|transactions\|subscriptions}?altId={loc}&altType=location` |
| **Users** | `GET /users/?locationId={loc}` |
| **Businesses** | `GET /businesses/?locationId={loc}` |
| **Custom objects** | `GET /objects/?locationId={loc}` |
| **Associations** | `GET /associations/?locationId={loc}` |
| **Voice AI agents** | `GET /voice-ai/agents?locationId={loc}` |
| Proposals | `GET /proposals/document?locationId={loc}` |

Bolded rows have **no MCP equivalent** — API is the only programmatic path.

## Writes — route confirmed to exist

Validation error on empty body ⇒ route is real and usable.

| Action | Endpoint | Probe result |
|---|---|---|
| Create calendar | `POST /calendars/` | 400 "Location ID is required" |
| Create appointment | `POST /calendars/events/appointments` | 400 "Location ID is required" |
| Create opportunity | `POST /opportunities/` | 422 "locationId can't be undefined" |
| Create product | `POST /products/` | 422 locationId required |
| Create trigger link | `POST /links/` | 400 locationId required |
| Create blog post | `POST /blogs/posts` | 422 locationId must be a string |
| Create custom field | `POST /locations/{loc}/customFields` | 422 name/dataType required |
| Create custom value | `POST /locations/{loc}/customValues` | 422 name required |
| Create tag | `POST /locations/{loc}/tags` | 422 name required |
| Create user | `POST /users/` | 422 "companyId can't be undefined" |
| Create email template | `POST /emails/builder` | 422 locationId required |
| Create conversation | `POST /conversations/` | 400 contactId required |
| Send message | `POST /conversations/messages` | 404 "Contact id not given" (route exists) |
| Delete contact | `DELETE /contacts/{id}` | 400 not found (route exists) |
| Share snapshot | `POST /snapshots/share/link` | 422 companyId not provided |
| Upload media | `POST /medias/upload-file` | 400 — needs `multipart/form-data`, not JSON |
| **Create sub-account** | `POST /locations/` | **agency PIT only.** 422 lists required fields; `firstName`/`lastName` must go in `prospectInfo`, not top level. Returns 201 |

### Confirmed NOT available to a Private Integration token

| Action | Endpoint | Result |
|---|---|---|
| Create pipeline | `POST /opportunities/pipelines` | `401 "not authorized for this scope"` **regardless of scopes granted** — IAM-blocked for PITs. Build in the UI at `/v2/location/{loc}/settings/pipeline` (singular) |
| Create workflow | `POST /workflows/` | `404 Cannot POST` — UI only (but see the AI builder in SKILL.md) |
| Any location route with an **agency** PIT | `/locations/{loc}/*`, `/opportunities/*` | `401 "not authorized for this scope"` — agency and location tokens are disjoint; you need both |

### Reading a Miro board that documents a client journey

Not GHL, but it pairs with this work constantly — journeys arrive as Miro
boards. Two layers, two different problems:

- **Flow-chart boxes** built from Miro's V2 stencil/flowchart shapes come back
  from `GET /v2/boards/{id}/items` with `isSupported: false` and **no
  `data.content`**. The text is not retrievable from that endpoint at all — it
  renders to canvas. Screenshot and read it, or use the accessibility route
  below.
- **Comments** are not items either. Use
  `GET /v2-experimental/boards/{id}/comments` — it returns
  `messages[].content` **and** `position{x,y}`, so each note can be mapped to
  the journey row it annotates. On a real board the comments were the actual
  requirements ("what happens if they don't book?", "take credit card / over
  phone"), far more valuable than the box labels.

Miro's live-embed page also has an **"Explore board content"** accessibility
button that renders a read-only DOM outline of board text — a no-API fallback,
though it surfaced only the comments, not the stencil labels.

### `opportunities/search` — GET and POST disagree

`GET /opportunities/search?location_id={loc}` works (snake_case query param).
`POST /opportunities/search` with the same body returns
`400 "LocationId is missing in body"` even when `location_id` **is** in the body —
it wants camelCase `locationId` there. When in doubt use the GET form.

### ⚠️ Action endpoints — these EXECUTE, no dry run

| Action | Endpoint |
|---|---|
| Enroll contact in workflow | `POST /contacts/{contactId}/workflow/{workflowId}` → `201 succeeded:true` |
| Remove from workflow | `DELETE /contacts/{contactId}/workflow/{workflowId}` |
| Add to campaign | `POST /contacts/{contactId}/campaigns/{campaignId}` |

Never probe these with real IDs. Enrolling a contact fires whatever the
published workflow does, including outbound email and SMS.

## Blocked — `404`, route does not exist

Genuinely UI-only. Don't hunt for an endpoint.

- `POST /workflows/` — **workflows cannot be created via API**
- `GET|PUT|PATCH /workflows/{id}` — all three return `404 Cannot <METHOD>
  /workflows/{id}` (probed with a fake id, 2026-07-22). **A workflow's contents
  are unreachable over the API — you cannot read, edit, or diff the action
  graph, only list workflows via `GET /workflows/?locationId={loc}`.** Read the
  builder canvas DOM instead (see SKILL.md). Note this is a genuine `404`, not a
  scope `401` — no PIT scope or OAuth app changes it.
- `POST /funnels/funnel` — **funnels cannot be created via API**
- `GET /courses/`, `/courses/courses-exporter` — no courses/memberships API
- `GET /hooks/` — no webhook-management API at this path
- `GET /contacts/tasks/search` — use `/contacts/{id}/tasks` instead

## Blocked — IAM, closed to Private Integration tokens

`401 "This route is not yet supported by the IAM Service."` — the route exists
but PITs cannot reach it. **No scope change fixes this.** Needs an OAuth
marketplace app, or do it in the UI.

- `POST /forms/`, `DELETE /forms/{id}` — **forms are read-only for PITs**
- `POST /surveys/`, `POST /surveys/submissions`
- `GET /marketplace/app`

Note `PUT /forms/{id}` returns a plain 404 — no update route exists at all.

## Blocked — scope, fixable

`401 "The token is not authorized for this scope."` — **add the scope to the
Private Integration and reissue the token.**

- `GET /custom-menus/`
- `POST /emails/schedule`
- `POST /locations/{loc}/templates`
- `GET /saas-api/public-api/locations`

## Agency-level — out of reach of a location PIT

- `GET /snapshots/?companyId={co}` → 401 Unauthorized
- Anything under `/saas-api/`

These need an agency-scoped token.

## Rate limits

Read from live response headers — every response carries them:

```
x-ratelimit-max: 100                  # requests per interval
x-ratelimit-interval-milliseconds: 10000   # → 100 req / 10 s
x-ratelimit-remaining: 99
x-ratelimit-limit-daily: 200000
x-ratelimit-daily-remaining: 199918
x-ratelimit-daily-reset: 84910000
```

**100 requests per 10 seconds, 200,000 per day, per token.** Bulk work should
sleep ~100ms between calls. Always read `x-ratelimit-remaining` rather than
guessing — it's on every response, including errors.

## Pagination — three incompatible schemes

This is a common source of silently truncated results.

**1. Cursor style** — `contacts`, `opportunities/search`

```json
{ "contacts": [...],
  "meta": { "total": 42, "nextPageUrl": "...", "startAfterId": "...",
            "startAfter": 1699999999999, "currentPage": 1, "nextPage": 2 } }
```
Page with `startAfterId` + `startAfter` (both, from `meta`), or just follow
`meta.nextPageUrl`. **Not** `skip`/`offset`.

**2. Skip style** — `forms`, `surveys`

```json
{ "forms": [...], "total": 18 }
```
Page with `limit` + `skip`. No `meta`, no cursor. Compare against `total`
yourself to know when to stop.

**3. Offset style** — `invoices`, `blogs`

Page with `limit` + `offset`, and on invoices **both must be strings** —
`offset=0` (integer) returns `422 "offset must be a string"`.

## Sub-routes — verified

Contacts (all confirmed live; fake ID → `400 not found` proves the route):

| Route | Method |
|---|---|
| `/contacts/{id}/notes` | GET (also POST/PUT/DELETE) |
| `/contacts/{id}/tasks` | GET — **use this, not `/contacts/tasks/search` (404)** |
| `/contacts/{id}/appointments` | GET |
| `/contacts/{id}/followers` | POST |
| `/contacts/bulk/business` | POST — bulk business assignment |
| `/contacts/tags/bulk` | ❌ 404 — no bulk tag route; loop instead |

Calendars:

| Route | Notes |
|---|---|
| `/calendars/resources/rooms` | GET → 200 (also `/equipments`) |
| `/calendars/blocked-slots` | GET — requires one of `userId`, `calendarId`, `groupId` |
| `/calendars/events/block-slots` | POST — route exists |
| `/calendars/events/appointments/{id}/notes` | ❌ 404 at this path |

Commerce — all GET → 200:
`/products/inventory`, `/products/collections`, `/payments/coupon/list`,
`/payments/integrations/provider/whitelabel`, `/invoices/estimate/list`,
`/store/shipping-zone` — all take `altId={loc}&altType=location`.

Misc:

| Route | Result |
|---|---|
| `/blogs/posts/url-slug-exists` | GET → 200 `{"exists":false}` |
| `/social-media-posting/{loc}/categories` · `/tags` | GET → 200 |
| `/email/verify?locationId={loc}` | POST — route exists, needs `type` + `verify` |
| `/locations/{loc}/customFields/folder` | ❌ 404 |

## Quirks

- **Param naming is inconsistent.** `/opportunities/search` wants `location_id`
  (snake_case); nearly everything else wants `locationId` (camelCase).
- **Payments/invoices use `altId` + `altType=location`**, not `locationId`.
- **Invoices return `401 "E01 - Unauthorized request"`** — a distinct auth path
  from the rest of the API.
- `GET /calendars/{id}/free-slots` returns `400 "Calendar is inactive"` for
  disabled calendars — that's a state error, not a permissions problem.
- Media upload requires `multipart/form-data`; sending JSON gives
  `UPLOAD_UNSUPPORTED_CONTENT_TYPE`.
