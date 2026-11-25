# Trigger: Conversation AI trigger

- **Screenshot:** `screenshots/b2-003-conversation-ai-trigger.png`
- **Status:** ⛔ workflow-structure gated — the live builder reported `Cannot add agent trigger along with the other triggers`.

## Config surface to gate

| UI/control | Input type | Options/source | Required | JSON mapping | Notes |
|---|---|---|---|---|---|
| Conversation AI trigger | trigger picker item | Native Events catalog | yes | inferred / uncaptured | Selection is blocked when the workflow already contains other trigger types. |
| Bot Goal condition | bot-side natural-language condition | Conversation AI bot configuration | runtime prerequisite | inferred / uncaptured | The bot goal targets a published workflow; no trigger panel/saved node was reachable in this batch workflow. |

## Gate evidence

- The screenshot records the searched trigger and the builder's incompatibility message. No trigger JSON is claimed because no node was created; inventing a `Verified JSON` block would violate the read-back rule.
- The bot-side “Trigger a Workflow” goal fires a published workflow when its natural-language condition matches. Overlapping conditions conflict, and targeting a workflow that already has the same trigger can double-execute. Sources: https://help.gohighlevel.com/support/solutions/articles/155000004098 and https://help.gohighlevel.com/support/solutions/articles/155000002292
- Workflow remained Draft; no bot or billing setting was changed.

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: the builder rejected an agent trigger alongside the workflow's other triggers.
