# VERIFY-PROTOCOL — how a Phase-1 item earns "done"

An item (trigger or action) is **done only when `verify/verify-item.mjs` prints ✅ PASS** against the real saved state in GHL. "I configured it and it looked right" is not done. This protocol defines the machine-checkable doc format, how to run the check, and the pass bar.

---

## 1. What the worker MUST put in the raw file (so it's verifiable by construction)

Every `raw/{actions,triggers}/<slug>.md` MUST contain **exactly one** `## Verified JSON` section in this strict shape:

````markdown
## Verified JSON
<!-- verify: workflowId=<wfId> nodeId=<node-or-trigger-id> kind=action|trigger -->
```json
{ ...the node/trigger object exactly as it appears in the real saved state... }
```
````

Rules:
- **Heading must be literally `## Verified JSON`** (the parser finds the block by this heading).
- The **HTML comment line is required** and carries three fields: `workflowId`, `nodeId` (the action node id from the steps file, OR the trigger id from `GET /trigger`), and `kind` (`action` or `trigger`). These let a reviewer run the check with just `--doc`.
- The **```json fenced block must be valid JSON** — no `//` comments, no trailing commas, no `<placeholder>` in keys. (Placeholder *values* like `"<uuid>"` are allowed and are treated as "any value of matching presence".)
- Document the keys you **claim**. You don't have to echo every real key (the real node may have extra plumbing keys like `date_added`, `order`, `sourceId`); the verifier only checks that **each documented key exists in reality with a matching type**. But every key an engine needs to *write* MUST be documented (that's the point).
- For arrays (e.g. `conditions`, `fields`, `branches`), document **one representative element** — the verifier compares element **type**, not full contents. Describe the full set in the prose/field table.

### Gated-stub exception (nothing saved)

If an integration, subscription, Marketplace, or workflow-structure gate prevented any node/trigger from being saved, use exactly this notation instead of inventing JSON or a node ID:

```markdown
## Verified JSON
<!-- verify: gated=true workflowId=<wfId> nodeId=none kind=action|trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No node/trigger was saved because: `<exact gate>`.
```

This exception is only for true no-save gates. It intentionally has no JSON fence or verifier run; `verify-item.mjs` cannot verify an object that does not exist.

How to get the real node id:
- **action:** open the workflow's steps file (`GET /workflow/{loc}/{wfId}?includeScheduledPauseInfo=true` → `fileUrl` → curl it, auth-free) and find your node in `templates[]` by matching `type`+`name`; copy its `id`.
- **trigger:** `GET /workflow/{loc}/trigger?workflowId={wfId}` → find yours → copy its `id`.

### Field-table completeness rule (the other half of PASS)
Every **UI field row** in the doc's field table must either (a) map to a JSON path present in the Verified JSON, or (b) be explicitly labelled **inferred / uncaptured** with a one-line reason. No silently-unmapped fields. (This part is a human check — the script verifies JSON; the reviewer eyeballs the table against §3.)

---

## 2. How to run the check

```bash
cd research/phase1/verify
export PLAYWRIGHT_PATH="$REPO/node_modules/playwright/index.mjs"   # 1.61.x, installed by `npm install` in the repo
node verify-item.mjs --doc ../raw/actions/<slug>.md
# CLI overrides (rarely needed — normally read from the doc's verify comment):
#   --workflow <id>  --node <id>  --kind action|trigger
```

Requirements:
- The **debug Chrome on :9222 must be up and logged into the lab** (the script sniffs a read-only Bearer from the builder iframe to read workflow detail / triggers). It performs **no writes** — only GETs.
- Action steps files on Firebase are **auth-free**, but fetching the `fileUrl` first needs the workflow detail (authed) — so Chrome must be running for actions too.

Output: a field-level table (`OK` / `MISSING` / `TYPE` / `VALUE`), a summary line, `✅ PASS` or `❌ FAIL`, and an evidence file at `verify/evidence/<slug>.json` (the full diff + the real node, for the record / the "visible mechanical confirmation").

Exit code: **0 on PASS, 1 on FAIL, 2 on bad usage** — so it drops into CI / a batch loop.

---

## 3. What PASS requires

`verify-item.mjs` returns **PASS** iff **every documented key exists in the real saved node with a matching type** (`missing/type-mismatch == 0`).

- `MISSING` = a key you documented is not in reality (wrong key name, or you invented it) → **FAIL**.
- `TYPE` = key exists but the JSON type differs (e.g. you wrote `"false"` string, real is `false` bool) → **FAIL**.
- `VALUE` = key + type match but the literal value differs → **informational only** (does NOT fail; the harvest value and the doc's example value can legitimately differ). Use it to spot copy-paste drift.

Plus the human half: the field-table completeness rule in §1 (every UI row mapped or labelled inferred).

An item is **done** when: (1) `verify-item.mjs` → ✅ PASS, (2) evidence JSON exists under `verify/evidence/`, and (3) the field table has no unmapped-and-unlabelled rows.

---

## 4. Failure → fix → re-verify loop

1. Run `verify-item.mjs --doc <file>`.
2. If `❌ FAIL`:
   - **MISSING** → the real node uses a different key. Look at the `realNode` in the evidence JSON (or re-curl the steps file), find the true key, fix the Verified JSON block.
   - **TYPE** → correct the value's JSON type in the doc (string vs number vs bool vs array/object).
   - If the node genuinely isn't saved yet (fetch error "node … not in steps file"), the item was never really completed — the worker must actually add+configure+save it (two-save rule) or API-inject it, then update the `nodeId` in the verify comment.
3. Re-run until `✅ PASS`. Commit the doc + let the evidence file regenerate.
4. Only then flip the item's TODO.md row to `done` (with the raw file path).

**Never** mark an item done on a FAIL or without an evidence file. If a specific sub-variant genuinely can't be captured (e.g. a premium mode), document the captured variant, PASS on that, and label the sub-variant `inferred` in the table — don't put un-captured guesses inside the `## Verified JSON` block.

---

## 5. Worked examples (run these to see PASS + FAIL)

- **PASS (action):** `node verify-item.mjs --doc ../raw/actions/add-to-workflow.md` → ✅ 5/5 keys OK. (This file was retrofitted to the strict format as the action exemplar.)
- **PASS (trigger):** `node verify-item.mjs --doc EXAMPLE-trigger-contact-tag.md` → ✅ (reads via `GET /trigger`; the trigger exemplar lives in verify/ so it doesn't touch the trigger-harvester's files).
- **FAIL:** `node verify-item.mjs --doc EXAMPLE-FAIL-demo.md` → ❌ catches a wrong key name (`workflowId` vs `workflow_id` → MISSING) and a wrong type (`"false"` string vs `false` bool → TYPE).

---

## 6. Retrofit note for the existing 30 raw files

Most current files use a `## Captured attributes JSON` (or `## Captured JSON` / `## JSON schema`) heading and some carry `//` comments or `<...>`-truncated ids inside the fence — **not machine-checkable as-is**. Light retrofit per file (≈2 min each):
1. Rename the primary captured-JSON heading to **`## Verified JSON`**.
2. Add the `<!-- verify: workflowId=… nodeId=… kind=… -->` comment (get the ids from the steps file / `GET /trigger`).
3. Make the fenced JSON valid (drop `//` comments; replace truncated ids like `"44d0f888-..."` with the full id or a `"<uuid>"` placeholder).
4. Run `verify-item.mjs` → PASS.

Do NOT bulk-retrofit blindly — each needs its real `nodeId`. `add-to-workflow.md` (action) is done as the exemplar; the trigger exemplar is `verify/EXAMPLE-trigger-contact-tag.md`. The remaining files can be retrofitted as each item is (re)verified.
