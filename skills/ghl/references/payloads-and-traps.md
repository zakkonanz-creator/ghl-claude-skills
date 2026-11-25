# GHL — payload shapes & the traps that eat hours

The endpoint existing is half the battle. These are the payload-level details
that make write calls actually succeed, plus the failure modes that masquerade
as something else. This is the highest-leverage file for getting an agent
working on the first try instead of the fifth.

## The `Version` header trap ⚠️ #1 time-waster

A missing or invalid `Version` header returns **`401`** — indistinguishable at
the status-code level from an auth failure. This sends people to regenerate
tokens, check scopes, and re-read auth docs when nothing is wrong with the token.

Tell them apart by the body:

| Body | Cause | Fix |
|---|---|---|
| `"version header was not found."` | no `Version` header | add `-H "Version: 2021-07-28"` |
| `"Invalid Private Integration token"` | bad/expired token | reissue the PIT |
| `"The token is not authorized for this scope."` | valid token, missing scope | add scope, reissue |

**Always send `Version: 2021-07-28` on every request.** A bogus date value also
401s. This one header is the most common silent failure.

## The `User-Agent` trap ⚠️ (verified 2026-07-22)

Cloudflare fronts the API and **403s on default library User-Agents**. Python's
`urllib` gets:

```
403 error_code 1010 "browser_signature_banned"
    "The site owner has blocked access based on your browser's signature."
```

This is not auth, not scope, not rate limiting — and the body says "site owner",
which sends you hunting for a permissions problem that doesn't exist. Send any
normal-looking UA and it passes:

```python
req.add_header("User-Agent", "my-tool/1.0")
```

`curl` sets its own UA and is unaffected, so this only shows up once you move
from shell probing to a script — i.e. exactly when you've stopped suspecting
transport problems.

## `MONETORY`, not `MONETARY` ⚠️

GHL's custom-field `dataType` enum contains a **typo that is part of the API
contract**. The valid values are:

```
TEXT · LARGE_TEXT · NUMERICAL · PHONE · MONETORY · CHECKBOX · SINGLE_OPTIONS
MULTIPLE_OPTIONS · FLOAT · TIME · DATE · TEXTBOX_LIST · FILE_UPLOAD · RADIO
```

Spelling it `MONETARY` — the correct English — returns a `422`. Always let the
`422` print the current enum rather than trusting memory or the docs.

## Custom fields — read and write are different shapes

The most common contact-update bug in GHL.

**Definitions** live at `GET /locations/{loc}/customFields`:
```
id=CF_ID_FROM_DEFINITIONS  fieldKey=contact.employee_count  dataType=TEXT
```
Every custom field has both an **id** and a **fieldKey** (prefixed `contact.`
for contact fields). You need the id or key from here first.

**Reading** a contact returns them under `customFields` as an array of
`{id, value}` — **not** keyed by name, and **empty `[]` when none are set** (so
don't assume a field is missing because it's absent).

**Writing** — `PUT /contacts/{id}` with an array (this shape is validation-accepted):
```json
{ "customFields": [ { "id": "CF_ID_FROM_DEFINITIONS", "value": "42" } ] }
```
The key-map form `{"customField": {"contact.employee_count": "42"}}` also
validates on older payloads, but the `customFields` **array of `{id, value}`**
is the reliable one. Map name→id via the definitions endpoint; never hardcode
ids across accounts — they differ per sub-account.

`SINGLE_OPTIONS`/`MULTIPLE_OPTIONS`/`RADIO`/`CHECKBOX` fields take the option
value(s), and multi-select takes an array.

## The contacts search filter DSL

`POST /contacts/search` is far more powerful than the `GET` list and is the
right tool for any real query. Full verified operator set:

```
eq  not_eq  contains  not_contains  wildcard  not_wildcard
match  not_match  exists  not_exists  range  not_range
contains_set  contains_not_set  gt  gte  lt  lte
nested  nested_not  has_child  has_parent
```

Shape:
```json
{
  "locationId": "...",
  "pageLimit": 20,
  "page": 1,
  "filters": [
    { "field": "tags",  "operator": "contains", "value": "vip" },
    { "field": "email", "operator": "exists" }
  ],
  "sort": [ { "field": "dateAdded", "direction": "desc" } ]
}
```
- Multiple `filters` AND together.
- `range`/`not_range` take an object value (`{gte, lte}`) for date/number windows.
- `has_child`/`has_parent`/`nested` query across **associations** — this is how
  you filter contacts by related custom-object records.
- Pages with `pageLimit` + `page` (its own scheme — see the pagination table).

An invalid operator returns a 422 that **lists the whole valid enum** — the
fastest way to rediscover this if it ever changes.

## Dates are inconsistent — know which format per endpoint

| Context | Format |
|---|---|
| `calendars/free-slots` (`startDate`/`endDate`) | epoch **milliseconds** |
| `calendars/events/appointments` (`startTime`/`endTime`) | **ISO-8601** with offset |
| contact `dateAdded`/`dateUpdated` (read) | epoch millis |
| search `range` on dates | epoch millis |

When in doubt, POST `{}` and the 422 usually names the expected type. Timezone
comes from the location (`GET /locations/{loc}` → `timezone`); appointments
respect it, so send explicit offsets in ISO strings.

## Events / webhooks — there is no management API

`/hooks`, `/webhooks`, `/workflows/webhooks` all 404 for a PIT. **You cannot
register a webhook over the API with a Private Integration token.**

To receive events, the delivery mechanism is a **Workflow with a "Webhook"
action**, configured in the UI: trigger on the event, POST to your URL. So
"notify my app when a contact is tagged" is a UI workflow build, not an API
call. (OAuth marketplace apps have a proper webhook subscription API; PITs do
not.)

## Token introspection — none for PITs

There's no endpoint to ask "what scopes does this token have"
(`/oauth/token/info` → 404; `/oauth/installedLocations` → scope 401). The only
way to know a PIT's scopes is to **read them in the UI** (Settings → Private
Integrations) or **probe** — hit the target endpoint and read the error per the
decoder. Practically: if you control the token, add every scope you'll need up
front; reissuing is the only way to change them.

## Idempotency

- **`POST /contacts/upsert`** dedupes on the location's
  `contactUniqueIdentifiers` (default `["email","phone"]`) — safe to re-run.
- **`POST /contacts/`** respects `allowDuplicateContact` (default `false` →
  errors on dupe rather than creating). Prefer `upsert` in automations.
- Most other creates are **not** idempotent — re-running makes duplicates.
  Check-then-create, or search first.

## Verified Nov 2026: calendars, users, old workflows

**Booking fails with a bare 502 but the contact saved → the host is busy.** A
calendar booking that returns a Cloudflare 502 ("couldn't complete your
registration") usually means the assigned team member's own time is blocked at
that slot, so no host is available. Check the host's availability / connected
calendar first. Don't call it a platform outage: the public booking endpoint
also 502s for made-up IDs, so test a second real calendar before blaming
HighLevel. That endpoint **upserts the contact before failing**, so never test
it with a real person's phone or email. (2026-11-10)

**Class-booking calendars: never book through `POST /calendars/events/appointments`.**
It creates `slotType: custom` one-off appointments that block the host's time
and break registrations for everyone. Book through the page's own booking
endpoint so the seat is a `slotType: default` class seat. (2026-11-10)

**Duplicate or wrong appointments → set `invalid`, never cancel.** Cancelling
fires the cancellation/reschedule workflows and notices. Invalid removes the seat
quietly; keep the newest seat.
```bash
curl -s -X PUT "$BASE/calendars/events/appointments/$APPT_ID" \
  -H "Authorization: Bearer $PIT" -H "Version: 2021-04-15" -H "Content-Type: application/json" \
  -d '{"appointmentStatus":"invalid"}'
```
Afterwards check each person has exactly one `confirmed` seat. Caveat: it also
ends that contact's appointment-based automation run (e.g. reminder sequences);
re-booking restarts it and re-sends its confirmation unless those steps are paused.
(2026-11-20)

**Older workflows drop triggers added through the builder API.** On workflows
whose document has `isTriggerBucketMigrated`, `POST /workflow/{loc}/trigger`
returns an id but the trigger never appears (not in the trigger list, not on the
canvas), and a full-document PUT rewrites the list without it. Step edits through
the full-document PUT work. Add/change triggers on those workflows in the UI
(duplicate a trigger → edit → Save trigger → top Save). Engine-built new
workflows aren't affected. (2026-11-17)

**Agency user permissions are an API job, not a UI one.** With an agency PIT:
- `GET /users/{id}` → `roles` {type, role, locationIds, restrictSubAccount},
  `scopes` (~161 strings matching the Roles & permissions toggles),
  `scopesAssignedToOnly`, `permissions` (legacy flags).
- `PUT /users/{id}` (Version 2021-07-28) takes `companyId` (**required**, else
  `422 companyId can't be undefined`), `type`, `role`, `locationIds`, `scopes`,
  `scopesAssignedToOnly`, `permissions`, and **top-level** `restrictSubAccount`
  (a `roles` object → 422). The change shows on GET a few seconds later.
- Fast pattern: set one user up in the UI as a template, GET it, PUT its role +
  scopes to the others, GET each to confirm.
- Risky scopes to watch: `private-integration-company.write`,
  `private-integration-location.write` (API keys), `snapshots/api.share`,
  `loginas.write`, `users/team-management.write`, `locations.export.list`,
  `locations.delete`, `contacts/bulkActions.write`, `companies.write`,
  `sso-config.write`. Read-only audit log needs `audit-logs.readonly`.
- The UI users list renders ~20 rows at a time and its save runs inside a frame
  the Chrome extension can't see, which is another reason to use the API. (2026-11-23)
