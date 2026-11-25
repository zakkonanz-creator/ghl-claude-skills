# Trigger: Google lead form submitted

- **Screenshot:** `screenshots/b2-024-google-lead-form-submitted.png`
- **Status:** ⛔ integration-gated — no connected Google Ads account/lead form was available.

## Config surface to gate

| UI label | Input type | Options/source | Default | Required | JSON mapping | Notes |
|---|---|---|---|---|---|---|
| WORKFLOW TRIGGER NAME | text | free text | `Google Lead Form Submitted` | yes | inferred / uncaptured | Default panel captured. |
| Ad Account Is | integration-backed picker | connected Google Ads accounts | none | yes | inferred / uncaptured | Picker had no configured account. |
| Lead Form | dependent picker | mapped forms for selected account | none | yes | inferred / uncaptured | Not reachable before account selection. |

## Gate evidence

- The panel reached the required `Ad Account Is` selector, but the prerequisite connection/mapping was absent. No OAuth connection was made, no trigger was saved, and no JSON is claimed.
- Runtime prerequisites: Google Ads OAuth with admin access, mapped lead-form fields, and Active lead sync. A mapped submission creates a CRM contact. Source: https://help.gohighlevel.com/support/solutions/articles/155000006989

## Verified JSON
<!-- verify: gated=true workflowId=00000000-0000-4000-8000-000000000177 nodeId=none kind=trigger -->
> **GATED STUB — non-machine-checkable-by-design.** No trigger was saved because: no Google Ads account or lead form was connected and mapped.
