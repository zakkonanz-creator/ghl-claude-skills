# GHL Builder

Builds, verifies, and repairs things inside a GoHighLevel sub-account from natural-language requests: workflows, forms, and the custom fields and tags they depend on. Work goes through the builder's own API, then gets proven by an independent extraction diff (triggers, attributes, topology) and a render check, with a bounded repair loop. Where HighLevel's public Workflows API v3 is enabled for a location (private beta), the skill uses that first.

Workflows are created as Draft unless you ask for something else. Every write outside your configured lab sub-account asks for confirmation first.

## Install

This skill ships inside the `ghl-claude-skills` Claude Code plugin: [github.com/zakkonanz-creator/ghl-claude-skills](https://github.com/zakkonanz-creator/ghl-claude-skills), folder `skills/ghl-builder`.

1. Install the plugin in Claude Code (or clone the repo and point Claude Code at it).
2. In this skill folder, install the engine's one dependency and run setup:

```bash
cd <plugin folder>/skills/ghl-builder
npm install              # Playwright only; no browsers are downloaded
node scripts/setup.mjs   # checks Chrome, records your accounts, picks an optional lab
```

Full walkthrough in [docs/SETUP.md](docs/SETUP.md).

You bring your own access: a HighLevel login with access to the sub-account you build in, and (for the v3 API path) a sub-account Private Integration Token with the workflows scopes. Nothing in this repo points at any real account.

Then ask Claude Code: "build a workflow on <sub-account> that tags new contacts and sends a welcome email".

## Layout

| Path | What |
|---|---|
| `SKILL.md` | The procedure Claude follows |
| `references/` | Spec format, action map, form building, troubleshooting, Workflows API v3 |
| `scripts/` | The engine: `build-workflow`, `verify-build`, `repair-workflow`, `reload-render`, `read-workflow`, `setup`, plus registry sync and field validation |
| `research/phase1/raw/` | Verified trigger and action reference files, one per native node, each with a machine-checkable JSON block. IDs in them are placeholders |
| `research/phase1/SHARED-KNOWLEDGE.md` | The platform rules the engine is built on |
| `form-builder/scripts/` | Form helpers (see `references/form-building.md`) |
| `registry/` | Shared field knowledge and the do-not-build rules; per-account registries are synced locally and git-ignored |

## Requirements

- macOS (the Chrome launch command assumes it; other platforms need their own Chrome path), Node 20+
- Google Chrome, launched with remote debugging (`setup.mjs` prints the command) and logged in to your HighLevel app
- A user on the agency whose sub-accounts you build in

## Safety

- Workflows are built as Draft. Publishing only happens when you ask for it by name, after a warning that it activates triggers and may bill premium actions.
- Builds in any sub-account other than your configured lab show the full spec and wait for your yes.
- The engine never stores passwords, 2FA codes or tokens. You log in yourself in the debug Chrome.

This project is not affiliated with or endorsed by HighLevel. It uses internal builder endpoints that can change without notice.
