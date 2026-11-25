# Action and trigger map

Use the Phase 1 corpus to author types and attributes from verified saved JSON rather than UI labels or memory.

## Contents

1. Locate a verified shape
2. Convert a reference into a spec
3. ID versus name rules
4. Premium and billing checks
5. Map-on-demand recipe
6. Engine boundaries

## Locate a verified shape

The development repository contains:

- `research/phase1/raw/actions/<slug>.md`: 129 action references;
- `research/phase1/raw/triggers/<slug>.md`: 92 trigger references;
- `research/phase1/verify/evidence/<slug>.json`: machine verification evidence;
- `research/phase1/verify/verify-item.mjs` and `VERIFY-PROTOCOL.md`: reference verification harness and protocol.

Search by UI label and likely slug:

```bash
REPO="${GHL_BUILDER_REPO:-$(readlink "$HOME/.claude/skills/ghl-builder")}"
rg -n -i "<UI label or concept>" \
  "$REPO/research/phase1/raw/actions" \
  "$REPO/research/phase1/raw/triggers"
```

Read the entire matching file. Use its `JSON type`, config table, `Verified JSON`, location-data section, quirks, and premium statement together. A picker label alone is not a payload contract.

Example: a missed inbound call maps through `raw/triggers/call-details.md`, which proves trigger type `call_status`, incoming direction as `message.direction == inbound`, and call-result filtering with `call_status` / `contains-any` from the checked production corpus.

## Convert a reference into a spec

For a trigger:

1. Copy the verified top-level `type` into `triggers[].type`.
2. Convert `conditions[]` into `triggers[].filters[]`.
3. Keep semantic filter fields, operators, values, titles, and input types.
4. Omit stored `id`, `active`, `workflow_id`, `location_id`, `masterType`, and generated metadata; the composer supplies them.

For a single-node action already supported by the core composer, use its documented high-level `config` from `spec-format.md`.

For a mapped single-node action without a dedicated composer case:

1. Use the verified node `type` and optional canvas `name`.
2. Put the verified `attributes` object under `config.attributes`.
3. Remove node topology and generated fields: `id`, `order`, `next`, `parent`, `parentKey`, `sibling`, and generated UUID metadata.
4. Replace location-specific values with values resolved for the target location.
5. Dry-run, build only in permitted scope, verify extraction, and reload-render.

Do not use this generic recipe for actions whose verified shape includes transition/branch child nodes or other multi-node side effects. Extend and test the composer first.

> **`config.attributes` is an unvalidated passthrough, so a field reference inside it is never resolved and never checked.** Step 4 above is not a suggestion. The composer copies the object through verbatim: it does not map a field name to an ID the way `update_contact_field` does, and it does not reject an unrecognised one. A `math_operation` built with `"selectField": "opportunity_value"` (a plain label rather than the field ID the verified shape stores) **saved with SELECT FIELD blank in the panel** while `updateField` on the same node displayed correctly, and dry-run, build, `verify-build` and `reload-render` all passed. The node was incapable of doing its arithmetic and nothing said so. Verified 2026-08-11.
>
> Whenever you hand-write `config.attributes`, resolve every ID yourself from the location catalog, then **open the saved node's panel and confirm each selector shows a real value**. Round-tripping the JSON is not sufficient evidence, because the JSON you wrote is exactly what comes back.

## ID versus name rules

| Resource | Spec input | Stored shape / rule |
|---|---|---|
| Contact tags | Name | `attributes.tags[]` stores tag names. The tag must exist. |
| Pipeline and stage | Names | Core composer resolves each to location-specific IDs. |
| Users | Display name or email | Core composer resolves to user IDs. |
| Contact custom fields | Exact name or **full** field key | Core composer resolves to custom-field IDs. The key must be the complete `contact.<key>` form; see the silent-passthrough warning below. |
| Workflow folder | Name | Builder resolves one matching folder ID before creation. |
| Workflow references in mapped actions/triggers | Usually ID | Resolve from the location workflow catalog; follow the item's reference. |
| Calendars | Usually ID | Resolve from the target location; do not reuse lab IDs elsewhere. |
| Email/SMS templates | Usually template ID plus source metadata | Read the action reference; core email/SMS config does not resolve template names automatically. |
| Custom values | Field key/token | Follow the reference's exact stored token form. |
| Associations/custom objects | IDs/keys | Resolve every object, field, and association for the target location. |

Never copy fixture IDs from the lab into another location. Missing or ambiguous lookup names must stop the build before a write.

> **An `if_else` condition field that does not match ANY custom field passes through silently, unresolved.** `resolveCondition` matches only an exact lowercased `name` or `fieldKey`. On no match it leaves the string in `conditionSubType` verbatim and the build succeeds, so a bare `referral_ask_count` (missing the `contact.` prefix) stores the literal string where a field ID belongs. Dry-run, verify-build and reload-render all PASS, the canvas renders, and the condition never evaluates against the field. Unlike every other lookup in the table above, this one does not stop the build. **Always pass the full `contact.<key>` form or the exact display name, then read the composed `conditionSubType` back and confirm it is a 20-character ID, not your input string.** Verified 2026-08-11 on a real build; a spike spec in the same location had the unresolved form baked in and looked correct throughout.

```bash
node -e 'const d=require("<build-log>.json");
for(const n of d.composition.templates) if(n.nodeType==="condition-node")
  console.log(n.name, JSON.stringify(n.attributes.branches[0].segments[0].conditions.map(c=>c.conditionSubType)));'
```

After dry-run proves an explicitly requested tag is missing, use `node "$REPO/scripts/ensure-tag.mjs" --name "<tag>" --location "$LOCATION_ID"`. Lab tag names must use `zzz-spike-`; a non-lab asset write requires explicit user consent. Re-run dry-run after readback.

### Merge tokens are never validated, so an unverified one is a silent data-loss bug

A merge token that does not resolve **does not error**. The write still happens and the workflow continues, so every build check passes while the field silently receives no usable value. A workflow whose whole job is arithmetic can appear healthy and record nothing. Treat any token you did not read out of the builder's own picker as unverified, and never put one in a node that feeds money math or a counter.

**What an unresolved token actually stores, measured:** it resolves to **empty**. Across two live fires, eight failing candidates (three opportunity, five text formatter) every one wrote nothing, giving `A= B= C=1234.56 D=` and `L1= L2= L3= L4= L5=`. So on the contact record the symptom to look for is an **empty field, not a literal `{{...}}` string**. That distinction matters when debugging a counter: you are hunting a blank, not stray template text.

> A literal `{{...}}` string surviving into a field is a **different** phenomenon and is not evidence of a bad token. It is what a **never-executed** node shows, for example an unfired Draft SMS body still holding `{{contact.first_name}}` because nothing ever substituted it. Do not read that as a resolution failure. **[inferred, uncaptured]** whether any executed node can ever store the literal form.

Corpus-verified token forms: `{{chatgpt.N.response}}` and `{{datetime_formatter.1.date}}`. Note the GPT index is **positional within the workflow**, not stable: inserting another GPT node earlier renumbers every later one silently, so write each response into a named holder field immediately after it is generated.

#### The opportunity value token is `{{opportunity.lead_value}}` (verified by live fire)

**Resolved 2026-08-11 by firing a published throwaway against a real won opportunity and reading the stored value back.** Four candidates were written into one labelled text field so a single firing tested them all:

| Candidate | Readback |
|---|---|
| `{{opportunity.monetary_value}}` | empty |
| `{{opportunity.value}}` | empty |
| **`{{opportunity.lead_value}}`** | **`1234.56`** |
| `{{opportunity.opportunity_value}}` | empty |

Stored string, verbatim: `A= B= C=1234.56 D=`. Re-run at a different amount wrote `987.65` into a MONETORY contact field, so the token tracks the real value and survives the monetary type.

> **`{{opportunity.monetary_value}}` is the trap.** It is the obvious guess, it is the name the builder UI shows, and `"fieldKey":"opportunity.monetary_value"` genuinely exists in the customFields payload with `model:"opportunity"`. It still resolves to nothing as a merge token. Corpus evidence for a field key is **not** evidence for a merge token; only a live fire distinguishes them.

> **The token is position-sensitive: `find_opportunity` re-points it.** `{{opportunity.lead_value}}` resolves against the **triggering** opportunity before a Find and against the **found** opportunity after it, so the identical token in two nodes of the same workflow returns two different numbers. Find swaps the merge-token context, not merely the target of downstream opportunity actions. **Verified** 2026-08-11 by repeated live runs of an accumulator that captures the triggering value pre-Find, then adds the found opportunity's value post-Find. This is exploitable rather than merely a hazard: it is what makes a running total possible without ever needing a second token.

The custom variable picker is no help here and its absence proves nothing about what resolves at runtime. It exposes `Contact`, `Company`, `User`, `Appointment`, `Calendar`, `Message`, `Account`, `Right now`, `Phone Call`, `Client Portal Contact`, `Attribution`, `Voice AI`, `Conversation AI`, `Custom Values` and **no `Opportunity` category at all**, checked twice including with an `opportunity_status_changed` trigger already saved, byte-identical both runs. A working token can therefore be entirely absent from the picker. Type the token and fire it rather than concluding from the picker.

#### Text formatter output tokens do not resolve (verified negative)

Same method, same run. Against a seeded 12-character input, every candidate came back empty:

`{{text_formatter.1.length}}` · `.output` · `.response` · `.result` · `.value`

Stored string, verbatim: `L1= L2= L3= L4= L5=`. The formatter node definitely executed: the nodes before and after it in the same workflow both wrote their values.

**Precisely what this proves and does not prove.** It proves the formatter's output is **not reachable by merge token** under any of the five spellings above. It does **not** prove the formatter miscomputes, because there is no way to observe its result without a working output token. "The formatter is broken" and "the formatter works but its output is unreachable this way" are both consistent with the readback. Untested and possibly viable: the If/Else field catalog lists **Text formatter** as a selectable action-output condition source, so branching directly on the output rather than persisting it through a merge token is a different path that has not been tried.

> **Consequence for the GPT-to-formatter-to-If/Else length-cap pattern: it does not work as written.** Persisting the formatter output into a holder field and gating on that field always sees an empty value, so the If/Else always takes the None branch. Any "shorten with AI, else send the fallback" design silently sends the fallback every time, and pays for a GPT call whose output is then always discarded. Treat the pattern as unproven rather than merely the token, and if you need it, test the action-output condition path first rather than another token spelling.

## Premium and billing checks

Every Phase 1 reference states `Premium`, a gate, or the observed billing status near the top. Search the selected reference for:

```bash
rg -n -i "premium|bill|charge|execution" "<reference-file>"
```

Classify the requested workflow before confirmation:

- no premium gate observed;
- premium but safe to configure in Draft;
- premium execution-billed when published/triggered;
- prerequisite/connection gated;
- exact billing unknown: stop and disclose uncertainty.

Examples in the corpus include Workflow AI actions billed per execution, Custom Webhook and Custom Code premium execution charges, email verification usage billing, and copy-contact premium charges. Do not generalize one item's price to another.

Saving a node in Draft does not execute it. Publishing activates triggers and makes executions possible, so explicit publish permission and a billing warning are mandatory.

## Map-on-demand recipe

When no trustworthy reference exists or the reference is gate-only/incomplete:

1. Stop spec authoring for that item; do not guess.
2. Work only on an owned `ZZZ-SPIKE-` Draft in the lab.
3. Open the item panel with Playwright in the owned tab and record fields/options/conditional controls.
4. Configure a harmless representative value. Do not connect paid services, publish, or execute premium behavior.
5. Save using the two-save rule.
6. Extract the workflow detail, triggers, and steps JSON.
7. Write or update `research/phase1/raw/{actions,triggers}/<slug>.md` with the verified shape, data dependencies, premium status, and quirks.
8. Verify it with the Phase 1 harness/protocol.
9. If it is a new structural family, extend the composer and independent verifier with offline tests before building the user's workflow.
10. Resume the original spec only after the mapping is mechanically proven.

## Engine boundaries

The current composer has dedicated support for SMS, email, wait, add/remove tag, notes, if/else, goto, create/update opportunity, assign user, update contact field, internal notification, and find opportunity, plus arbitrary trigger filters and cautious single-node `config.attributes` actions.

It does not automatically reproduce every special side effect represented in the 221-item map. Auto-inserted companion nodes, test-before-save triggers, and connection-gated items require their reference-specific implementation or UI fallback. A reference file proves the GHL shape; it does not by itself prove the current composer can generate that shape.

### Transition families

`find_opportunity` is implemented as a true three-node family and is the worked example to copy when adding another one. **Verified** by a real save: the parent renders with both branch pills on the canvas and downstream nodes execute under the correct branch.

```json
{
  "type": "find_opportunity",
  "name": "Find referral opportunity",
  "config": {
    "sorting": "latest",
    "filters": [{ "field": "pipeline_id", "operator": "eq", "value": "My pipeline" }],
    "found":    { "actions": [] },
    "notFound": { "actions": [] }
  }
}
```

- It is **terminal in its action list**, exactly like `if_else`, because the branches never rejoin. Everything downstream belongs inside `found.actions`. A non-terminal one is rejected at validation rather than silently mis-wired.
- Pass the pipeline **name** in `filters[].value` and it resolves to the location's pipeline ID. A bare ID passes through unresolved.
- The stored filter shape is counterintuitive and is the thing most likely to be typed wrong when reading the Phase 1 reference directly: the **operator** lives in `value` and the comparison value lives in `secondValue`. The spec-level `{field, operator, value}` above hides that inversion, so prefer it over hand-writing `config.attributes`.
- `if_else` nests inside either branch and round-trips correctly.

> **A passthrough `config.attributes` cannot express a transition family, and the failure is silent.** The passthrough returns only the parent's attributes, so the parent saves with a scalar `next` pointing at whatever follows and no transition children at all. The workflow looks plausible and the branch semantics are simply absent. When adding a new family, extend `compose.mjs` **and** `verify-build.mjs` together: `verifyTemplates` ends with a `visitedCount` equality check, so any node the composer creates that the verifier does not walk fails verification. That coupling is deliberate and makes a half-finished family impossible to ship.
