# Troubleshooting GHL workflow builds

Use this guide before changing Chrome state, closing targets, retrying a build, or falling back to UI automation.

## Contents

1. Fast triage
2. Chrome auto-update navigation wedge
3. Dead renderer stalls CDP connection (incl. the preflight's ~13s foreign-tab kill)
4. Builder route and iframe waits
5. Lock and ownership etiquette
6. API save rules
7. UI fallback save rules
8. Draft, publish, and trigger activity
9. "GHL changed something?" regression smoke test

## Fast triage

1. Read the exact CLI error and its JSON log.
2. If the message says it is waiting for `.cdp-lock` or `.cdp-priority`, wait; do not start a competing connection.
3. Check `curl -s http://localhost:9222/json/version`.
4. Distinguish a browser-wide navigation failure from one dead page target.
5. Preserve foreign tabs and unsaved edits.
6. Retry the smallest failed command after the underlying state is healthy.

## Chrome auto-update navigation wedge

Signature:

- existing tabs still work or reload;
- new tabs stay blank;
- `page.goto()` / `Page.navigate` times out before commit;
- `/json/version` remains healthy;
- the Chrome binary on disk has updated while the long-running debug instance is still the older version.

Check the running binary/version against `/json/version`. When the signature matches, stop the wedged debug Chrome and restart it with the same persistent profile. The saved login normally survives because the profile is reused.

Restart the debug Chrome with the same launch recipe `setup.mjs` prints (macOS shown):

```bash
curl -s http://localhost:9222/json/version >/dev/null 2>&1 || \
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 --user-data-dir=/tmp/playwright-profile \
  --no-first-run --disable-blink-features=AutomationControlled \
  --disable-features=IsolateOrigins,site-per-process >/tmp/chrome-debug.log 2>&1 &
```

Do not restart Chrome merely because one page is slow. Coordinate the restart with other agents because the debug browser is shared.

## Dead renderer stalls CDP connection

`connectOverCDP()` attaches to every page target. One renderer that accepts attachment but never answers `Runtime.evaluate` can stall the entire connection even though `/json/version` is healthy.

The repository client preflights `/json` targets with raw CDP, retries a slow evaluation once, closes only a target that remains nonresponsive, and waits until the target disappears before connecting Playwright.

Manual diagnosis, only if the built-in preflight itself fails:

1. Read `http://localhost:9222/json`.
2. Probe each page target by attaching over its WebSocket and running `Runtime.evaluate` with a short timeout.
3. Retry one slow target with the longer timeout before condemning it.
4. Close a confirmed dead renderer through `GET http://localhost:9222/json/close/<targetId>`.
5. Poll `/json` until that exact target ID is gone before retrying Playwright.

Never close a healthy target just because one evaluation is slow. Never close another agent's healthy tab.

### The preflight closes foreign tabs after ~13s, and ownership does not protect them

Measured 2026-08-11 against an isolated Chrome, not reasoned. `preflightCdp` iterates **every page target in the browser**, including tabs owned by other agents, and closes any whose renderer does not answer. The tolerance is the 3s probe plus one 10s `slowEvaluateTimeout` retry:

| Victim renderer unresponsive for | Verdict |
|---|---|
| 8s | survives |
| 12s | survives |
| 20s | **closed, target ID gone** |

**`preflightCdp` never reads `window.name`, so an ownership stamp offers no protection at all.** A tab explicitly marked with a foreign owner was closed. The etiquette rules below are honoured by agents, not enforced by the preflight.

Consequence: a builder tab pinned longer than ~13s (heavy iframe, long save, stalled navigation) can be closed out from under its owner, silently discarding unsaved edits. For an inbound-webhook build that destroys the trigger, its generated URL and its captured samples, breaking any workflow already pointing at that URL.

Two practical rules:

- Do not run a build while another agent holds a heavy builder tab, unless you accept that risk.
- A slow tab also **stalls the preflight for the full retry window**, up to ~13.5s, and under the whole-session lock that delay is charged to every queued agent. A mysteriously slow connect is usually someone else's busy tab.

> A renderer that stalls on a blocked network request still answers `Runtime.evaluate` and is left alone. The kill needs a genuinely unresponsive renderer, so real-world frequency is lower than the table suggests. Severity when it happens is unchanged.


## Builder route and iframe waits

Use the singular route:

```text
https://app.gohighlevel.com/v2/location/<locationId>/automation/workflow/<workflowId>
```

The plural `/automation/workflows/<workflowId>` route silently lands on the list and never creates the workflow-builder iframe.

The shell can temporarily create an `about:blank` iframe. `reload-render.mjs` ignores it and waits up to 60 seconds for an iframe whose source begins with `https://client-app-automation-workflows.leadconnectorhq.com/`. Do not reduce this to a short fixed sleep. Bring the owned tab forward and, if needed, warm the workflows list before navigating to the singular route.

`reload-render.mjs` requires at least one `--expect <canvas-label>`; called with only `--workflow` and `--location` it exits with the usage error rather than rendering. Pass the load-bearing node names, and include any node whose absence would be a silent design failure, for example a terminal cooldown `Wait`:

```bash
node "$REPO/scripts/reload-render.mjs" --workflow <id> --location <id> \
  --app-origin https://app.gohighlevel.com \
  --expect "Eligible to ask?" --expect "Cooldown, do not remove"
```

It takes no screenshot. When a run's definition of done calls for one, open the singular builder route in a fresh page yourself and capture it after the automation iframe appears.

### A failing `--expect` on a long workflow is usually a false negative

`checkReloadRender` waits for each label with `state:"visible"`, so a node **below the viewport fold does not satisfy it** even though it saved correctly. On a 15-node build this reported `locator.waitFor: Timeout` for a mid-flow node while an earlier node on the same branch passed. The node was on the server the whole time.

Confirm against the server before treating it as a build failure:

- `client.getStepsJson(workflowId)` length, or `read-workflow.mjs` -> `step_count.live`
- `client.getTriggers(workflowId)` for a non-empty trigger list

Prefer `--expect` labels from the **top** of the flow, plus `verify-build`, which walks the whole document and does not care about layout. Enumerating `[data-id]` inside the frame has the same limitation: it returns only currently-rendered nodes, so it undercounts a long canvas. Scrolling it by clicking the zoom controls can blank the enumeration entirely, so do not chase a missing node that way.

> **`read-workflow.mjs` reporting `complete:false` is not a build defect either.** It lists nodes under `unsupported` for shapes it cannot reverse into spec form, observed for `if_else`, `math_operation`, `task-notification`, `chatgpt` and `text_formatter`. That is a read-back limit. `step_count.live` and a `verify-build` PASS from a fresh process are the real signals.

Two things bite when writing that throwaway screenshot script:

- **`client.page` is a property, not a method.** `await client.page()` throws `TypeError: client.page is not a function`. Read it as `const page = client.page`, the way `reload-render.mjs` does.
- **Call `resolveLocationDescriptor(client, locationId)` before navigating.** Skipping it leaves the client without the resolved location context the builder route depends on.

Reuse the exported helpers rather than re-implementing the waits: `workflowRoute()` builds the correct singular route and `waitForWorkflowFrame()` waits for the real automation iframe, both from `reload-render.mjs`. Wait for `[data-id]` to attach inside that frame before capturing, or the screenshot catches an empty canvas on a workflow that is actually fine.

## Lock and ownership etiquette

- Set a unique `GHL_AGENT_OWNER`.
- Keep exactly one owned tab and preserve `window.name` ownership markers.
- Never overwrite another owner's marker.
- Never navigate or close a foreign tab.
- Let the client fall back from a closed/invalid owned handle to claim-or-create.
- Treat `waiting for cdp-lock held by <pid>` as queueing, not failure. The designed wait is up to five minutes.
- When `.cdp-priority` names another owner, do not initiate a new CDP connection until it is removed.
- Always allow the CLI to disconnect and release its lock; do not kill it during normal cleanup.
- **Keep the total tab count low.** `connectOverCDP` auto-attaches to every page on every connect, so tab bloat slows all agents. A peak of 18 pages, 16 iframes and 42 workers made connects unreliable. Close tabs you finish with.

> These are conventions between cooperating agents, **not enforced guarantees**. The preflight ignores `window.name` entirely and will close a foreign tab that stalls past ~13s, as measured above. Ownership prevents agents from *stealing* each other's tabs; it does not prevent the preflight from *closing* them.

**`browser.close()` is safe for peers.** Verified by live test: one agent disconnecting clears only its own contexts and leaves the browser process and every other client working. Two concurrent clients each running continuous per-tab work showed a clean 2x speedup with zero cross-talk, so per-tab work is not what the lock protects.

## API save rules

Workflow saves require a full document:

1. `GET /workflow/{locationId}/{workflowId}`.
2. Modify only the intended fields/nodes.
3. Preserve the remaining document and required arrays/defaults.
4. `PUT /workflow/{locationId}/{workflowId}` with the complete body.

A partial workflow body returns HTTP 422. Do not retry the same partial body. Trigger drift uses the full-trigger `PUT /workflow/{locationId}/trigger/{triggerId}` path; missing triggers use the trigger POST path.

The repository repair loop preserves node IDs and unknown server-owned fields while patching spec-owned drift. Prefer it to hand-written repair requests.

## UI fallback save rules

Use UI fallback only when an item cannot be represented by the mapped API engine.

- Use Playwright CLI/headed browser automation only.
- After editing an action, click `Save action`, then the top-bar `Save`.
- After editing a trigger, click `Save trigger`, then the top-bar `Save`.
- Do not close or navigate away from a tab with unsaved edits.
- If an `Unsaved changes` discard modal appears, read its text and choose the option that keeps edits, normally `Cancel`.
- Never choose modal buttons by color or position. Some trigger modals use a primary destructive button.
- Inbound webhook triggers require a real sample request, fetch/test, and mapping before `Save trigger` becomes available. Full recipe below.

### The top-bar `Save` is the only one that persists

`Save trigger` and `Save action` close their panels. **Neither writes to the server.** Skipping the top-bar `Save` discards the whole workflow, and the canvas looks correct right up until you reload.

**Proven side by side 2026-08-11** on `<locationId2>`: two identical inbound-webhook builds. The one that stopped after `Save action` read back `getTriggers() -> []`. The one that clicked the top-bar `Save` read back `triggers=1`. Both looked finished on screen beforehand.

**Never report a UI-built workflow as done without this proof:**
1. Click the top-bar `Save`, wait ~9s.
2. Open a **new tab** on `/automation/workflow/{id}`. The building tab's in-memory state shows nodes that were never persisted, so it cannot be trusted.
3. Screenshot it; confirm the top bar reads **`Saved`** and the nodes are on the canvas.
4. Cross-check `client.getTriggers(workflowId)`. An empty array means it did not persist.

> The canvas always shows an `Add new trigger` button. That is the control for adding a *second* trigger, **not** an empty state. Do not diagnose "empty workflow" from it.

### Recipe: inbound webhook trigger, end to end (verified 2026-08-11)

The mapping reference binds server-side to the trigger id and appears in no read endpoint, so this is genuinely UI-only.

**Creating the trigger via the API alone does not work.** `POST /workflow/{loc}/trigger` returns an id, but with no workflow save behind it the trigger never persists, and its URL answers posts with `422 Error: Billing failure` instead of accepting them.

**Do it all in ONE uninterrupted session.** The generated URL belongs to an *unsaved* panel; losing the page or the CDP connection first discards the trigger, its URL, and its captured samples.

1. `Add new trigger` → search `webhook` → `Inbound webhook`.
2. Read the URL from the read-only input, never construct it:
   ```js
   const url = await frame.evaluate(() => {
     const i = [...document.querySelectorAll('input')]
       .find(x => x.readOnly && (x.value||'').includes('webhook-trigger'));
     return i ? i.value : null;
   });
   ```
3. POST the payload **from Node, not the browser**. It need not come from the sending workflow; any request of the right shape works:
   ```js
   await fetch(url, { method:'POST', headers:{'content-type':'application/json'},
                      body: JSON.stringify(PAYLOAD) });
   // expect 200 {"status":"Success: test request received"}
   ```
   **Send the FULL payload you will really use.** Every key becomes `{{inboundWebhookRequest.<key>}}`; keys omitted now will not exist in the field pickers later.
4. `Fetch sample requests`. On success the `MAPPING REFERENCE` control turns from a button into a `Select reference payload` dropdown.
5. Open it and click a row, e.g. `(2026-08-11 11:50:00) Request <id042>`.
6. `Save trigger`. The platform then **auto-inserts a mandatory `Create contact` node**, because the trigger is contactless.
7. In that node: `Add field` → `Select field` → search `Phone` → click the **exact** `Phone` row (the search also returns `Referral 1 Phone` and similar) → set the value to a payload token such as `{{inboundWebhookRequest.referral_phone}}`. **Email or Phone is required** or the workflow save is rejected.
8. `Save action`.
9. **top-bar `Save`**, then verify per the procedure above.

**Never click `Cancel` in the trigger panel.** It opens a confirmation that deletes the trigger, its test requests and its URL. If that URL is already pasted into a sending workflow, the sender breaks silently. The only safe exit is `Save trigger`.

### Webhook pairs: verify BOTH workflows

Each half can fail to save independently, and the two failures look completely different:

- **Receiver unsaved** → its URL is dead; the sender posts into nothing.
- **Sender unsaved** → far worse. The receiver is perfect, its trigger and mapping are intact, and nothing ever arrives, because the posting action was never persisted. No error surfaces anywhere.

So reload-verify **both** ends, not just the one built most recently, and confirm the sender's `Custom webhook` action still holds the right URL after a fresh load. A half-saved sender and a URL typo present identically, and you will debug the wrong workflow.

**Ordering is freer than the docs imply.** Because the URL comes from the panel and the sample can be posted with `curl`, the receiver does **not** need the sender to exist first. Build the receiver, grab its URL, post a sample, save, verify; paste that URL into the sender whenever convenient.

**Both directions are premium executions**, billed per run against a small lifetime free allowance per sub-account.

## Draft, publish, and trigger activity

Draft workflows have `active:false` triggers. Publishing the workflow flips trigger activity; there is no separate reliable trigger activation call.

Never publish unless the user explicitly asks. Before publishing, warn that active triggers can execute and premium actions may bill. Saving/configuring a premium item in Draft does not execute it, but publishing makes runtime execution possible.

The shipped general build and repair flow must remain Draft. The repository's only publish primitive is a tightly restricted smoke test that publishes and reverts a known safe workflow in one run. Do not bypass it.

## "GHL changed something?" regression smoke test

When a GHL release may have changed workflow persistence or rendering, run the canonical end-to-end smoke test on the lab:

```bash
export GHL_AGENT_OWNER="ghl-builder-regression-$(date +%s)-$$"
node "$REPO/scripts/regression-check.mjs"
```

The runner reads `research/phase5/regression-spec.json`, creates a fresh `ZZZ-SPIKE-regression-<date>-<time>` Draft, and exercises a contact-tag trigger, email, wait, if/else, add/remove tag, and goto. It requires dry-run, real build, fresh-process extraction verification, and reload-render to all pass. Exit `0` prints `REGRESSION PASS`; exit `1` prints the failed stage. The generated spec and `research/phase5/regression-run-*.json` report preserve the workflow ID and evidence. The smoke test never publishes or deletes its Draft.

## Trigger added through the API never appears on an older workflow (verified 2026-11-17)

On workflows whose document has `isTriggerBucketMigrated`, `POST /workflow/{loc}/trigger` returns an id but the trigger never shows in `GET .../trigger?workflowId=` or on the canvas, and a full-document PUT (even with `triggersChanged:true` + `newTriggers`) rewrites the list without it. Step edits through the full-document PUT still work. Add or change triggers on those workflows in the builder UI (duplicate an existing trigger → edit → Save trigger → top-bar Save), or through Workflows API v3 where enabled, then read the definition back. Workflows this engine creates are not affected.
