# GoHighLevel skills for Claude Code

Two skills that make Claude Code good at GoHighLevel (HighLevel, LeadConnector,
and white-labeled versions of it). Free, MIT.

Up to date as of **November 25, 2026**.

## What's in it

### `ghl`: the know-how
Claude reads it before it touches a sub-account.

- **Picks the fastest path that works.** The official MCP first, then the REST API,
  and the browser only as a last resort. HighLevel now has two MCP servers: the
  sign-in one (v2, about 700 actions) and the older token one (about 36 tools). The
  skill knows which to use and when the REST API is the better path.
- **Reads HighLevel's errors properly.** A `401 "version header was not found"` is a
  missing header, not a bad token. Four different 401 bodies mean four different fixes.
- **Safety rules for live accounts.** Never "test" an action endpoint with real IDs:
  enrolling a contact or sending a message actually runs.
- **Traps that cost real time**, each verified on a live account. Examples: a date wait
  whose date has passed also skips the next email; a booking 502 usually means the
  host's calendar is blocked; set duplicate appointments to Invalid rather than
  Cancelled; older workflows drop triggers added through the API; agency user
  permissions can be set with `PUT /users/{id}`.
- **Workflows API v3.** Read, validate, edit and publish workflows from code. It's a
  private beta that HighLevel Support switches on per sub-account; the skill probes
  first and has the verified edit sequence for live workflows.
- **HighLevel's own AI, as of today** (`references/ai-in-highlevel.md`). Conversation AI,
  Voice AI, Agent Studio, Managed Agents, the Workflow AI Builder and AI steps, Ask AI,
  AI Studio and Knowledge Base: what each does, what it costs, which API runs it.
  Every line has a source and a date.
- **Launch QA** for funnels, webinar offers and checkouts: copy match, coupon match,
  leftovers from the last launch, desktop and phone screenshots, a test purchase.

### `ghl-builder`: builds it for you
Describe a workflow or form in plain English. It writes a spec, builds it through
HighLevel's builder, then reads the saved result back and checks it matches what
you asked for. It also handles the custom fields and tags a build needs.

- Workflows are created as **Draft** unless you ask it to publish.
- It asks before writing to any sub-account that isn't your test (lab) sub-account.
- Where the Workflows API v3 is on, it uses that first.

## Install

As a Claude Code plugin:

```
/plugin marketplace add zakkonanz-creator/ghl-claude-skills
/plugin install ghl-claude-skills@ghl-claude-skills
```

Or copy the folders by hand:

```bash
git clone https://github.com/zakkonanz-creator/ghl-claude-skills
cp -R ghl-claude-skills/skills/ghl ~/.claude/skills/ghl
cp -R ghl-claude-skills/skills/ghl-builder ~/.claude/skills/ghl-builder
```

`ghl-builder` needs Node and Google Chrome, plus one setup run:

```bash
cd ~/.claude/skills/ghl-builder   # or the plugin's skills/ghl-builder folder
npm install
node scripts/setup.mjs            # checks Chrome, records your accounts, picks a lab sub-account
```

Restart Claude Code. Both skills load on their own when you ask for something
GoHighLevel-related.

## What you need

- A HighLevel sub-account you're allowed to work in.
- A **Private Integration Token** for it (sub-account Settings → Private Integrations)
  with the scopes your work needs, or the official MCP v2 connector signed in.
- Keep tokens out of chats, commits and screenshots.

## Ground rules

- Reads are free. Before any change on a live account, have Claude show you the plan.
- Published workflows send real email and SMS. Test on a draft (`Test workflow`) or a
  lab sub-account first.
- HighLevel ships weekly. If something here is out of date, open an issue or a PR with
  what you saw and the date.

## License

MIT. Not affiliated with HighLevel.
