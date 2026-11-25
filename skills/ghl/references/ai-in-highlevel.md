# AI in HighLevel: native features, MCP, and APIs for agents

Checked 2026-11-25. Every bullet ends with (source, date seen). "Last modified" dates are the date shown on the official page. HighLevel ships weekly; re-check anything that drives money or customer-facing behavior.

## Routing: which feature or API for which job

| Job | Use | Notes |
|---|---|---|
| An external agent (Claude, Cursor, Codex) reads or changes CRM data | Official MCP server, per-client OAuth endpoint (`/mcp/anthropic/v2` for Claude) | Broadest coverage; discovery tools, not one tool per action |
| Same, but with a Private Integration Token (headless, no OAuth) | Legacy MCP endpoint `/mcp/` with `Authorization` + `locationId` headers | Limited fixed tool set (36 tools listed) |
| Create, validate, publish or read logs of a workflow from code | Workflows API (`Version: v3`), private beta per sub-account | 403 `WORKFLOW_API_NOT_ENABLED_FOR_LOCATION` until support enables it |
| Build a workflow from a prompt inside the app | Workflow AI Builder | Free, fair use |
| AI decision/summary/translate step inside a workflow | Workflow AI Actions | $0.01 per execution |
| Hand a multi-step task to an agent from a workflow | "Invoke Managed Agent" workflow action | Agent needs the "Invoked from a workflow" trigger and must be published |
| Chat/SMS/DM bot that answers, qualifies, books | Conversation AI (UI or Conversation AI public API) | |
| Phone agent (inbound/outbound) | Voice AI (UI or Voice AI public API) | Per-minute pricing on pay-per-use |
| Autonomous back-office agent described in plain language | Managed Agents (Agent Studio), Managed Agents API | Billed by tokens |
| Node-based flow agent | Agent Studio flow agents ("Flow Agents" API) | Pay-per-use even on Unlimited |
| Grounding answers in business content | Knowledge Base (UI and API) | Free, fair use |
| Review replies | Reviews AI | |
| Pages, sites, forms built by chat | AI Studio (Labs), Funnel & Website AI | |
| In-app copilot for logged-in users | Ask AI | |

## 1. Native AI ("AI Employee") features

### What each part does
- Ask AI: in-app copilot for logged-in users that answers questions, retrieves data and creates assets. (https://help.gohighlevel.com/support/solutions/articles/155000002166-ai-tools-in-highlevel, last modified 2026-10-27, seen 2026-11-25)
- Conversation AI: messaging agent that answers questions, qualifies leads and helps book appointments. (same source, 2026-11-25)
- Conversation AI Prompt Optimizer (Labs): tests a cloned Conversation AI agent against scenarios and suggests prompt fixes. (same source, 2026-11-25)
- Voice AI: inbound and outbound phone agent that qualifies leads and books appointments; separate phone charges may apply. Has its own Prompt Optimizer that runs test calls. (same source, 2026-11-25)
- Agent Studio: visual, node-based environment to edit, test and version flow-based agents. (same source, 2026-11-25)
- Managed Agents: autonomous CRM agents created from a plain-language description of their role (formerly "Super Agents"). (same source; https://help.gohighlevel.com/support/solutions/articles/155000007931-setup-and-use-managed-agents-in-agent-studio, 2026-11-25)
- Workflow AI Builder: generates and edits standard workflows from natural-language prompts. Voice dictation works in the Workflow AI Builder and the in-builder AI Assistant. (https://help.gohighlevel.com/support/solutions/articles/155000002166-ai-tools-in-highlevel; https://help.gohighlevel.com/support/solutions/articles/155000007418-voice-dictation-in-ai-builder-assistant, 2026-11-25)
- The exact button label "Build using AI" in Workflows comes only from third-party tutorials: unconfirmed in official docs. (https://agentiveaiagents.com/gohighlevel-ai-automation-tutorial/, 2026-11-25)
- "Build with AI" inside the Custom Code action generates JavaScript for that one action only; it is not the Workflow AI Builder. (https://help.gohighlevel.com/support/solutions/articles/155000004692-how-to-generate-custom-code-with-ai-in-workflows, 2026-11-25)
- Workflow AI Actions: Decision Maker, Intent Detection, Summarize Text, Translate, used inside automations. (https://help.gohighlevel.com/support/solutions/articles/155000002166-ai-tools-in-highlevel, 2026-11-25)
- Funnel & Website AI (Labs), Email AI (Labs), Content AI (text and images across builders), Reviews AI (suggested or automated review replies plus insights). (same source, 2026-11-25)
- AI Studio (Labs): conversational workspace that builds websites, landing pages, forms and booking experiences. (same source, 2026-11-25)
- Knowledge Base: stores approved business content (sites, FAQs, files, tables) that supported AI tools answer from. (same source, 2026-11-25)
- Skills Platform: the capability layer behind HighLevel's agents (read/update CRM, book, search knowledge base, call external services), with per-skill permissions. Not a separate product or API; configured inside Voice AI, Conversation AI and Agent Studio. (https://help.gohighlevel.com/support/solutions/articles/155000008315-skills-platform-for-ai-agents, last modified 2026-11-08, seen 2026-11-25)

### Plans and pricing (per sub-account, per month)
- Pricing model: pay-per-use by default, or an AI Employee plan. Starter $20 (only for agencies on the $497 plan; base Ask AI/AI Studio/Creator Studio usage, Content AI unlimited, no Conversation AI or Voice AI allowance). Growth $50 (1,000 Conversation AI responses, 100 Voice AI minutes, Reviews AI unlimited, 100 Managed Agent runs, 2x Ask AI/AI Studio usage). Unlimited $97 (Conversation AI, Voice AI, Reviews AI and both Prompt Optimizers unlimited under fair use, 1,000 Managed Agent runs, 5x Ask AI/AI Studio usage). (https://help.gohighlevel.com/support/solutions/articles/155000006652-ai-product-pricing, last modified 2026-11-23, seen 2026-11-25)
- Conversation AI pay-per-use is billed by model tokens; example rates per 1M tokens input/output: GPT 5 Mini $0.25/$2.00, GPT 5 $1.25/$10.00, Claude Haiku 4.5 $1.10/$5.50. (same source, 2026-11-25)
- Voice AI pay-per-use: voice engine $0.045/min (from 2026-05-20) plus TTS ($0.015 to $0.17/min by voice) or speech-to-speech ($0.10 to $0.20/min), plus LLM tokens and phone charges. (same source, 2026-11-25)
- Agent Studio flow agents: pay-per-use even on Unlimited (e.g. GPT-5 $1.25/$10.00 per 1M tokens, web search $0.01, Veo3 video $0.40/s). (same source and https://help.gohighlevel.com/support/solutions/articles/155000002166-ai-tools-in-highlevel, 2026-11-25)
- Managed Agents: billed by tokens consumed, 30 free test runs/month; no per-token rate published in the article. (https://help.gohighlevel.com/support/solutions/articles/155000006652-ai-product-pricing, 2026-11-25)
- Reviews AI: $0.01 per AI reply sent; up to four suggestions per review free. (same source, 2026-11-25)
- Workflow AI Actions: $0.01 per execution. Workflow AI Builder: free, fair use. (same source, 2026-11-25)
- Free for all users under fair use: Funnel & Website AI, Email AI, Calendar AI, Layout AI, Knowledge Base, Workflow AI Builder, Generate with AI. Agency-level users get Ask AI, AI Studio, Creator Studio and Content AI free. (same source, 2026-11-25)
- Doc caveat: the pricing article lists one Voice AI model twice at different prices; confirm rates in-app before quoting. (same source, 2026-11-25)

### Launched or changed Aug to Nov 2026
- 2026-11-25: Managed Agents meeting triggers (run before/after a meeting); Suggested Replies in Managed Agents chat (never auto-sent); Conversation AI now pauses when a team member replies from outside HighLevel (e.g. Meta Business Suite), email replies excepted. (https://ideas.gohighlevel.com/changelog, 2026-11-25)
- 2026-11-23: AI Studio model picker (Claude, GPT or Gemini per message, or Auto), beta. Managed Agents can use Media Library images. (https://ideas.gohighlevel.com/changelog, 2026-11-25)
- Late Oct 2026, LevelUp Day post (2026-10-27): Managed Agents gained inbound webhook triggers, waits and scheduled follow-ups, memory and learned procedures, subagent delegation, a computer environment (browse, files, terminal, with approvals), n8n import (beta); agent health monitoring for Voice and Conversation AI; clone Voice AI agents to sub-accounts; Conversation AI flow-based builder, rich elements and MCP server support (bots call external MCP tools); Voice AI MCP connector for speech-to-speech models, WhatsApp calls, agent versioning with draft testing; Ask AI document generation and agency per-skill permissions; Workflows MCP (private beta); Project Management MCP (private beta). Launch status per item varies; check in-app. (https://www.gohighlevel.com/post/levelup-day-2026-the-next-evolution-of-highlevel-features-and-enhancements, 2026-11-25)
- 2026-09-24 (last modified): "Invoke Managed Agent" workflow action. (https://help.gohighlevel.com/support/solutions/articles/155000008858-workflow-action-invoke-managed-agent, 2026-11-25)
- Third-party roundups also report Nov 2026 Managed Agents video understanding and scheduled routines, and a Nov 3 default-model change for prompt-based agents: unconfirmed against official pages. (https://netpartners.marketing/highlevel-updates-week-november-16-20-2026/; https://gohighlevelagencydirectory.com/updates/november-2026/, 2026-11-25)

## 2. Official MCP server

- Per-client OAuth endpoints: Claude (claude.ai, Cowork, Claude Code) `https://services.leadconnectorhq.com/mcp/anthropic/v2`; ChatGPT `.../mcp/openai/v2/`; Codex `.../mcp/openai/v2/codex`; Cursor `.../mcp/cursor/v2`. Sign in with HighLevel, pick sub-accounts, approve; "No API key to create or paste." (https://marketplace.gohighlevel.com/docs/other/mcp, seen 2026-11-25)
- v2 tools: 4 discovery tools, `list_locations`, `search_operations`, `describe_operation`, `execute_operation` (can preview without sending). Page states 717 supported actions across 38 feature areas. (same source, 2026-11-25)
- Docs conflict: the Anthropic help article describes a 5-tool facade (`search`, `fetch`, `search_operations`, `describe_operation`, `execute_operation`), 625 operations (571 active) across 40 domains, and says other clients were "in development". It is older; treat the marketplace page as current. (https://help.gohighlevel.com/support/solutions/articles/155000008391-highlevel-mcp-for-anthropic-increased-scopes, last modified 2026-08-07, seen 2026-11-25)
- One connection = one location, never agency-wide; the Anthropic endpoint uses OAuth Authorization Code with PKCE and refresh tokens. (same help article, 2026-11-25)
- Legacy universal endpoint `https://services.leadconnectorhq.com/mcp/` stays supported, works with OAuth or a Private Integration Token, headers `Authorization: Bearer <PIT>` and `locationId: <id>`, with a limited subset of operations. (https://help.leadconnectorhq.com/support/solutions/articles/155000008185-mcp-server-connect-ai-agents-to-your-account, last modified 2026-09-13; Anthropic help article above, seen 2026-11-25)
- Legacy endpoint tool list (36): calendars 2, contacts 8, conversations 3 (incl. send message), locations 2, opportunities 4, payments 2 (read), blogs 7, email templates 2, social posting 6. List "may change". (help.leadconnectorhq.com article above, 2026-11-25)
- Claude setup: claude.ai Settings > Connectors > Add custom connector with the URL; Claude Code `claude mcp add --transport http highlevel https://services.leadconnectorhq.com/mcp/anthropic/v2` then `/mcp` to authenticate. (https://marketplace.gohighlevel.com/docs/other/mcp, 2026-11-25)
- Official Claude connector directory listing: none found. HighLevel docs only describe the custom-connector route; third-party sources say HighLevel is not in Claude's directory, and a third-party connector that is listed is not HighLevel's. Unconfirmed either way from an Anthropic source. (https://marketplace.gohighlevel.com/docs/other/mcp; https://notfair.co/gohighlevel-claude-connector-setup-guide, 2026-11-25)
- New actions appear through the same discovery tools; new permissions need re-approval and sometimes a new chat. No dated list of recent additions is published. (https://marketplace.gohighlevel.com/docs/other/mcp, 2026-11-25)

## 3. Public API changes relevant to agents (2026)

### Workflows API (Version v3)
- Private beta "for selected sub-accounts"; request access from HighLevel Support. Not enabled = 403 `WORKFLOW_API_NOT_ENABLED_FOR_LOCATION`. (https://help.gohighlevel.com/support/solutions/articles/155000009502-workflows-api-create-publish-and-monitor-workflows-by-api, last modified 2026-10-30, seen 2026-11-25)
- Host `services.leadconnectorhq.com`; every request needs the token, `Version: v3` and the sub-account `locationId`. Token: Private Integration with workflow scopes. (same source, 2026-11-25)
- Scopes: `workflows.readonly`, `workflows.write`, `workflows.publish`, `workflows.delete`, `workflows.logs`. (same source, 2026-11-25)
- Endpoints (10, all added 2026-10-19): `GET /workflows/step-types`, `POST /workflows/definition/validate`, `POST /workflows/search`, `POST /workflows/`, `GET|PUT /workflows/{id}/definition`, `PUT /workflows/{id}/status`, `DELETE /workflows/{id}`, `GET /workflows/{id}/logs`, `GET /workflows/{id}/logs/aggregate`. (same source; https://marketplace.gohighlevel.com/docs/Changelog/, 2026-11-25)
- Behavior: new workflows start as draft; publish with `PUT .../status` body `{"status":"published"}`; validate returns errors (block) and warnings without saving; return to draft before editing; send the current version (stale writes rejected); a definition PUT replaces the whole definition. (help article above, 2026-11-25)
- Logs: enrollments, executed steps, failures, per-contact status; ranges up to 30 days over 60 days of history. Cannot add/remove contacts here (use the Contacts API). (same source, 2026-11-25)
- Rate limits per sub-account: reads 30/10s, writes 10/10s, logs 20/10s and 60/min, log stats 5/10s, 10/min, 1,000/day; standard API 100/10s and 200,000/day; 429 on excess. (same source, 2026-11-25)
- "Workflows MCP" is a separate private beta named at LevelUp; details unconfirmed. (https://www.gohighlevel.com/post/levelup-day-2026-the-next-evolution-of-highlevel-features-and-enhancements, 2026-11-25)

### AI agent APIs
- Conversation AI public API: create, search, update, get, delete agents; attach/list/update/remove actions; update follow-up settings; get generation details. Auth via Private Integration Token (server-to-server) or JWT/OAuth; sub-account-level tokens. Paths not in the article. (https://help.gohighlevel.com/support/solutions/articles/155000006639-conversation-ai-public-api, last modified 2026-05-29, seen 2026-11-25)
- Voice AI public API: create/update/list/get agents, manage agent actions, call logs with transcripts (filter by agent, contact, call type, action type, date); webhooks deliver call outcomes, transcripts, summaries. Knowledge base in actions and a Voices API were listed as "coming next"; whether shipped is unconfirmed. (https://ideas.gohighlevel.com/changelog/voice-ai-public-apis; https://marketplace.gohighlevel.com/docs/ghl/voice-ai/create-agent/, 2026-11-25)
- Agent Studio "Flow Agents" API: create, list, get, update (by versionId), update metadata, delete, promote to production, execute. Current execute is `POST /agent/:agentId/execute` (non-streaming JSON, agent must be active, `locationId` in body; pass back `executionId` to continue a session); `/agent-studio/public-api/agents/...` routes are deprecated. (https://marketplace.gohighlevel.com/docs/ghl/agent-studio/agents/index.html; https://marketplace.gohighlevel.com/docs/ghl/agent-studio/execute-agent-deprecated, 2026-11-25)
- Managed Agents API: build agents from natural language (including subagents), update, check publish readiness, publish or pause; executions run through the existing execute API. Create/publish/unpublish free, runs billed. Available to all sub-accounts via Private Integrations with a Managed Agents build-and-publish permission. Exact paths unconfirmed (docs page did not load). (https://ideas.gohighlevel.com/changelog/introducing-managed-agents-api-build-manage-publish-agents-programmatically, 2026-11-25)
- Knowledge Base API: developer changelog lists `/knowledge-base/` routes (crawler, FAQs, files) plus newer `/knowledge-bases` routes, both working. Reported via search summary of the changelog; not read directly. Unconfirmed detail. (https://marketplace.gohighlevel.com/docs/Changelog/, 2026-11-25)
- Custom objects API: no 2026 AI-related change found; not verified this pass. (https://marketplace.gohighlevel.com/docs/Changelog/, 2026-11-25)
- No separate public Skills Platform API; use the agents APIs or expose your own API/MCP tools. (https://help.gohighlevel.com/support/solutions/articles/155000008315-skills-platform-for-ai-agents, 2026-11-25)

### Tokens: OAuth vs Private Integration Token
- Private Integration Token: created in sub-account Settings > Private Integrations with chosen scopes; used by the Workflows API, Conversation AI API, Managed Agents API and the legacy `/mcp/` endpoint. (Workflows API help article; Conversation AI API help article; Managed Agents changelog, all 2026-11-25)
- OAuth: required by the per-client MCP v2 endpoints (sign-in flow, PKCE); JWT/OAuth app flows are an option for the Conversation AI API. (https://marketplace.gohighlevel.com/docs/other/mcp; Conversation AI API help article, 2026-11-25)
- Docs conflict: third-party guides disagree on whether a PIT works on the v2 MCP endpoints; official pages describe v2 as sign-in only. Treat PIT on v2 as unsupported. (https://marketplace.gohighlevel.com/docs/other/mcp, 2026-11-25)

## 4. Other things agents can do now
- Call a Managed Agent mid-workflow and use its response as a dynamic value in later steps (Invoke Managed Agent action). (https://help.gohighlevel.com/support/solutions/articles/155000008858-workflow-action-invoke-managed-agent, 2026-11-25)
- Start a Managed Agent from an external system through its unique inbound webhook URL; schedule waits and follow-ups. (https://www.gohighlevel.com/post/levelup-day-2026-the-next-evolution-of-highlevel-features-and-enhancements, 2026-11-25)
- Give Conversation AI bots and Voice AI speech-to-speech agents external tools via MCP servers. (same source, 2026-11-25)
- Receive Voice AI call outcomes, transcripts and summaries by webhook. (https://ideas.gohighlevel.com/changelog/voice-ai-public-apis, 2026-11-25)
- Bring-your-own LLM key inside workflows: unconfirmed. No official page found; one third-party source says there is no settings screen for an OpenAI key and recommends a webhook to your own service. Workflow AI Actions bill external models "by their provider", which suggests some external-model path, details unconfirmed. (https://authorityentrepreneurs.com/integrations/ghl-openai/; https://help.gohighlevel.com/support/solutions/articles/155000002166-ai-tools-in-highlevel, 2026-11-25)
- A legacy "GPT powered by OpenAI" workflow action is described by third parties; current name and status unconfirmed. (https://consultevo.com/gohighlevel-gpt-workflow-action-guide/, 2026-11-25)
