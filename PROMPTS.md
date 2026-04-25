# Prompts Used to Build This Project

Claude Code (Sonnet 4.6) was used as the AI coding assistant throughout the development of this project. Every prompt below was entered directly into Claude Code in sequence, building the agent incrementally from scaffold to deployed product. No manual code was written outside of what Claude Code produced in response to these prompts.

---

## 1. Project Scaffold

```
Initialize a new Cloudflare Workers project called cf_ai_gtm_agent using the
agents-starter template. Set up wrangler.toml with a Durable Object binding
named GTM_AGENT pointing to a class called GTMAgent, enable Workers AI with
an AI binding, set the assets directory to ./public, and add an SQLite
migration for GTMAgent.
```

Created `wrangler.toml` with Durable Object bindings, Workers AI config, and asset routing; scaffolded the full project structure from the agents-starter template.

---

## 2. Agent Core

```
In src/server.ts, set the GTMAgent system prompt to a B2B GTM content agent
that produces three content types — technical case studies, sales enablement
briefs, and event messaging — with strict output rules (no vague benefits,
skimmable structure, audience-matched vocabulary). Switch the model to
@cf/meta/llama-3.3-70b-instruct-fp8-fast via the Workers AI provider.
```

Updated `GTMAgent.onChatMessage` with the full GTM system prompt and swapped the model binding to Llama 3.3 70B on Workers AI.

---

## 3. Fetch Routing

```
In src/server.ts, update the fetch handler to: serve static assets for GET /,
route WebSocket upgrade requests at /agent to the GTMAgent Durable Object
using idFromName() with a session query parameter (default to "default" if not
provided), and return a 404 Response for all other routes. Export GTMAgent
from the file.
```

Produced the final `fetch` export in `server.ts` with explicit routes for `/`, `/agent` WebSocket upgrades, and a 404 fallback.

---

## 4. Chat UI

```
Create public/index.html as a single-file chat UI. Use Cloudflare's orange
(#f6821f) brand color and a dark theme (#0f0f0f background). It should:
connect to the agent via WebSocket at /agent?session={uuid generated with
crypto.randomUUID()}, display user and assistant messages as chat bubbles
(user bubbles right-aligned in orange, assistant bubbles left-aligned in dark
gray #1e1e1e with a subtle border), show a "Agent is thinking..." typing
indicator while waiting for response, send messages on Enter key press or Send
button click, and include a Clear Session button in the header. Header should
read "GTM Content Agent" with subtext "Powered by Cloudflare Workers AI +
Durable Objects". The first message shown on load should be an assistant bubble
explaining the three content types it can generate.
```

Produced `public/index.html` — a fully self-contained vanilla HTML/CSS/JS chat interface with WebSocket streaming, live text delta rendering, auto-resizing textarea, and session management.

---

## 5. README

```
Create README.md in the project root for cf_ai_gtm_agent. Include: a title
and one-line description, a Tech Stack section listing Workers AI with
Llama 3.3, Durable Objects for persistent state, Agents SDK, and TypeScript,
a Prerequisites section listing Node.js 18+, Wrangler CLI, and a Cloudflare
account with Workers AI enabled, a Local Development section with exact
commands (npm install, npx wrangler dev), a Deployment section with exact
commands (npx wrangler deploy), a Usage section explaining the three content
types and that users should provide target audience, product, and desired
outcome, and a Live Demo placeholder line. Keep formatting clean with no
excessive nesting.
```

Replaced the boilerplate agents-starter README with a clean project-specific document covering setup, deployment, and usage.

---

## Tools Used

- **Claude Code v2.1.120** — AI coding assistant (Sonnet 4.6)
- **Cloudflare Workers AI** — Llama 3.3 70B inference
- **Cloudflare Agents SDK** — Durable Object agent runtime
- **Wrangler CLI** — local dev and deployment
