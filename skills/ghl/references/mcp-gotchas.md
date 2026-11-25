# GHL MCP server — known bugs and limits

This file covers the **legacy** GHL MCP endpoint (`https://services.leadconnectorhq.com/mcp/`,
Private Integration Token). The newer sign-in endpoint (MCP v2, ~700 actions through four
discovery tools) is described in `ai-in-highlevel.md`. The legacy endpoint ships
roughly 36 tools across contacts, conversations, calendars, opportunities,
blogs, email templates, social posting, payments, and locations.

**It is a small subset of the v2 REST API.** When a tool is missing, check
`api-coverage.md` before assuming the platform can't do it.

## Config

```json
{
  "mcpServers": {
    "ghl": {
      "type": "http",
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer pit-...",
        "locationId": "..."
      }
    }
  }
}
```

The `locationId` is pinned in the header, so **one MCP server entry serves
exactly one sub-account.** To work across sub-accounts, use direct HTTP instead
— the API takes `locationId` per request.

---

## Verified bugs

### `social-media-posting_edit-post` is broken

Its schema declares `body_type` and `body_status` as `"type": "object"` when
they take strings. The string serializes unquoted and every call dies with a
client-side `InputValidationError` before reaching GHL. `create-post` declares
the same fields as `"type": "string"` and works.

**Workaround: create a new post — you cannot edit one.** No delete tool is
exposed either, and `edit-post`'s `status: deleted` is therefore unreachable.
**A post that needs changing or removing must be handled in the Social Planner
UI.** Say this to the user immediately when it comes up — a stale scheduled post
publishes on time regardless.

### Media `type` must be a MIME type

`"image"` → 422 `Invalid media format type`. `"image/jpeg"` works.

A **draft accepts the bad value silently** and only fails at publish time. A
draft that looks fine proves nothing.

### External media URLs work

Assets need not live in the GHL media library — only be publicly reachable.

### Draft posts misreport platform

A post created as a draft may report `platform: "google"`. Cosmetic; corrects
itself on publish.

### `userId` has no MCP source

The MCP exposes no users tool, so `userId` ends up set to the `locationId`, and
posts show `user: null` / `createdBy` = locationId.

**This is an MCP limitation, not an API one** — `GET /users/?locationId={loc}`
works fine over HTTP and returns real user IDs. Use it when a genuine `userId`
matters.

---

## Coverage gaps worth knowing

| MCP says | Reality |
|---|---|
| Calendars: read-only (events, notes) | API creates calendars **and** appointments |
| Opportunities: no create tool | `POST /opportunities/` works |
| No users tool | `GET /users/` works |
| No forms tools at all | API **reads** forms and submissions; writes are IAM-blocked |
| No workflow tools | API lists workflows and enrolls contacts |
| No funnel tools | API lists funnels (cannot create) |

## When to skip MCP entirely

Prefer direct HTTP when you need to:

- work across **multiple sub-accounts** in one session
- reach anything in the "no MCP equivalent" list in `api-coverage.md`
- **edit or delete a social post** (MCP cannot)
- see real error bodies — MCP wrapping can obscure GHL's diagnostic messages,
  which are the key to the error decoder in SKILL.md
