# Setup

One-time install on a Mac. About ten minutes, most of it `npm install`.

## 1. Prerequisites

- Node 20 or newer: `node --version`. Install from nodejs.org or `brew install node` if missing.
- Google Chrome at `/Applications/Google Chrome.app`.
- Claude Code installed and working.
- Your own HighLevel login with access to the sub-accounts you will build in.
- Optional, for the Workflows API v3 path: a sub-account Private Integration Token (Settings, Private Integrations) with the `workflows.*` scopes. v3 is a private beta that HighLevel Support enables per location, so it may not work for you yet; the engine covers everything without it.

## 2. Install the plugin and the engine dependency

The skill ships in the `ghl-claude-skills` plugin: github.com/zakkonanz-creator/ghl-claude-skills, folder `skills/ghl-builder`. Install the plugin in Claude Code, or clone the repo:

```bash
git clone https://github.com/zakkonanz-creator/ghl-claude-skills.git
cd ghl-claude-skills/skills/ghl-builder
npm install
```

`npm install` fetches Playwright only. No browsers are downloaded; the engine attaches to your own Chrome. If you install the plugin through Claude Code, run `npm install` inside the installed `skills/ghl-builder` folder.

## 3. Start the debug Chrome

The engine talks to a Chrome that exposes remote debugging on port 9222. It uses its own profile directory, so it is independent from your everyday Chrome and stays logged in between sessions.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.config/ghl-builder/chrome-profile" &
```

In that Chrome window, open your HighLevel login page (for example `https://app.gohighlevel.com/`, or your white-label app domain) and log in normally, including any 2FA. Do this once; the profile keeps the session.

Keep this Chrome running while you use the skill. If you close it, start it again with the same command; the login persists.

## 4. Run setup

```bash
node scripts/setup.mjs
```

It checks Node, Playwright, and Chrome, then asks:

1. Platform URL: the origin you log in at, for example `https://app.gohighlevel.com` or your own white-label domain.
2. Sub-account IDs: the location IDs you will build in, comma-separated. Find one in the address bar: `.../v2/location/<ID>/...`. Setup confirms each one is reachable from your login and shows its name; unreachable IDs are dropped.
3. Lab sub-account (optional): a throwaway sub-account where builds skip the confirmation prompt. Paste its ID or type `none`. The lab is only accepted if your login can reach it; otherwise no lab is set and every build asks first. Everything created in the lab is named `ZZZ-SPIKE-*`.

The result is written to `~/.config/ghl-builder/config.json` on your machine, never into the repo. Re-run `setup.mjs` any time to add sub-accounts or change the lab.

## 5. Try it

In Claude Code, from any directory:

> Build a workflow on sub-account `<ID>` that adds the tag "welcome" when a contact is created. Draft only.

Claude reads the skill, drafts a spec, runs a dry run, shows you the spec, and, because this is not the lab, asks for confirmation before writing anything. Say yes, and it builds, verifies, and reports the workflow URL. Workflows are created as Draft unless you ask to publish.

## Day to day

- Session expired? The engine tells you: "No authenticated tab for ... open ... and log in". Log in in the debug Chrome and ask Claude to continue.
- New sub-account? `node scripts/setup.mjs`, keep existing accounts, add the ID.
- Updates: update the plugin (or `git pull`), then `npm install` again if `package.json` changed.
- Chrome auto-updated and every new tab hangs? Quit the debug Chrome and start it again with the command in step 3.

## Optional: automated login

If you have your own login helper, install it as a `ghl-login` skill (`~/.claude/skills/ghl-login/scripts/ghl-login.mjs`, or set `GHL_LOGIN_SCRIPT`). The engine calls it when a session has expired instead of asking you to log in. Without it, you log in by hand, which is the normal path. This repo does not ship one.
