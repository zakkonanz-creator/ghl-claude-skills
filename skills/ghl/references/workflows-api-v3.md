# Workflows API v3 (public, private beta), checked 2026-11-25

HighLevel has a real public API for workflows: create, read the full definition,
edit, publish, delete, and read execution logs. It is switched on per sub-account
or agency by HighLevel Support.

**Use it first.** If the location is enabled, every workflow read, build and edit
goes through v3. Fall back to the ghl-builder engine, then the UI, only when the
probe says not enabled or v3 can't express what's needed (record the gap here).

## Is it on for your location?

It's a private beta. HighLevel Support switches it on per sub-account or agency, so
ask them if the probe below says it's off.

Not enabled = `403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION` ("not a token or scope
problem"). Re-minting a PIT won't fix it; only HighLevel Support can.

## Probe first, every time (read-only)

```bash
curl -s -H "Authorization: Bearer $PIT" -H "Version: v3" \
  "https://services.leadconnectorhq.com/workflows/step-types?locationId=$LOC" | head -c 300
```

- `200` with step types → use v3 for this location.
- `401` / scope error → enabled, but the PIT lacks the scope; mint a sub-account PIT
  with the scopes below.
- `403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION` → not enabled; use ghl-builder engine,
  else the UI, and say v3 isn't enabled there.

## Basics

- Host `services.leadconnectorhq.com`, header **`Version: v3`** (not `2021-07-28`),
  **`locationId` as a query param on every call**, including POSTs (in the body
  only → `422 locationId is required`). Sub-account token only (PIT or OAuth).
- Scopes: `workflows.readonly` (view + step types), `workflows.write` (create,
  validate, edit), `workflows.publish` (publish / back to draft), `workflows.delete`,
  `workflows.logs`.

| Function | Call |
|---|---|
| Step types (triggers + actions + required props) | `GET /workflows/step-types` (paged: `total`, `count`, `skip`; ~700 step types seen in Nov 2026) |
| Validate a definition (writes nothing) | `POST /workflows/definition/validate` → `{valid, errors, warnings}` |
| Search workflows | `POST /workflows/search` body `{limit, offset, …}` |
| Create (always **draft**) | `POST /workflows/` |
| Read full definition | `GET /workflows/{id}/definition` |
| Update definition (version-checked) | `PUT /workflows/{id}/definition` |
| Publish / draft | `PUT /workflows/{id}/status` |
| Delete | `DELETE /workflows/{id}` |
| Execution logs / stats | `GET /workflows/{id}/logs`, `/logs/aggregate` (status counts) |

## Definition shape (seen live 2026-11-23)

`GET /definition` returns `{workflowId, status, definition}`; `definition` keys:
`version`, `name`, `source`, `triggers[]`, `triggerRelation` (`"or"`), `actions[]`,
**`edges[]`**, `settings`, `folderPath`.

- Action: `{id, type, name, attributes}` (e.g. `type: "add_notes"`, `attributes.html`).
- **Connections are `edges`**, not fields on the action: `{from: <actionId>, to: <actionId>}`,
  plus `branch: <branchId>` for an if/else path.
- Validate/create require `triggers`, `actions` **and `edges`** keys, even when empty
  (missing `edges` → `422 edges is required`). Minimal valid body:
  `{"name":"…","source":{"system":"claude"},"triggers":[],"actions":[],"edges":[]}`.
- The definition is validated in full before anything is saved, so a rejected create
  leaves nothing behind.

Best template: `GET /definition` on an existing workflow that already does what you
want, and copy its action `attributes`.

Docs: https://marketplace.gohighlevel.com/docs/ghl/workflows/create-workflow/index.html ·
help article https://help.gohighlevel.com/support/solutions/articles/155000009502

## Rules

1. `GET step-types` (and/or an existing workflow's definition) → build from that,
   never from memory.
2. `POST /definition/validate` before every create or update; fix every error.
3. Create lands in draft. **Publishing needs explicit approval from the account owner** (published
   workflows send real email/SMS). Publish = `PUT /status`.
4. Update: `GET /definition` first, edit that, send it back with its `version`; a
   version conflict means someone edited in the builder, so re-read and merge, never force.
5. Verify after writing: `GET /definition` and diff against what you sent.
6. Anything you publish sends real email/SMS. Put it on whatever monitoring you have (a daily check of its execution logs at minimum).
7. Still unknown: whether the trigger-bucket bug (older workflows with
   `isTriggerBucketMigrated` dropping triggers added through the builder API) also
   hits v3 trigger edits. Read the definition back after any trigger change. Record what you learn here.

## Learned 2026-11-24 (editing a live workflow)
- `PUT /definition` on a **published** workflow is refused: "Workflow is published. Set it to draft before editing". Sequence: `PUT /status {"status":"draft"}` → `PUT /definition` → `PUT /status {"status":"published"}`. **Publish works with a sub-account PIT that has `workflows.publish`.**
- Every status change bumps `definition.version`, so re-read the version AFTER setting draft (or retry with the `version` the "outdated" error returns). Keep the draft window short: triggers don't fire while it's draft.
- `remove_from_workflow` validation fails with `ASSET_WORKFLOW_NOT_FOUND` for deleted workflow ids copied from old workflows; drop those ids.
- Warnings like "keys not in schema are not persisted: htmlDefaults, conditions" on existing email steps were empty values; diff email `html` before/after to be sure.
- **Rate:** reading all ~580 definitions took ~3 min at 0.2 s spacing with no 429s. `GET /logs/aggregate` is the bottleneck: it 429s after a few calls and managed ~1/min, so pull run stats as a slow background job. `POST /workflows/search` listed one id whose definition 404s; skip and note it.

## Official docs (help article last modified 2026-10-30)
- All 10 endpoints were added to the public changelog on 2026-10-19.
- Rate limits per sub-account: reads 30/10s, writes 10/10s, logs 20/10s and 60/min,
  log stats 5/10s, 10/min, 1,000/day. This matches what we saw (`/logs/aggregate`
  429s quickly).
- Logs cover ranges up to 30 days over 60 days of history. You can't add or remove
  contacts here; use the Contacts API.
- A definition PUT replaces the whole definition, so always start from a fresh GET.
- Help article: https://help.gohighlevel.com/support/solutions/articles/155000009502
