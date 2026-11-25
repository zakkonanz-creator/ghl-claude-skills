# Action: Invoke agent in agent studio

- **UI name:** Invoke agent in agent studio · **Category:** Agent Studio · **Priority:** LONG_TAIL
- **Native picker type:** `agent_studio_execution`
- **Screenshots:** `screenshots/b8-011-invoke-agent-in-agent-studio.png`, `screenshots/b8-011-invoke-agent-agent-picker.png`
- **Status:** ⛔ fixture/feature-gated — SELECT AGENT opens `No Data`; no Production Workflow-trigger Agent Studio agent is available

## Gate-visible and documented fields

| UI label | Input type | Options / source | Required | JSON mapping | Notes |
|---|---|---|---|---|---|
| ACTION NAME | text input | free text | no | inferred / uncaptured | Live default `Invoke agent in agent studio`. |
| SELECT AGENT | select | Production Agent Studio agents with Workflow trigger | yes | inferred / uncaptured | Live picker returned exact empty-state `No Data`. |
| ATTACHMENTS | radio group | System upload, Media library, URL | no | inferred / uncaptured | System upload selected by default. |
| System upload | file upload | JPG, PNG, GIF and more | conditional | inferred / uncaptured | Live copy: click to upload or drag and drop. No file uploaded. |
| Media library | media picker | location media | conditional | inferred / uncaptured | Not opened. |
| URL | URL input | external attachment URL | conditional | inferred / uncaptured | Not opened. |
| MESSAGE | text input with merge values | free text / dynamic value | no | inferred / uncaptured | Placeholder `Message to Agent`. |
| Input Variables | agent-defined mapping | required inputs from selected agent | conditional | inferred / uncaptured | Not rendered until an agent is selected. Required agent inputs must be populated. |
| Store Output As | output destination | workflow output variable | conditional | inferred / uncaptured | Not rendered until an agent is selected. |

## Gate evidence

The native picker row ID is `cmp-act-opt__dv--add-action-agent_studio_execution`. The action panel itself opens, but the mandatory agent catalog is empty (`No Data`), so the action cannot be saved and no node JSON is claimed. No Agent Studio agent was created or promoted, no AI Employee feature was enabled, and no pay-per-use execution occurred.

## Runtime and billing

- Only agents promoted to **Production** with the **Workflows** trigger appear; draft/staging agents do not.
- Invocation is synchronous with a hard 60-second timeout; failure is visible in workflow logs.
- Agent Studio requires the AI Employee add-on and is billed pay-per-use for tokens and tools such as web search, with no separate workflow surcharge and no inclusion in a subscription plan.

Official behavior source: `OFFICIAL-DOCS-NOTES.md` (B8 Invoke agent in agent studio).
