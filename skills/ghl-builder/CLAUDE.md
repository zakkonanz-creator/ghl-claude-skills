---
type: guide
status: active
tags: [ghl, ghl-builder, engine]
relatedTo: [docs/SETUP.md, research/phase1/SHARED-KNOWLEDGE.md]
---
# CLAUDE.md

Guidance for Claude Code when editing the ghl-builder skill itself. This file covers only what is specific to the engine.

## What this is

An engine that turns a JSON spec into a GoHighLevel workflow (or form), built through the builder's internal API and then proven by extraction diff plus render check, with a bounded self-repair loop. `SKILL.md` is the procedure Claude follows; `scripts/` is the engine it runs.

Plain Node ESM (`.mjs`), no build step, no test framework. `npm install` inside this folder fetches Playwright only; everything attaches to the user's Chrome over CDP, so no browsers are downloaded.

## The core insight (read before changing the engine)

The builder writes workflows via replayable JSON on `backend.leadconnectorhq.com`, so this project is API-first, not UI-driving:

- `POST /workflow/{loc}` create. `POST /workflow/{loc}/trigger` add trigger. `PUT /workflow/{loc}/{id}` saves the FULL document; a partial body returns HTTP 422, so always GET, modify, PUT the whole doc.
- Publish means `status:"published"` PLUS `triggersChanged:true` and `newTriggers` with each trigger `active` flipped. Status alone leaves a published workflow whose triggers never fire (`scripts/lib/build.mjs:setPublished`).
- The API is CORS-locked to the builder iframe origin, so all fetches run inside the page over CDP (Playwright `connectOverCDP` to a debug Chrome on `:9222`), using the app's sniffed Bearer plus `source: WEB_USER`, `channel: APP`.
- The builder URL is singular: `/automation/workflow/{id}`. The plural shows the list page and never spawns the iframe.

## Pipeline

`spec.json` to compose, build, verify, repair, render-check. Each stage is a separate process on purpose; the verifier must never trust the composer.

| Stage | Entry point |
|---|---|
| Validate and compose | `scripts/lib/compose.mjs` |
| Resolve names to IDs | `scripts/lib/resolve.mjs`, `scripts/lib/location.mjs` |
| Build | `scripts/build-workflow.mjs` and `scripts/lib/build.mjs` (log to `research/phase2/builds/`) |
| Verify | `scripts/verify-build.mjs`: name and status, triggers, attributes, topology |
| Repair | `scripts/repair-workflow.mjs`: bounded; exit `2` means unrepairable |
| Render check | `scripts/reload-render.mjs` |
| Smoke test | `scripts/regression-check.mjs` (needs a lab) |

Two composition rules that are easy to get wrong:

- `if_else` is a four-node family: a `condition-node` parent, one `branch-yes` child per branch, and a final `branch-no` "None" child. The ELSE is the last id in the parent's `next[]`.
- Rendering requires both sides of every edge: predecessor `next:<childId>` and child `parentKey:<predecessorId>`. A doc with only `parentKey` persists and extracts byte-identically yet renders as root-then-END. Verification asserts topology for this reason.

Names versus IDs vary per field: by name for tags; by ID for workflows, pipeline and stage, custom fields, users, templates. Authoritative table: `research/phase1/SHARED-KNOWLEDGE.md`.

## Per-machine configuration

`scripts/lib/config.mjs` reads `~/.config/ghl-builder/config.json` (override with `GHL_BUILDER_CONFIG`), written by `node scripts/setup.mjs`:

- `accounts`: `{ key: { account, loginUrl, appOrigin, locations[] } }`. The engine resolves a location's origin from here; nothing defaults to a white-label domain.
- `labLocationId`: optional. The one sub-account where builds skip confirmation. Absent means every build confirms.
- `playwrightPath`: optional override; the default is this folder's `node_modules/playwright`.

Login resolution (`scripts/lib/agency.mjs:switchAgency`): an authenticated tab on the origin, else the `ghl-login` skill if installed (`~/.claude/skills/ghl-login`, `~/.agents/skills/ghl-login`, or `GHL_LOGIN_SCRIPT`), else `manual_login_required`. Never add credentials, Keychain reads, or 2FA handling here.

Do not reintroduce absolute paths under `/Users/` anywhere in `scripts/`, `references/`, or `form-builder/`.

## Commands

All commands need an authenticated session in the debug Chrome on `:9222`; `--dry-run` still performs catalog reads.

```bash
export GHL_AGENT_OWNER="ghl-builder-$(date +%s)-$$"   # required: your tab claim

node scripts/setup.mjs                                                 # first run, or to add accounts
node scripts/switch-agency.mjs   --list | --location <id> [--code <otp>]
node scripts/build-workflow.mjs  --spec <spec.json> --location <id> --dry-run
node scripts/build-workflow.mjs  --spec <spec.json> --location <id>
node scripts/verify-build.mjs    --spec <spec.json> --workflow <id> --location <id>
node scripts/repair-workflow.mjs --spec <spec.json> --workflow <id> --location <id> --max-retries 3
node scripts/reload-render.mjs   --workflow <id> --location <id> --expect "<label>"
node scripts/read-workflow.mjs   --workflow <id> --location <id>
node scripts/list-location-assets.mjs --location <id>
node scripts/ensure-tag.mjs      --name <tag> --location <id>
```

`--location` falls back to the configured lab and errors when there is none. Exit `0` is the only success. Verification failure is reported, never worked around.

Running a single case: put a spec in `docs/temp/test/` (git-ignored), run `build-workflow.mjs --dry-run`, build, then `verify-build.mjs`. `research/phase5/regression-spec.json` and the worked specs in `references/spec-format.md` make good fixtures.

## Chrome and CDP coordination

- Access is serialized through `research/phase2/.cdp-lock`; a visible wait is normal. `.cdp-priority` lets one owner preempt.
- Each agent owns exactly one tab, claimed via `GHL_AGENT_OWNER` and stamped into `window.name`. Never navigate or close another owner's tab, or any tab with in-flight edits.
- `connectOverCDP` hangs if any tab has a dead renderer; `ghl-client.mjs:preflightCdp` probes per target and closes dead ones.
- If all new tab navigations hang browser-wide, Chrome auto-updated under the running instance. Restart the debug Chrome; the profile keeps the login.
- More in `references/troubleshooting.md`.

## Safety rules (enforced in code)

- Draft by default. `publish` defaults to `false` and is never inferred.
- Only the lab skips confirmation. Everything in the lab is named `ZZZ-SPIKE-*` or `zzz-spike-*` (enforced); nothing pre-existing is modified or deleted.
- Non-lab writes require explicit user confirmation (skill step 3).
- The skill-local `.gitignore` blocks raw network captures and `*.har`; they contain live bearer JWTs.

## Reference material

- `research/phase1/SHARED-KNOWLEDGE.md`: read before touching compose or verify.
- `research/phase1/raw/{actions,triggers}/*.md`: one file per native node with a `## Verified JSON` block. Check here before guessing any payload shape. `research/phase1/verify/verify-item.mjs --doc <file>` validates one.
- `references/spec-format.md` for the spec schema; `scripts/spec.schema.json` is the machine version.
- `references/action-map.md` for payload discovery, premium and billing flags, ID versus name rules.

## Conventions

- Node ESM only, no TypeScript. Two-space indent, single quotes, semicolons, arrow functions, `async`/`await`.
- CLI flags are parsed by a tiny local `argument(name)` helper in each script; no arg-parsing library.
- Comments are sparse, reserved for non-obvious platform behavior.
