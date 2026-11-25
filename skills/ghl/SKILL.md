---
name: ghl
version: 1.0.0
description: |
  GoHighLevel (GHL / LeadConnector / white-labeled HighLevel) working knowledge
  for agents. Use whenever a task touches a GHL sub-account: contacts,
  conversations, opportunities, calendars, forms, surveys, funnels, workflows,
  social posting, blogs, invoices, custom objects, or custom fields; when choosing
  or wiring HighLevel's own AI (Conversation AI, Voice AI, Agent Studio, Managed
  Agents, Workflow AI); and before launching a funnel, webinar offer or checkout
  (launch QA). Read this
  BEFORE calling GHL MCP tools or opening a browser — it routes each task to the
  fastest path that can actually do it, decodes GHL's misleading error
  signatures, and carries verified MCP bugs plus the safety rules for probing a
  live account.
---

# GoHighLevel

## The one thing to know

**There are two MCP servers, and the old one hides most of the platform.**
(Checked 2026-11-25, details and sources in `references/ai-in-highlevel.md`.)

- **Official MCP v2 (sign-in / OAuth)**: `https://services.leadconnectorhq.com/mcp/anthropic/v2`
  for Claude (claude.ai custom connector, or
  `claude mcp add --transport http highlevel <url>` then `/mcp` to sign in).
  Four discovery tools (`list_locations`, `search_operations`, `describe_operation`,
  `execute_operation`) reach ~700 actions. One connection = one sub-account.
  **Use this when a person is at the keyboard to sign in.**
- **Legacy MCP (`/mcp/`, Private Integration Token)**: a fixed set of ~36 tools.
  Fine for headless jobs, but most of the platform isn't in it.
- **The v2 REST API** with a Private Integration Token covers far more than the
  legacy MCP: creating calendars and opportunities, enrolling contacts in
  workflows, listing funnels, reading users. Plain HTTP, orders of magnitude
  faster than clicking.

So when a tool seems missing, **do not conclude the platform can't do it and do
not fall back to browser automation.** Search MCP v2 operations or check
`references/api-coverage.md` first.

**HighLevel's own AI** (Conversation AI, Voice AI, Agent Studio, Managed Agents,
Workflow AI Builder and AI actions, Ask AI, AI Studio, Knowledge Base) is a
separate question: what to build *inside* HighLevel vs what Claude does *to*
HighLevel. Routing table, prices and the APIs for each: `references/ai-in-highlevel.md`.

## Decision order

1. Is there an **MCP operation**? Use it (v2 if signed in; check the gotchas file for the legacy tools, some are broken).
2. Is there an **API endpoint**? Use `curl`. See `references/api-coverage.md`.
3. Only if neither: **browser automation.** Tell the user it will be slow before starting.

## Setup

```bash
BASE="https://services.leadconnectorhq.com"
PIT="pit-..."          # Private Integration Token, sub-account scoped
LOC="..."              # locationId
# every request:
-H "Authorization: Bearer $PIT" -H "Version: 2021-07-28" -H "Accept: application/json"
```

Find `locationId` in the project's `.mcp.json`, via `GET /locations/{id}`, or ask.
Never assume it carries over between projects. Confirm the sub-account before any
write — writing into the wrong one is painful to unpick.

## Decoding GHL's error signatures

GHL returns four *very* different meanings under similar-looking statuses.
Reading them correctly is the difference between a 30-second fix and an hour
lost. This decoder is the highest-value thing in this skill.

| Response body | Means | What to do |
|---|---|---|
| `404 Cannot POST /path` | Route genuinely does not exist | Stop. It's UI-only. |
| `401 "version header was not found."` | **missing `Version` header** — NOT an auth problem | Add `-H "Version: 2021-07-28"`. Don't touch the token |
| `401 "Invalid Private Integration token"` | bad/expired token | Reissue the PIT |
| `401 "The token is not authorized for this scope."` | Route exists; **your PIT lacks the scope** | Add the scope in Settings → Private Integrations, reissue token |
| `401 "This route is not yet supported by the IAM Service."` | Route exists but is **closed to Private Integration tokens entirely** | No scope fixes this. Needs an OAuth marketplace app, or use the UI |
| `400` / `422` validation message | **Route works** — params were wrong | Fix the payload and retry |
| `401 "E01 - Unauthorized request"` | Invoices/payments family, separate auth path | Treat as scope-ish; verify PIT has payments scopes |

**A `401` is almost never a dead end — read the message body.** Four different
`401` bodies mean four different fixes, and only one of them is about the token.
The `version header` case is the most common and the most misleading.

## Probing safely — hard rule

When testing whether an endpoint exists on a live account:

- **Empty body `-d '{}'` + FAKE IDs.** A fake ID returns "not found" without
  doing anything.
- **NEVER use a real ID on an action endpoint.** Action endpoints
  (`/contacts/{id}/workflow/{wfId}`, `/campaigns/{id}`, message sends) have no
  validate-only mode. A "probe" with real IDs *executes*. This has already
  caused a real accidental workflow enrollment — the empty body does not save
  you, because the IDs are in the URL path.
- Published workflows fire real email/SMS. Assume every account has some.
- GETs are safe. Probe reads freely.

## Task routing — quick reference

| Task | Path |
|---|---|
| Contacts CRUD, tags, search | MCP or API |
| Conversations, send message | MCP or API |
| Opportunities — read **and create** | API (`POST /opportunities/`); MCP is update-only |
| Calendars — read **and create** | API (`POST /calendars/`, `/calendars/events/appointments`); MCP is read-only |
| Enroll contact in workflow | API (`POST /contacts/{id}/workflow/{wfId}`) — **this executes** |
| List workflows / funnels / forms / surveys | API (read works fine) |
| Users, businesses, custom objects, associations | API only, no MCP |
| Social posts | MCP (`edit-post` is broken — see gotchas) |
| **Create / read / edit / publish** a workflow | **Workflows API v3 first** (`Version: v3`, probe `GET /workflows/step-types` read-only). It's a private beta that HighLevel Support switches on per location, so **probe first** (a 403 `WORKFLOW_API_NOT_ENABLED_FOR_LOCATION` means it's off there). Where it's on, read, search, validate, edit and publish all work (verified Nov 2026); a published workflow must go draft → edit → published. Validate → create as draft → verify by `GET /definition`. See `references/workflows-api-v3.md` |
| **Create** a workflow only when v3 is not enabled (403) or can't express it | ghl-builder engine, else **UI** (browser-automatable) — see "The two builders are not alike" |
| **Create** a funnel / page | **UI only** (`404`) and **not** reliably automatable — human required |
| **Create/edit** a form or survey | **UI only for PITs** — IAM-blocked |
| Snapshots, SaaS config, agency settings | Agency-level, out of reach of a location PIT |

- **Payload shapes, custom-field read/write, search DSL, the traps: `references/payloads-and-traps.md`** ← read before any write
- Full verified matrix, pagination, rate limits: `references/api-coverage.md`
- Copy-paste working calls: `references/recipes.md`
- Messaging depth + custom-object data model: `references/objects-and-messaging.md`
- Known MCP bugs and workarounds: `references/mcp-gotchas.md`
- **HighLevel's AI features, the official MCP v2, AI-agent APIs, prices (checked 2026-11-25): `references/ai-in-highlevel.md`**
- **Calendars/appointments, agency users, old workflows, date waits (verified Nov 2026): `references/payloads-and-traps.md` → "Verified Nov 2026"** ← read before booking, cancelling, or changing user permissions
- **Launching a funnel, webinar offer or checkout: `references/funnel-launch-qa.md`** ← run before go-live and after every edit. Checkout copy must match the sales page, coupon must match the page, format checked on desktop and phone. Any fail blocks launch

## Two things that silently break scripts

**Rate limit: 100 requests / 10 seconds, 200k/day, per token.** Every response
carries `x-ratelimit-remaining` — read it rather than guessing. Sleep ~110ms
between calls in loops.

**Pagination has four incompatible schemes**, and using the wrong one silently
truncates results rather than erroring:

| Endpoints | Scheme |
|---|---|
| `contacts`, `opportunities/search` | cursor — `meta.startAfterId` + `meta.startAfter` |
| `forms`, `surveys` | `limit` + `skip`, compare against `total` |
| `invoices`, `blogs` | `limit` + `offset` — **as strings** on invoices |
| `POST /contacts/search` | `pageLimit` + `page` |

## Discovering a payload

POST `{}` to any write route and read the `422`. GHL's validation errors
enumerate required fields and valid enum values — faster and more current than
the published docs. (Safe: empty bodies create nothing. But see the ID rule
above.)

## The two builders are not alike (verified 2026-07-22)

Do not lump "GHL builders" together. They fail differently:

**Workflow builder — automatable.** The canvas is Vue Flow, and its nodes are
real DOM buttons exposed in the accessibility tree (`Add trigger`, `Add action`,
`Save trigger`, `Save action`). The whole trigger library, filter dropdowns,
action library and email-action config (name, subject, pre-header, rich-text
body) drive fine via Playwright a11y refs. A trigger + filter + email action +
save was built end-to-end in ~20 calls and verified via `GET /workflows/`.

Three traps, all solvable:
- Some controls are `div.cursor-pointer`, not `<button>` — invisible to
  role-based lookups. Find the real node with `el.querySelector('div.cursor-pointer')`
  and `.click()` it.
- A support chat widget (`#engagement-widget-*`) sits on the **top-level page**
  and intercepts clicks on the save button. Hide it first:
  `document.querySelectorAll('[id*="engagement-widget"]').forEach(n => n.style.setProperty('display','none','important'))`.
  You cannot reach it from inside the builder iframe — it's cross-origin, so run
  that on the main page.
- The rich-text body is a real `contenteditable`. `execCommand('insertText')`
  works; each `\n` becomes a new paragraph, so join paragraphs with a single
  `\n`, not `\n\n`. Always verify with `innerText` — the a11y tree shows a
  misleading "Type a message" placeholder over real content.

**Use Playwright, not the Chrome extension, for anything inside GHL.** Verified
2026-07-22: the whole app renders in a cross-origin iframe
(`client-app-automation-workflows.leadconnectorhq.com`). Playwright traverses it
natively via `contentFrame()`. The Chrome extension cannot — its accessibility
tree stops at the iframe boundary ("no elements on the canvas"), and synthetic
coordinate clicks on iframe content silently do nothing (three consecutive
no-ops on a plainly visible `Add new trigger` button). The extension is still
useful for *seeing* state — screenshots proved the list page was blank and the
builder was fine — but it cannot drive GHL.

**Reading an existing workflow** is the highest-leverage move and costs one call.
Try the Workflows API v3 first (where it is enabled): `GET /workflows/{id}/definition?locationId=…` (`Version: v3`) returns triggers, actions and `edges`, so stop there — see `references/workflows-api-v3.md`. Otherwise: there is no `GET /workflows/{id}` (confirmed `404`) and the builder's own backend
(`backend.leadconnectorhq.com/workflow/{loc}/{id}`) is CORS-blocked without the
app's bearer token — so read the canvas DOM instead. Click **Fit to Screen**
first: Vue Flow virtualizes off-screen nodes and you will silently get only the
handful in viewport (5 of 80 in one measured case). Then recover full topology
from each node's `translate(x,y)`:

```js
[...el.querySelectorAll('.vue-flow__node')].map(n => {
  const m = (n.style.transform||'').match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
  return { x:+m[1], y:+m[2], t:n.innerText.replace(/\s*\n\s*/g,' ~ ') };
}).sort((a,b) => a.y-b.y || a.x-b.x)
```

`y` is sequence, `x` is branch. This reverse-engineers a whole snapshot module.

**Navigating away from a dirty builder fires a native `beforeunload` dialog**
that silently hangs every subsequent tool call until dismissed — the failure
looks like a navigation timeout, not a dialog. Handle the dialog, or save first.
The builder is also memory-heavy: long sessions crashed the tab and left the
Playwright profile locked. Save work as you go and expect to restart the browser.

Decline the "auto save" modal (`Continue with Manual Save`) so nothing is
written until you choose. New workflows default to `status: draft` — leave them
there unless publishing is explicitly agreed; published workflows fire real
email/SMS.

### `Build using AI` — use it, but iterate (verified 2026-07-22)

The **`Build using AI`** button on the workflow list is the fastest way to build
a workflow and should be your default over hand-placing nodes. It genuinely
works: a described workflow becomes a real trigger+action graph in ~40–90s, and
it names the workflow itself. Four workflows were built this way in roughly the
call budget one hand-built workflow costs.

Its limits are specific and worth knowing before you trust the output:

| Behaviour | What to do |
|---|---|
| **Simple linear flows: one-shot is excellent.** Triggers, waits, tasks, SMS/email, and a reply-vs-timeout branch all came out correct and complete. | Ship it, then verify. |
| **Complex branching: it scaffolds the shape and leaves branch bodies EMPTY.** A prompt with two conditional branches produced the wait node and both branch nodes going straight to `END` — no tags, no tasks inside them. | **Don't one-shot complex flows.** Generate, then send a follow-up chat message naming the empty branch and listing its actions. Refinement reliably fills them in. |
| **It picks third-party actions that aren't connected** — it chose a *ClickUp* "Create Task" action on an account with no ClickUp integration. | Say "use native GoHighLevel actions only" — it correctly swapped to the built-in `Add Task` on request. Always check node types, not just node counts. |
| **It cannot distinguish two different trigger links.** Asked to branch on `SITELEAD-ACCEPT` vs `SITELEAD-DECLINE`, it collapsed both into one generic `Trigger link clicked` branch. | Split into two workflows, or wire the second link's branch by hand. |
| **The AI's rename does not persist on the first save.** The UI title updates and `GET /workflows/` still returns `New Workflow : <timestamp>`. | Click **Save** a second time, then re-check the API. |
| It surfaces a **"Complete these steps before executing your workflow"** list of required-but-unset fields (notification type, task Team). | This list is trustworthy — treat it as the real punch list. |

The refinement box (`Make changes to your workflow…`) is where the leverage is:
each round-trip is one prompt and it edits the existing graph in place rather
than regenerating. Build → inspect → refine → save.

**Keep prompts short.** Measured over 11 generations: prompts of roughly 3–6
sentences succeed; a ~900-character prompt with eight sequential actions
returned an **empty canvas** (trigger + END, nothing else) and left the chat box
disabled — the generation silently died. Re-prompting the same workflow with a
terse version worked first time. Write like a task list, not a spec:

```
Trigger when tag "stage-production" is added. Send the client a project-start
email. Create a task "Post permits and designs on site". Wait 7 days. Create a
task "Punchlist verification".
```

**Two failure modes that look identical to a quota block but aren't:**
- The AI modal stops opening on the workflow-list page. This is a **stale
  iframe**, not a limit — reload the page (or restart the browser) and it works.
- The builder tab crashes outright (`Target page, context or browser has been
  closed`). It is memory-hungry; the profile grows fast. Clearing
  `Default/Cache` and `Default/Code Cache` in the Playwright profile fixed it
  every time and **preserves the login session** (don't delete the whole
  profile). One crash mid-generation left a workflow created but empty — always
  re-open and check the canvas after a crash.

**Budget ~9 tool calls per workflow**: navigate → find list → click AI → find
prompt box → snapshot for the ref → type → Enter → wait 90–120s → find save →
click save. The prompt box's placeholder text rotates every few seconds, which
**invalidates a11y refs** — snapshot the immediate parent and use the returned
ref in the very next call, or the type will fail with "Ref not found".

**Page/funnel builder — not automatable.** Deeply nested cross-origin iframe
canvas; clicks and keystrokes don't land, screenshots time out on a font-load
hang. Two independent approaches failed. Needs a human.

## Testing a workflow without publishing (verified 2026-07-22)

**You do not need to publish to test.** `Test workflow` → `Run a test` executes
a **draft** workflow against a chosen contact and writes real rows to the
**Execution logs** tab. This is the right harness: full action chain, zero risk
of the automation firing for everyone. Statuses are `Executed`, `Skipped`,
`Waiting`, `Added To Workflow` — and **`View details` on a skipped row gives the
literal reason**, which is the fastest debugging path in the whole product.

Four behaviours that will waste time otherwise:

- **A contact never re-enters a workflow it has already run.** The second test
  on the same contact logs `Add to workflow — Skipped` and nothing else runs.
  Use a fresh contact per test, or enable re-entry in workflow Settings.
- **Contacts dedupe on email *and* phone.** `POST /contacts/upsert` with a
  already-used phone silently **updates the existing contact** and returns the
  same id — it does not create a second record. Vary the phone, not just email.
- **Waits do not fast-forward** in test mode; they sit in `Waiting`.
- **A "Wait until date" whose date has passed (`skip`) also skips the NEXT send step** (log: "Appointment/Event wait time was in the past"). Contacts added after the date silently miss that email. Check the first wait is still in the future before a bulk add, and read the Execution logs: "past the step" does not mean "sent". (verified 2026-11-17)
- The publish toggle **silently reverts to Draft** on save if any node still has
  an unresolved required field. No error is shown. Clear every orange alert
  badge first.

### `Add task` — two config traps that make it skip at runtime

Both fail *silently* (status `Skipped`), not at save time:

1. **`Assign To` is a multi-select and must hold exactly one value.** Setting a
   named user while `Contact's Assigned User` is also selected yields:
   `"Task cannot be created with both assigned to contact's assigned user or
   custom assigned user"`.
2. **`Due Date` is required** — a Value *and* a Unit (`Days`/`Weeks`/`Months`/
   `Years`). The AI builder leaves it empty.

Internal-notification actions similarly skip until a notification type is set.

## Two JS traps that break every form-filling script (verified 2026-07-22)

These bit on the pipeline modal and the private-integration wizard, and they
will bite on any GHL settings form. Both have clean workarounds.

**1. Pendo breaks the native value setter.** GHL loads Pendo, which monkey-patches
`HTMLInputElement.prototype.value`. The standard React/Vue trick —
`Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(el,v)`
— throws `TypeError: Illegal invocation`. Pull a pristine setter from a
throwaway same-origin iframe instead:

```js
const f = document.createElement('iframe'); f.style.display='none';
document.body.appendChild(f);
const nativeSet = Object.getOwnPropertyDescriptor(
  f.contentWindow.HTMLInputElement.prototype, 'value').set;
const setVal = (el, v) => { nativeSet.call(el, v);
  el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true})); };
// …fill fields…
f.remove();
```

**2. Some buttons only accept *trusted* events.** The pipeline modal's
`Add stage` ignores `el.click()` *and* a full synthetic
`pointerdown/mousedown/pointerup/mouseup/click` sequence — 25 dispatched clicks
added zero rows. Playwright's real `browser_click` works, but **one row per
call**; there is no way to batch it. Budget one tool call per row and fill all
the values in a single `evaluate` afterwards.

Rule of thumb: **JS `evaluate` for reading and for setting input values; real
Playwright clicks for anything that adds or removes DOM.**

## Creating a sub-account, end to end (verified 2026-07-22)

The bootstrap sequence, including the one step that must go through the UI:

1. **Create the location** — agency PIT, `POST /locations/`:
   ```json
   {"name":"…","companyId":"…","address":"…","city":"…","state":"…",
    "country":"CA","postalCode":"…","timezone":"America/Chicago",
    "email":"…","phone":"…","prospectInfo":{"firstName":"…","lastName":"…","email":"…"}}
   ```
   Top-level `firstName`/`lastName` are **rejected** (`422 "property firstName
   should not exist"`) — they belong in `prospectInfo`. Returns `201` with the
   new `id`.

2. **The agency PIT cannot touch anything inside that location.** Every
   location-scoped route returns `401 "The token is not authorized for this
   scope."` You need a second, location-scoped PIT.

3. **Create the location PIT in the UI** —
   `/v2/location/{loc}/settings/private-integrations` → *Create new integration*.
   The scope picker holds ~157 entries in a virtualized list, so don't click
   through it. Type into the search input and click the option whose text ends
   with `- <scope>`:
   ```js
   const input = document.querySelector('input.hr-base-selection-input-tag__input');
   // for each wanted scope: set input value, wait ~320ms, then
   [...document.querySelectorAll('[class*="option"]')]
     .filter(e => e.innerText.trim().endsWith('- ' + scope))[0].click();
   ```
   54 scopes selected in a single `evaluate`. Selecting write scopes triggers a
   **"Security Risk"** confirm dialog — click `Confirm`, then read the
   `pit-…` token out of `document.body.innerText`.

4. Everything else (custom fields, tags, users, calendars, contacts,
   opportunities, trigger links) is plain API from there.

**Pipelines are the exception** — `POST /opportunities/pipelines` returns
`401 "not authorized for this scope"` for PITs regardless of scopes granted, so
pipelines must be built in the UI. The page is
`/v2/location/{loc}/settings/pipeline` (**singular**; `/settings/pipelines`
404s), reachable from `/crm-settings` → *Pipelines* tab. **The create modal
caps at 8 stages** — plan around it or add the rest by editing afterwards.

## Trigger links replace webhook apps

When a journey needs "click here to accept / decline / approve", reach for
**trigger links** before proposing any hosted app. `POST /links/` with
`{locationId, name, redirectTo}` creates one; dropping it in an email gives you
a native `Trigger Link Clicked` workflow trigger. No server, no webhook, no
Zapier. Caveat: the AI workflow builder can't tell two trigger links apart in
one branch set (see above) — use one workflow per link if the paths differ.

## Before automating the UI

For genuinely UI-only work, consider whether it belongs in GHL at all. If the
user controls the surrounding site, a native form posting to
`POST /contacts/upsert` is far faster to build and change than a GHL form, and
contacts still land in the CRM. Trade-off: no builder conditional logic, and
submissions don't appear in GHL's form-submissions view. Offer it; don't decide
unilaterally.

If the UI is unavoidable: the app domain is white-label dependent
(`app.gohighlevel.com`, `app.leadconnectorhq.com`, or an agency domain — the
hosted form/widget domain is a hint but not the same host). Paths follow
`/v2/location/{locationId}/{section}`. Navigating straight to a section skips
whole menu chains. Builder canvases are iframe-heavy drag-and-drop; prefer
semantic page reads over coordinate clicking and expect several round-trips per
field.

## Security

PITs are full-access credentials for a sub-account and are routinely committed
in `.mcp.json`. If one appears in a repo, check whether it's git-tracked and
flag it. Never paste a PIT into output, a commit message, a skill file, or
anything leaving the machine.

## Keeping this honest

Grows from verified findings, never speculation. When something new is learned:
append it, mark it verified or unverified, and delete what stops being true.
Project-specific facts (form IDs, sub-account IDs, pipeline names) belong in
your project's notes, **not here**. This file stays generic across accounts.

**Capture durable facts, not selectors.** Tempting to pre-probe every UI-only
builder and bank the DOM handles so the next build is faster. Don't — GHL's
canvases are cross-origin iframes, Pendo-patched, memory-heavy, and reskinned
often, so a selector captured cold rots before you reuse it, and a stale
selector is worse than none: it sends the next build confidently down a dead
path instead of reading the page fresh. What *is* worth writing down, because it
doesn't rot:

- **Navigation paths** — e.g. `/settings/pipeline` is singular, plural 404s.
- **Hard constraints** — funnel step won't save without a URL path; the pipeline
  create modal caps at 8 stages.
- **Which JS trap bites where** — Pendo's setter, trusted-events-only buttons.

Learn these *while doing a real build*, not in a separate probing pass — a task
gives you ground truth and stops you banking things nothing verified. Reading a
canvas fresh is cheap (Fit-to-Screen + the `translate(x,y)` recovery); the slow
part is GHL's forced round-trips, which no cached selector removes.
