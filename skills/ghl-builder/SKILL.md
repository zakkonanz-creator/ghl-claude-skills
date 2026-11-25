---
name: ghl-builder
description: Build, verify, and repair things inside a GoHighLevel sub-account from natural-language requests, through the builder's own API and proven by extraction diff and render check. Covers WORKFLOWS ("create a GHL workflow", "set up this automation", trigger and action requirements, draft or publish), FORMS ("build a GHL form", URL-parameter capture, conditional show or hide, custom JS, mapping to contact custom fields; see references/form-building.md), and the CUSTOM FIELDS and TAGS a build depends on (registry sync, missing-asset creation). Use for any request to build or change automation, forms, or fields in a HighLevel account.
---

# GHL Builder

Turn the request into a reviewed JSON spec, build it through the repository engine, prove the persisted workflow matches, and report the result. Keep all workflows in Draft unless the user explicitly requests publishing.

## First: use the official Workflows API v3 when it's enabled

For workflows, try HighLevel's public Workflows API (`Version: v3`: step types, validate, create, read definition, update, publish, logs) before this engine. It's a private beta, enabled per location by HighLevel Support, so most locations don't have it. Probe the target location read-only first, with a sub-account Private Integration Token (`$PIT`) that has the workflows scopes:

```bash
curl -s -H "Authorization: Bearer $PIT" -H "Version: v3" "https://services.leadconnectorhq.com/workflows/step-types?locationId=$LOCATION_ID" | head -c 300
```

- `200`: build through v3. Use step types plus an existing workflow's `GET /definition` as the template → `POST /workflows/definition/validate` → create as draft → verify by `GET /workflows/{id}/definition`. Connections are `edges` (`from`/`to`/`branch`). Keep `locationId` in the query string, including on POSTs. Publishing still needs explicit permission. To edit a published workflow: set it to draft, edit, then publish again; each status change bumps `definition.version`, so re-read it. Details: [references/workflows-api-v3.md](references/workflows-api-v3.md).
- `403 WORKFLOW_API_NOT_ENABLED_FOR_LOCATION`, or v3 can't express the build: use this engine as below, and note the gap in the reference.
- Forms, custom fields and tags aren't part of v3. Use this engine for those.

## Resolve the runtime

Set the skill root for every command. The skill folder holds the engine (`scripts/`), the references, and the research corpus. Use the base directory Claude Code reports for this skill (plugin install), or set `GHL_BUILDER_REPO` to the folder if you installed it by hand.

```bash
REPO="${GHL_BUILDER_REPO:-<this skill's base directory>}"   # the skill folder IS the engine
LOCATION_ID="${GHL_BUILDER_LOCATION_ID:-}"
test -f "$REPO/scripts/build-workflow.mjs"
test -f "$REPO/scripts/verify-build.mjs"
test -f "$REPO/scripts/repair-workflow.mjs"
test -f "$REPO/scripts/reload-render.mjs"
```

If any check fails, locate the skill folder and set `GHL_BUILDER_REPO` to its absolute path. Do not copy or run stale scripts from another location.

Set `LOCATION_ID` from the request. Every CLI accepts `--location <id>`; when it is omitted the scripts fall back to the configured lab, and fail if there is none. Do not silently use the lab when another location was requested.

The machine's account mapping lives in `~/.config/ghl-builder/config.json`, written by `node "$REPO/scripts/setup.mjs"`. List it and confirm the location is present:

```bash
node "$REPO/scripts/switch-agency.mjs" --list   # accounts -> appOrigin + locations; the engine resolves the origin itself
```

The runtime fetches the target location and company from the authenticated session, derives the acting user/company, and rejects any company mismatch; it never reuses lab constants. If the location is absent from the mapping, stop and tell the user to re-run `setup.mjs` with it. Do not guess an agency, read Keychain, or add credentials here.

## Execute the workflow

### 1. Parse the request

Extract:

- target account and location ID;
- workflow name and optional folder;
- one or more triggers and filters;
- ordered actions, waits, branches, and fallback behavior;
- referenced tags, users, pipelines/stages, custom fields, templates, or workflows;
- publish intent.

Default `publish` to `false`. Never infer permission to publish. Publishing activates triggers and premium actions may incur execution charges.

Read [references/spec-format.md](references/spec-format.md) before authoring a spec. For any trigger or action not demonstrated there, read [references/action-map.md](references/action-map.md) and the named Phase 1 reference before choosing its type or payload.

### 1b. Sync the account registry and read the do-not-build list

**Do this before drafting the spec, not during the build.** The plan must already state each custom field's type and its chosen value. Discovering a field's type by writing to it and seeing what happens is the exact failure this step removes: the platform accepts a wrong-shaped write silently, so the defect survives to run time.

```bash
node "$REPO/scripts/sync-account-registry.mjs" --location "$LOCATION_ID"
# add --print to dump everything, or --token <pit> to skip the browser
```

That writes `registry/<locationId>.json` with two sections:

- **`customFields`**: every custom contact field with its folder, `dataType`, and valid `options`
- **`customValues`**: every custom value with its **current value** and a `filled` flag, so you can see what this account is already configured with and what is still blank

There are three kinds of field, and only the third is per account:

| kind | where | example |
| --- | --- | --- |
| global contact fields | `registry/global-fields.json` → `contactFields` | `{{contact.name}}` is Full Name |
| global system fields | `registry/global-fields.json` → `systemFields` | `{{appointment.start_time}}`, `{{calendar.name}}`, `{{user.email}}` |
| custom contact fields and custom values | `registry/<locationId>.json` | `{{contact.referral_quality_flag}}`, `{{custom_values.business_name}}` |

Write the plan from the `dataType`:

| dataType | how the plan must write it |
| --- | --- |
| `SINGLE_OPTIONS`, `RADIO` | select an option from `options`, never free text |
| `CHECKBOX` | `true` / `false`; in a condition use Includes plus true, never `is_checked` |
| `DATE` | an explicit value, usually Current Date. Empty is a real saved state, not a default |
| `NUMERICAL` | digits only |
| `TEXT`, `LARGE_TEXT` | free text, but a field reference inside it must be picked, not typed |

Then read `registry/do-not-build.json`. Those are judgment rules rather than shapes: machinery that should not be built at all, such as counting SMS characters, or an add-to-workflow step whose target already triggers on a tag you apply.

### 1c. Gate the spec before building

```bash
node "$REPO/scripts/validate-fields.mjs" --spec "$REPO/docs/temp/test/<spec>.json" --location "$LOCATION_ID"
```

Exit `0` is required to proceed. The gate blocks on disproven fields, unknown fields, wrong-shaped writes to typed fields, and `severity: block` do-not-build rules; it prints advisories for the rest.

**An unknown field blocks the build.** Either the reference is wrong or the field has not been created yet. To prove a genuinely new one, put it in a note on a scratch workflow, run one contact through, and read back whether it resolved. Add it to the registry **with its evidence**. Never add one because it looks plausible: that is exactly how `{{contact.full_name}}` reached production nine times, and how `{{right_now.date}}` reached three workflows.

### 2. Draft the spec

Write the spec under `$REPO/docs/temp/test/` with a descriptive filename. Use only names and IDs appropriate to the target location. For lab work, prefix workflow names `ZZZ-SPIKE-` and fixture names `zzz-spike-`.

### 3. Confirm non-lab writes

For the configured lab location (`labLocationId` in `config.json`; `node "$REPO/scripts/switch-agency.mjs" --list` does not show it, read the file), proceed without asking for confirmation. When no lab is configured, every location is non-lab.

For every non-lab location, show the complete JSON spec and summarize the intended trigger, actions, Draft/publish state, and any premium/billed items. Obtain explicit user confirmation before any write. A request to build does not waive this confirmation gate.

### 4. Authenticate and coordinate Chrome

The engine needs an authenticated tab in the debug Chrome on port `9222`. Use Playwright only; do not drive this tab with browser-extension tools. Before any authenticated catalog read, run the session check:

```bash
node "$REPO/scripts/switch-agency.mjs" --location "$LOCATION_ID"
```

It resolves in this order and reports a `status`:

1. An already-authenticated tab on the account's origin -> `authenticated`. Proceed.
2. No such tab, and the `ghl-login` skill is installed on this machine -> it logs in. `awaiting_2fa` means: ask the user for the fresh 2FA code (or use whatever retrieval flow their `ghl-login` skill documents), then submit only that code:

```bash
node "$REPO/scripts/switch-agency.mjs" --location "$LOCATION_ID" --code "<fresh-code>"
```

3. No such tab and no `ghl-login` -> `manual_login_required` with a `message` (exit 1). Show the message verbatim: the user opens the login URL in the debug Chrome, logs in, and you re-run the check. Never type credentials or drive the login form yourself.

Require `status: authenticated`, then proceed. `ghl-login`, when present, remains the sole credential owner. Do not retain a password, OTP, email address, Keychain identifier, or lab-derived company metadata in the repository. The complete non-lab spec confirmation in step 3 is still required before any workflow or missing-asset write; switching agencies does not waive it.

Set a unique tab owner for the session:

```bash
export GHL_AGENT_OWNER="ghl-builder-$(date +%s)-$$"
# Playwright resolves to $REPO/node_modules (npm install); PLAYWRIGHT_PATH only overrides it.
```

Use one owned tab. Do not navigate or close another agent's tab. The repository client serializes access through `research/phase2/.cdp-lock`; a visible lock wait is expected, not a failure. If `research/phase2/.cdp-priority` exists for another owner, wait until it is removed.

Read [references/troubleshooting.md](references/troubleshooting.md) before changing Chrome state or reacting to CDP/navigation failures.

### 5. Dry-run and recover missing assets

Dry-run performs authenticated location-catalog reads for tags, folders, branches, and lookup-backed actions, so run it only after Chrome and the owner environment are ready:

```bash
node "$REPO/scripts/build-workflow.mjs" \
  --spec "$REPO/docs/temp/test/<spec>.json" \
  --location "$LOCATION_ID" \
  --app-origin "$APP_ORIGIN" \
  --dry-run
```

If validation rejects an explicitly requested nonexistent tag or asset:

1. Surface the exact missing asset and do not substitute another value.
2. In the lab, proceed with creating the correctly prefixed fixture. In a non-lab location, obtain explicit user consent for that asset write even if the workflow spec was already confirmed.
3. For a missing tag, use the documented `POST /locations/{locationId}/tags` flow through the guarded helper:

   ```bash
   node "$REPO/scripts/ensure-tag.mjs" \
     --name "<requested-tag>" \
     --location "$LOCATION_ID" \
     --app-origin "$APP_ORIGIN"
   ```

4. Re-run the same dry-run and require it to pass before building.

For schema, ambiguity, or unsupported-structure errors, fix the spec or implementation; do not create unrelated assets or bypass validation.

### 6. Build in Draft

Run the real build only after the dry build passes and any required confirmation is obtained:

```bash
node "$REPO/scripts/build-workflow.mjs" \
  --spec "$REPO/docs/temp/test/<spec>.json" \
  --location "$LOCATION_ID" \
  --app-origin "$APP_ORIGIN"
```

Capture the returned `workflowId` and build-log path. Do not claim success from the create response alone.

### 7. Verify extraction

Run the independent verifier from a fresh command:

```bash
node "$REPO/scripts/verify-build.mjs" \
  --spec "$REPO/docs/temp/test/<spec>.json" \
  --workflow "<workflow-id>" \
  --location "$LOCATION_ID" \
  --app-origin "$APP_ORIGIN"
```

Exit `0` and `PASS` are required. The verifier is independent of the composer and checks workflow name/status, triggers, attributes, and topology.

### 8. Repair drift

If verification reports drift, run the bounded repair loop, then run the verifier again:

```bash
node "$REPO/scripts/repair-workflow.mjs" \
  --spec "$REPO/docs/temp/test/<spec>.json" \
  --workflow "<workflow-id>" \
  --location "$LOCATION_ID" \
  --app-origin "$APP_ORIGIN" \
  --max-retries 3
```

Repair never publishes. Exit `2` means the case is unrepairable or retries were exhausted; report the mismatch and log path instead of looping manually.

### 9. Verify rendered labels

Choose labels that uniquely represent the trigger and every important action/branch. Pass each label separately:

```bash
node "$REPO/scripts/reload-render.mjs" \
  --workflow "<workflow-id>" \
  --location "$LOCATION_ID" \
  --app-origin "$APP_ORIGIN" \
  --expect "<trigger label>" \
  --expect "<action label>"
```

Require exit `0`. This check uses the singular builder route and waits up to 60 seconds for the real workflow iframe and canvas labels.

### 10. Report

Return:

- workflow name, ID, and Draft/published state;
- builder link: `<app-origin>/v2/location/<location-id>/automation/workflow/<workflow-id>`;
- spec and build/repair log paths;
- extraction verification result and mismatch count;
- reload-render result and labels checked;
- any premium/billing warning;
- any unresolved limitation or unrepairable mismatch.

Do not say the workflow is complete unless both extraction verification and reload-render pass.

## Publish policy

Never publish unless the user explicitly asks to publish that workflow. Before publishing, warn that publishing activates triggers and premium actions may create billed executions. Publish only through the engine's `setPublished` path in `scripts/lib/build.mjs` (status plus trigger activation, then read-back); never improvise a publish request.

## References

- Read [references/spec-format.md](references/spec-format.md) for schema rules and worked specs.
- Read [references/action-map.md](references/action-map.md) for verified payload discovery, ID/name rules, premium checks, and map-on-demand boundaries.
- Read [references/troubleshooting.md](references/troubleshooting.md) for CDP, Chrome, routing, save, and full-document PUT recovery.
- Read [references/form-building.md](references/form-building.md) **before building or editing a FORM. Read it in full before writing any code, not while debugging.** Forms are a different subsystem from workflows but the same API-first shape: a form is one JSON document saved by a single full-document `POST services.leadconnectorhq.com/forms/{id}`. Covers creating a form from scratch, the internal API, document schema, verified field shapes (custom fields, choice, date, address), a capability table, recipes (URL-parameter capture, conditional show/hide, custom JS, mapping to existing custom fields, viewing submissions), Playwright selectors, and the traps. **Three of its sections each cost a previous build an hour or more: §5.9 (`custom: true` silently blocks every save), §5.10 (how to actually confirm a save; the Save button's state is NOT a signal), and §8.1 (false negatives that make a working form look broken).**

## Installation

This skill ships in the `ghl-claude-skills` Claude Code plugin (github.com/zakkonanz-creator/ghl-claude-skills, folder `skills/ghl-builder`). After installing the plugin, run once inside the skill folder:

```bash
npm install            # Playwright only; no browsers are downloaded
node scripts/setup.mjs # checks Chrome, records your accounts, picks an optional lab
```

Full walkthrough, including the debug Chrome and your own Private Integration Token: [docs/SETUP.md](docs/SETUP.md).
