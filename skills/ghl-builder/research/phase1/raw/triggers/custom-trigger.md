# Trigger: Custom trigger

- **Screenshot:** `screenshots/b2-004-custom-trigger.png`
- **Premium:** yes, per execution
- **Status:** ⛔ marketplace-gated — no corresponding installed Marketplace trigger implementation was available/configured.

## Config surface to gate

| UI/control | Input type | Options/source | Required | JSON mapping | Notes |
|---|---|---|---|---|---|
| Custom trigger | trigger picker item | Events catalog | yes | inferred / uncaptured | Generic entry point; concrete schema comes from an installed Marketplace app. |
| Marketplace app | app picker/search | installed/available Marketplace apps | yes | inferred / uncaptured | Protocol forbids installing/connecting an external app. |
| Filters/custom variables | developer-defined from sample payload | app-specific | app-specific | inferred / uncaptured | No universal writable JSON schema exists for this generic gate. |

## Gate evidence

- Screenshot shows the native `Custom trigger` entry plus Marketplace app results. A concrete trigger only appears/configures after its app is installed, so no saved trigger ID exists and no `Verified JSON` is claimed.
- Marketplace Workflow Triggers can be contactless and use the developer's sample payload for filters/variables. They are LC Premium and charge per execution. Source: https://help.gohighlevel.com/support/solutions/articles/155000001024
- No app, premium billing, or workflow publish setting was enabled.

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: no corresponding Marketplace trigger implementation was installed or configured.
