# Workflow spec format

Use this guide to translate a natural-language workflow into the JSON accepted by `scripts/build-workflow.mjs`. The authoritative machine schema is `scripts/spec.schema.json`; existing regression specs are in `research/phase2/specs/`.

## Contents

1. Top-level shape
2. Triggers and filters
3. Actions and branching
4. Name resolution
5. Worked examples
6. Validation checklist

## Top-level shape

```json
{
  "name": "ZZZ-SPIKE-example",
  "folder": null,
  "publish": false,
  "settings": {},
  "triggers": [],
  "actions": []
}
```

Required fields are `name`, `triggers`, and `actions`. At least one trigger is required. `actions` may be empty. `folder` is optional and resolves by exact case-insensitive folder name. Keep `publish:false` unless the user explicitly asks otherwise; the shipped engine intentionally blocks general publishing.

### `settings` (optional)

Workflow-level toggles. **Every key is optional and defaults to the platform default, so omitting `settings` entirely changes nothing.**

| Key | Default | Builder label | Meaning |
|---|---|---|---|
| `allowMultiple` | `true` | **Allow Re-entry** | Whether a contact already enrolled can enrol again |
| `allowMultipleOpportunity` | `true` | **Allow multiple Opportunities** | Whether the workflow runs once *per opportunity* for the same contact |
| `stopOnResponse` | `false` | Stop on response | Halt the workflow when the contact replies |

```json
"settings": { "allowMultiple": false, "allowMultipleOpportunity": false }
```

> **On an OPPORTUNITY-triggered workflow, `allowMultiple: false` is NOT sufficient on its own.** `allowMultipleOpportunity` governs per-opportunity enrolment separately and also defaults `true`, so a contact with a second qualifying opportunity enrols a second instance even with re-entry off. **Set both** whenever a design depends on a contact being unable to re-enter, for example a terminal `Wait` node used as a cooldown gate. Setting only one is a silent bug: the workflow looks correctly configured and still double-enrols.

For lab builds, use location `<locationId>`, workflow prefix `ZZZ-SPIKE-`, and fixture prefix `zzz-spike-`.

## Triggers and filters

A trigger has a native JSON `type`, optional canvas `name`, optional `filters`, and optional `schedule_config`:

```json
{
  "type": "contact_tag",
  "name": "Tag added",
  "filters": [
    {
      "field": "tagsAdded",
      "operator": "index-of-true",
      "value": "zzz-spike-tag",
      "title": "Tag added",
      "type": "select"
    }
  ]
}
```

Do not guess an unfamiliar trigger type or filter. Find its Phase 1 reference as described in `action-map.md` and copy only the spec-facing condition fields, not stored IDs, workflow IDs, location IDs, or active state.

### Filters are stored as `conditions` and are API-writable

The spec calls them `filters`; the trigger document stores them as **`conditions`**. `read-workflow.mjs` reads `trigger.conditions ?? trigger.filters`. A filter is always the same five keys, and this shape has been confirmed live across three different trigger types:

| Trigger type | `field` | `operator` | `value` | `type` |
|---|---|---|---|---|
| `contact_tag` | `tagsAdded` | `index-of-true` | tag name | `select` |
| `opportunity_status_changed` | `status` | `==` | `won` | `select` |
| `form_submission` | `formData.<fieldKey>` | `==` | field value (booleans serialize as real booleans) | `select` |

`title` is the human label shown in the builder. Nothing here is UI-only: `conditions` is a plain array on the document the normal PUT already writes.

### An empty filter list can be silently valid

`TRIGGERS_REQUIRING_FILTERS` (`read-workflow.mjs`) lists the types whose builder rejects an empty filter list. **A type absent from that set accepts `conditions: []` as legitimate**, and the meaning is "match everything".

`form_submission` is one of those. A form trigger with no filter fires on **every form in the location**, saves cleanly, verifies green, and renders normally. The same failure class as a `config.attributes` passthrough: valid to the platform, wrong for the build. If a form workflow should listen to one form, confirm the filter is present rather than trusting a PASS.

> **`formData.<key>` filters on a field's value inside a submission, not on which form was submitted.** The `Form is` filter is a separate, form-ID-based condition whose exact JSON is **not yet captured** (`research/phase1/raw/triggers/form-submitted.md`: the lab had no form, so the picker returned `No Data`). Do not extrapolate a field name for it. Set it once in the UI against a location that has a form, read the trigger back, and record the real shape here.

## Actions and branching

Every action requires `type`. `name` overrides its canvas label. `ref` gives the action a stable spec-local target for `goto`.

Core action configurations:

| Type | Required config | Notes |
|---|---|---|
| `sms` | `body` | Optional `attachments`, template fields. |
| `email` | `subject`, `html` | Optional sender, preheader, attachments. |
| `wait` | positive `value` | Optional `unit`; default is minutes. |
| `add_contact_tag` / `remove_contact_tag` | non-empty `tags[]` | Tag names, not IDs. |
| `add_notes` | `title`, `html` | Optional color. |
| `goto` | `target` | Target is another action's unique `ref`. |
| `create_opportunity` | `pipeline`, `stage` | Resolve names per location. |
| `assign_user` | non-empty `users[]` | Resolve display name or email. |
| `update_contact_field` | non-empty `fields[]` | Each entry has field name/key and value. |
| `internal_notification` | notification payload | User names/emails resolve to IDs. |

An `if_else` must be terminal in its current action list. Each branch needs a name, at least one condition, and an action array. Branches do not implicitly converge. Nest a new `if_else` inside a branch or use a `goto` to an action `ref` when needed.

### Chaining a helper workflow instead of duplicating a tail

When every branch of an `if_else` must run the same long tail, duplicating it into each branch multiplies node count and every later edit has to be made N times. Put the tail in its own workflow and end each branch with an `add_to_workflow` node instead. **Verified 2026-08-11** on a real two-workflow build: both branches persisted with the helper's ID and the read-back document confirmed each branch tail terminal.

`add_to_workflow` has no dedicated composer case, so pass its verified shape through `config.attributes`. `workflow_id` is a **single string** and is **not** name-resolved, so build the helper first and paste its real ID:

```json
{
  "type": "add_to_workflow",
  "name": "Hand off to helper",
  "config": {
    "attributes": {
      "type": "add_to_workflow",
      "workflow_id": "<helper workflow id>",
      "input_trigger_params": false
    }
  }
}
```

Two things decide whether the handoff actually fires:

- **The helper needs its own trigger, and something in the parent must satisfy it.** `add_to_workflow` enrols the contact; it does not bypass the helper's trigger. Pairing the handoff with an `add_contact_tag` immediately before it, and triggering the helper on that tag, is the shape that worked. If the tag write lives in the helper instead, nothing ever fires it.
- **Set the helper's re-entry settings deliberately.** It is a separate workflow with its own `settings` block and its own platform defaults; the parent's settings do not carry over.

```json
{
  "type": "if_else",
  "name": "Has preferred status?",
  "branches": [
    {
      "name": "Yes",
      "operator": "and",
      "conditions": [
        {
          "conditionType": "contact_detail",
          "field": "zzz_spike_field",
          "operator": "==",
          "value": "preferred"
        }
      ],
      "actions": []
    }
  ],
  "else": { "name": "None", "actions": [] }
}
```

## Name resolution

Use location-facing names in specs where the composer explicitly resolves them:

- tags remain names in stored action attributes;
- pipeline and stage names resolve to IDs;
- user display names or emails resolve to IDs;
- custom-field names or field keys resolve to IDs;
- folder names resolve to folder IDs.

Resolution must return exactly one match. Missing or ambiguous names reject before workflow creation.

## Worked examples

### 1. Simple linear follow-up

```json
{
  "name": "ZZZ-SPIKE-simple-follow-up",
  "publish": false,
  "triggers": [
    {
      "type": "contact_tag",
      "filters": [
        { "field": "tagsAdded", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    }
  ],
  "actions": [
    { "type": "sms", "config": { "body": "Thanks for reaching out." } },
    { "type": "wait", "config": { "unit": "minutes", "value": 5 } },
    { "type": "add_contact_tag", "config": { "tags": ["zzz-spike-tag"] } }
  ]
}
```

### 2. Branched workflow with fallback

```json
{
  "name": "ZZZ-SPIKE-branched-follow-up",
  "publish": false,
  "triggers": [
    {
      "type": "contact_tag",
      "filters": [
        { "field": "tagsAdded", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    }
  ],
  "actions": [
    { "ref": "entry", "type": "sms", "config": { "body": "Checking your preference." } },
    {
      "type": "if_else",
      "name": "Preference",
      "branches": [
        {
          "name": "Preferred",
          "conditions": [
            { "conditionType": "contact_detail", "field": "zzz_spike_field", "operator": "==", "value": "yes" }
          ],
          "actions": [
            { "type": "add_contact_tag", "config": { "tags": ["zzz-spike-tag"] } }
          ]
        }
      ],
      "else": {
        "name": "None",
        "actions": [
          { "type": "add_notes", "config": { "title": "No preference", "html": "<p>No preference recorded.</p>" } }
        ]
      }
    }
  ]
}
```

### 3. Multiple triggers

```json
{
  "name": "ZZZ-SPIKE-multi-trigger",
  "publish": false,
  "triggers": [
    {
      "type": "contact_tag",
      "name": "Tag added",
      "filters": [
        { "field": "tagsAdded", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    },
    {
      "type": "contact_tag",
      "name": "Tag removed",
      "filters": [
        { "field": "tagsRemoved", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    }
  ],
  "actions": [
    { "type": "sms", "name": "Multi-trigger entry", "config": { "body": "A tag event reached this workflow." } }
  ]
}
```

### 4. Location lookups by name

```json
{
  "name": "ZZZ-SPIKE-name-lookups",
  "publish": false,
  "triggers": [
    {
      "type": "contact_tag",
      "filters": [
        { "field": "tagsAdded", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    }
  ],
  "actions": [
    {
      "type": "create_opportunity",
      "config": {
        "pipeline": "ZZZ-SPIKE-pipeline",
        "stage": "ZZZ Stage 1",
        "opportunity_name": "Follow-up {{contact.name}}",
        "opportunity_status": "open"
      }
    },
    { "type": "assign_user", "config": { "users": ["Test User"] } },
    {
      "type": "update_contact_field",
      "config": { "fields": [{ "field": "zzz_spike_field", "value": "queued" }] }
    }
  ]
}
```

### 5. Missed-call text-back

The verified trigger reference is `research/phase1/raw/triggers/call-details.md`. Its native type is `call_status`; incoming direction stores `message.direction == inbound`, and production evidence uses `call_status contains-any` for call-result filters.

```json
{
  "name": "ZZZ-SPIKE-missed-call",
  "publish": false,
  "triggers": [
    {
      "type": "call_status",
      "name": "Missed inbound call",
      "filters": [
        { "field": "message.direction", "operator": "==", "value": "inbound", "title": "Call direction", "type": "select" },
        { "field": "call_status", "operator": "contains-any", "value": ["no-answer"], "title": "Call status", "type": "multiselect" }
      ]
    }
  ],
  "actions": [
    { "type": "wait", "name": "Wait 2 minutes", "config": { "unit": "minutes", "value": 2 } },
    { "type": "sms", "name": "Missed-call text", "config": { "body": "Sorry we missed you. How can we help?" } },
    { "type": "add_contact_tag", "name": "Tag missed call", "config": { "tags": ["zzz-spike-missed-call"] } }
  ]
}
```

First run the dry-run. When it reports that the explicitly requested tag is missing, surface the rejection, then create the fixture (lab may proceed; non-lab requires explicit asset-write consent):

```bash
node "$REPO/scripts/ensure-tag.mjs" \
  --name "zzz-spike-missed-call" \
  --location "$LOCATION_ID"
```

Re-run the dry-run after the tag reads back. The engine rejects nonexistent action/trigger tags before writing; do not substitute a different existing tag because that changes the request.

### 6. Deliberately invalid spec

This email omits required `config.html` and must reject cleanly before any workflow is created:

```json
{
  "name": "ZZZ-SPIKE-invalid-email",
  "publish": false,
  "triggers": [
    {
      "type": "contact_tag",
      "filters": [
        { "field": "tagsAdded", "operator": "index-of-true", "value": "zzz-spike-tag" }
      ]
    }
  ],
  "actions": [
    { "type": "email", "config": { "subject": "Missing HTML" } }
  ]
}
```

Expected dry-run error includes `email.config.html is required`. Fix the spec; never weaken validation.

## Validation checklist

- Include a non-empty name, at least one trigger, and an action array.
- Keep lab names and fixtures correctly prefixed.
- Keep `publish:false` unless explicitly requested and supported by policy.
- Use positive wait values. A `wait` duration must be a numeric literal: `config.value` is validated with `typeof value !== 'number'`, so a custom-value token such as `{{custom_values.days_between_asks}}` rejects at compose time even where the panel accepts one. A client-adjustable duration is therefore an install-time UI edit, not a spec value, unless the composer is extended first.
- Remember that `config.attributes` is a fallback for types with NO composer case, not a general escape hatch. `validateSpec` runs first and enforces per-type requirements by `action.type`, so `update_contact_field` with only `config.attributes` fails on `config.fields must not be empty` and never reaches the passthrough. Types that already have a case must use their documented `config`.
- Give every contact-tag trigger at least one filter.
- Use non-empty tag/user/field arrays.
- Make every `ref` unique and every `goto.target` resolvable.
- Keep `if_else` terminal in its current action list.
- Keep `find_opportunity` terminal too, and give it at least one entry in `config.filters`. Its `found` and `notFound` branches carry everything downstream. Full shape in `action-map.md`.
- Ensure every branch has at least one condition and an actions array.
- Resolve location-dependent names uniquely before the write.
- Run `--dry-run` and correct every error before building.
