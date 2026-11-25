# Workflows API v3 (public, private beta)

HighLevel has a public API for workflows: create, read the full definition,
edit, publish, delete, and read execution logs. It is a private beta, switched on
per location (sub-account) by HighLevel Support. Most locations do not have it yet.

**Probe first, then use it if it's on.** If the location is enabled, workflow reads,
builds and edits can go through v3. Fall back to the ghl-builder engine, then the UI,
only when the probe says not enabled or v3 can't express what's needed (record the
gap here).

Not enabled = `403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION` ("not a token or scope
problem"). Re-minting a Private Integration Token won't fix it; only HighLevel
Support can turn it on.

## Probe first, every time (read-only)

```bash
curl -s -H "Authorization: Bearer $PIT" -H "Version: v3" \
  "https://services.leadconnectorhq.com/workflows/step-types?locationId=$LOC" | head -c 300
```

- `200` with step types: use v3 for this location.
- `401` / scope error: enabled, but the token lacks the scope; mint a sub-account
  Private Integration Token with the scopes below.
- `403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION`: not enabled; use the ghl-builder engine,
  else the UI, and say v3 isn't enabled there.

## Basics

- Host `services.leadconnectorhq.com`, header **`Version: v3`** (not `2021-07-28`),
  **`locationId` as a query param on every call**, including POSTs (in the body
  only gives `422 locationId is required`). Sub-account token only (PIT or OAuth).
- Scopes: `workflows.readonly` (view + step types), `workflows.write` (create,
  validate, edit), `workflows.publish` (publish / back to draft), `workflows.delete`,
  `workflows.logs`.

| Function | Call |
|---|---|
| Step types (triggers + actions + required props) | `GET /workflows/step-types` (paged: `total`, `count`, `skip`; several hundred entries) |
| Validate a definition (writes nothing) | `POST /workflows/definition/validate` returns `{valid, errors, warnings}` |
| Search workflows | `POST /workflows/search` body `{limit, offset, ...}` |
| Create (always **draft**) | `POST /workflows/` |
| Read full definition | `GET /workflows/{id}/definition` |
| Update definition (version-checked) | `PUT /workflows/{id}/definition` |
| Publish / draft | `PUT /workflows/{id}/status` |
| Delete | `DELETE /workflows/{id}` |
| Execution logs / stats | `GET /workflows/{id}/logs`, `/logs/aggregate` (status counts) |

## Definition shape

`GET /definition` returns `{workflowId, status, definition}`; `definition` keys:
`version`, `name`, `source`, `triggers[]`, `triggerRelation` (`"or"`), `actions[]`,
**`edges[]`**, `settings`, `folderPath`.

- Action: `{id, type, name, attributes}` (e.g. `type: "add_notes"`, `attributes.html`).
- **Connections are `edges`**, not fields on the action: `{from: <actionId>, to: <actionId>}`,
  plus `branch: <branchId>` for an if/else path.
- Validate/create require `triggers`, `actions` **and `edges`** keys, even when empty
  (missing `edges` gives `422 edges is required`). Minimal valid body:
  `{"name":"...","source":{"system":"claude"},"triggers":[],"actions":[],"edges":[]}`.
- The definition is validated in full before anything is saved, so a rejected create
  leaves nothing behind.

Best template: `GET /definition` on an existing workflow that already does what you
want, and copy its action `attributes`.

Docs: https://marketplace.gohighlevel.com/docs/ghl/workflows/create-workflow/index.html ·
help article https://help.gohighlevel.com/support/solutions/articles/155000009502

## Rules

1. `GET step-types` (and/or an existing workflow's definition), then build from that,
   never from memory.
2. `POST /definition/validate` before every create or update; fix every error.
3. Create lands in draft. **Publishing needs explicit approval from the account owner**
   (published workflows send real email/SMS). Publish = `PUT /status`.
4. Update: `GET /definition` first, edit that, send it back with its `version`; a
   version conflict means someone edited in the builder, so re-read and merge, never force.
5. Verify after writing: `GET /definition` and diff against what you sent.
6. Still unknown: whether the trigger-bucket bug (older workflows with
   `isTriggerBucketMigrated` dropping triggers added through the builder API) also
   hits v3 trigger edits. Read the definition back after any trigger change. Record what you learn here.

## Editing a live (published) workflow

- `PUT /definition` on a **published** workflow is refused: "Workflow is published. Set it
  to draft before editing". Sequence: `PUT /status {"status":"draft"}`, then
  `PUT /definition`, then `PUT /status {"status":"published"}`.
- Every status change bumps `definition.version`, so re-read the version AFTER setting
  draft (or retry with the `version` the "outdated" error returns). Keep the draft window
  short: triggers don't fire while it's draft.
- `remove_from_workflow` validation fails with `ASSET_WORKFLOW_NOT_FOUND` for deleted
  workflow ids copied from old workflows; drop those ids.
- Warnings like "keys not in schema are not persisted: htmlDefaults, conditions" on
  existing email steps were empty values; diff email `html` before/after to be sure.

## Rate limits

- Reading several hundred definitions at about 0.2 s spacing ran without 429s.
- `GET /logs/aggregate` is the bottleneck: it returns 429 after a few calls and managed
  about one call per minute, so pull run stats as a slow background job.
- `POST /workflows/search` can list an id whose definition returns 404; skip it and note it.
