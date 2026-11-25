# GHL API — copy-paste recipes

Setup assumed by every snippet:

```bash
BASE="https://services.leadconnectorhq.com"
PIT="pit-..."; LOC="..."
H=(-H "Authorization: Bearer $PIT" -H "Version: 2021-07-28" -H "Content-Type: application/json")
```

**Verification status is marked per recipe:**
- ✅ **executed** — run against a live account, returned success
- 🔶 **shape-verified** — route confirmed to exist via validation-error probe;
  payload follows the API's own error messages but was not executed

---

## Reads

### Search contacts (✅ executed)

Richer than `GET /contacts/` — filters, sorting, proper paging.

```bash
curl -s -X POST "$BASE/contacts/search" "${H[@]}" \
  -d "{\"locationId\":\"$LOC\",\"pageLimit\":20,\"page\":1}"
```

⚠️ This endpoint pages with `pageLimit` + `page` — unlike every other endpoint.

### Check whether a contact already exists (✅ executed)

```bash
curl -s "$BASE/contacts/search/duplicate?locationId=$LOC&email=someone@example.com" "${H[@]}"
# → {"contact": null}  when no match
```

Use before creating, to avoid duplicate records.

### Page through all contacts (cursor style)

```bash
curl -s "$BASE/contacts/?locationId=$LOC&limit=100" "${H[@]}"
# then follow meta.nextPageUrl, or pass meta.startAfterId + meta.startAfter
```

### Free slots on a calendar (✅ executed)

```bash
curl -s "$BASE/calendars/$CAL_ID/free-slots?startDate=1753056000000&endDate=1753488000000" "${H[@]}"
```

Dates are **epoch milliseconds**. An inactive calendar returns
`400 "Calendar is inactive"` — that's a state error, not permissions. Filter to
`isActive: true` calendars from `GET /calendars/?locationId=$LOC` first.

### Get real user IDs (✅ executed)

```bash
curl -s "$BASE/users/?locationId=$LOC" "${H[@]}"
```

Needed because the MCP has no users tool and forces `userId = locationId`.

---

## Writes

### Upsert a contact (🔶 shape-verified)

Preferred over create — matches on email/phone per the location's
`contactUniqueIdentifiers` setting instead of duplicating.

```bash
curl -s -X POST "$BASE/contacts/upsert" "${H[@]}" -d "{
  \"locationId\": \"$LOC\",
  \"email\": \"someone@example.com\",
  \"firstName\": \"Jane\",
  \"tags\": [\"source-website\"]
}"
```

⚠️ **Tags trigger workflows.** Check `GET /workflows/?locationId=$LOC` for
published tag-routing workflows before adding tags in bulk.

### Create an opportunity (🔶 shape-verified)

```bash
curl -s -X POST "$BASE/opportunities/" "${H[@]}" -d "{
  \"locationId\": \"$LOC\",
  \"pipelineId\": \"...\",
  \"pipelineStageId\": \"...\",
  \"contactId\": \"...\",
  \"name\": \"New deal\",
  \"status\": \"open\",
  \"monetaryValue\": 1500
}"
```

Get pipeline and stage IDs from `GET /opportunities/pipelines?locationId=$LOC`.
The MCP cannot do this — API only.

### Create a calendar appointment (🔶 shape-verified)

```bash
curl -s -X POST "$BASE/calendars/events/appointments" "${H[@]}" -d "{
  \"locationId\": \"$LOC\",
  \"calendarId\": \"...\",
  \"contactId\": \"...\",
  \"startTime\": \"2026-08-01T14:00:00-07:00\",
  \"endTime\": \"2026-08-01T14:30:00-07:00\"
}"
```

Also MCP-impossible. Note times here are ISO-8601 while `free-slots` takes epoch
millis — the API is not consistent about this.

### Create a custom field (🔶 shape-verified)

```bash
curl -s -X POST "$BASE/locations/$LOC/customFields" "${H[@]}" -d '{
  "name": "Trail Handicap",
  "dataType": "TEXT"
}'
```

`dataType` must be one of the enum the 422 lists — `TEXT`, `LARGE_TEXT`,
`NUMERICAL`, `PHONE`, `MONETARY`, `CHECKBOX`, `SINGLE_OPTIONS`,
`MULTIPLE_OPTIONS`, `DATE`, `TEXTBOX_LIST`, `FILE_UPLOAD`, `RADIO`, and similar.
Probe with `{}` to have the API print the current valid list.

### Send a message (🔶 shape-verified)

```bash
curl -s -X POST "$BASE/conversations/messages" "${H[@]}" -d "{
  \"type\": \"SMS\",
  \"contactId\": \"...\",
  \"message\": \"Hello\"
}"
```

**This sends for real.** No dry-run mode.

---

## Bulk work

Respect **100 requests / 10 seconds**:

```bash
for id in "${ids[@]}"; do
  curl -s "$BASE/contacts/$id" "${H[@]}"
  sleep 0.11
done
```

Better: read `x-ratelimit-remaining` from each response and back off when it
approaches zero.

```bash
curl -s -D headers.txt -o body.json "$BASE/contacts/?locationId=$LOC" "${H[@]}"
grep -i x-ratelimit-remaining headers.txt
```

---

## Debugging

Every response carries a `traceId`. Include it when contacting GHL support —
it's the only thing that makes their logs searchable.

To discover a payload's required fields, POST `{}` and read the 422. GHL's
validation errors enumerate required fields and enum values, which is faster
and more current than the published docs.

---

## Bootstrapping a whole sub-account

Worth writing once as a small client + a declarative spec (fields, tags, users,
calendars, contacts) so re-runs are idempotent. Build in the rate limit and the
`User-Agent` trap from day one, then change only the spec per sub-account.

Order of operations that works (see SKILL.md "Creating a sub-account"):

1. `POST /locations/` with the **agency** PIT
2. Create a **location** PIT in the UI (agency token can't reach inside)
3. Custom fields + tags (API)
4. Users, then calendars (calendars need a `teamMembers[].userId`)
5. Pipelines — **UI only**, 8-stage cap per modal
6. Contacts + opportunities (API)
7. Trigger links (`POST /links/`) for any click-to-respond step
8. Workflows via **Build using AI**, refined in chat, left as drafts

### Create a user

```bash
curl -s -X POST "$BASE/users/" "${H[@]}" -d '{
  "companyId": "'"$COMPANY"'", "locationIds": ["'"$LOC"'"],
  "firstName": "…", "lastName": "…", "email": "…", "phone": "+1…",
  "type": "account", "role": "user", "password": "…",
  "permissions": {"contactsEnabled": true, "opportunitiesEnabled": true,
                  "conversationsEnabled": true, "appointmentsEnabled": true}
}'
```

`companyId` **and** `locationIds` are both required — the 422 only tells you
about one at a time.

### Create a calendar

Needs `locationId`, `name`, `calendarType: "event"`, a `slug`, slot durations,
`openHours`, and at least one `teamMembers: [{userId, priority: 1.0}]`. Create
users first.
