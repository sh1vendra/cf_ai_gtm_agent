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

## 3. Chat UI

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

## 4. WebSocket Debugging

```
The Send button in public/index.html is not working. Debug the WebSocket
connection and message sending logic. Check that the WebSocket URL is correct,
the message format matches what the Cloudflare agents SDK expects, and the send
button onclick handler is properly wired. Fix whatever is broken and ensure
messages can be sent and responses stream back correctly.
```

Diagnosed two issues: incorrect WebSocket URL path (needed `/agents/gtm-agent/:sessionId` to match `routeAgentRequest` routing) and missing `cf_agent_use_chat_request` message envelope format required by `AIChatAgent`. Fixed both.

---

## 5. Remove All Tools

```
The AIChatAgent from @cloudflare/ai-chat has built-in scheduling tools
(getScheduledTasks, scheduleTask, etc.) that the model keeps invoking instead
of generating text responses. In src/server.ts, override the tools property on
GTMAgent to return an empty array, and remove any scheduling-related imports
that are no longer needed. The goal is a pure chat agent with no tools — just
LLM text responses.
```

Removed all tool definitions, scheduling imports, and the `executeTask` method from `GTMAgent`. Agent now returns only text responses via `streamText`.

---

## 6. UI Redesign — Cloudflare Visual Identity

```
Redesign public/index.html to match Cloudflare's visual identity:
- Light theme default with dark mode toggle (persisted to localStorage)
- CSS custom properties for all colors with html.dark overrides
- Inter font from Google Fonts
- Header: orange left border bar (4px solid #f6821f), Cloudflare logo left
  of title, dark mode toggle and Clear button right-aligned
- Quick Start pills bar: "Case Study", "Sales Brief", "Event Messaging" pills
  that fill the textarea with a starter prompt on click
- User bubbles: orange background (#f6821f), white text, right-aligned
- Assistant bubbles: light gray (#f5f5f5 / #1c1c1c dark), left-aligned,
  bordered, markdown-rendered via innerHTML
- Markdown renderer (no libraries): h1–h3, ul, ol, bold, italic, inline code
- Input area: pill-shaped border with orange focus ring, transparent textarea,
  orange rounded Send button
- Keep all WebSocket protocol logic intact
Deploy after.
```

Complete rewrite of `public/index.html`. Added CSS custom properties, Inter font, dark mode toggle with localStorage persistence, content-type pills with starter prompts, markdown renderer, and pill-shaped input row. All WebSocket code preserved.

---

## 7. Cloudflare Logo in Header

```
Add the Cloudflare logo to the top left of the header. Use this official SVG
logo inline: the Cloudflare orange cloud icon. Fetch it from
https://cf-assets.www.cloudflare.com/... as an img tag with height 32px,
placed left of the "GTM Content Agent" text in the header.
Keep all existing functionality intact.
```

Added `<img>` tag for Cloudflare logo in `.header-wordmark`. Logo URL was blocked by CSP/CORS — replaced in next prompt with inline SVG.

---

## 8. Inline SVG Cloud Logo

```
The Cloudflare logo image in public/index.html is broken. Replace the img tag
with this inline SVG cloud logo instead — use the Cloudflare orange cloud
shape as an inline SVG directly in the HTML, no external URL needed. The cloud
should be orange (#f6821f), roughly 40px wide, placed left of the "GTM Content
Agent" text in the header.
```

Replaced broken `<img>` with an inline `<svg>` cloud shape in Cloudflare orange. No external dependencies.

---

## 9. Token Limit and Ordered List Fix

```
In src/server.ts, increase max_tokens from 1024 to 2048 so responses don't
get cut off. Also in public/index.html, fix the markdown renderer so ordered
lists (lines starting with "1. ", "2. ", "3. " etc.) render as proper HTML
ol/li elements instead of repeating as "1.". Commit and deploy after.
```

Added `maxTokens: 2048` to `streamText`. Fixed ordered list renderer to tolerate blank lines between items — the root cause was LLMs emitting blank lines between list items, splitting them into separate `<ol>` elements each restarting at 1.

---

## 10. h4/h5 Headings and Token Increase

```
In public/index.html, fix the markdown renderer to handle #### (h4) and
##### (h5) headings in addition to ### and ##. Also the response is still
getting cut off — check if max_tokens was actually updated in src/server.ts
and increase it to 4096. Commit and deploy.
```

Added h4/h5 matching (before h3 to prevent shorter patterns winning), CSS rules for both heading levels, and bumped `maxTokens` to 4096.

---

## 11. System Prompt and List Rendering Fix

```
The Llama 3.3 model on Workers AI keeps cutting off responses mid-sentence
regardless of max_tokens. Fix this by updating the system prompt in
src/server.ts to add: "Always complete your full response. Never stop
mid-sentence. Keep each section concise — maximum 3 bullet points per section
— so the full response fits within token limits." Also the model outputs "1."
for every list item instead of sequential numbers. Fix this in the system
prompt by adding: "Use bullet points with - instead of numbered lists." Then
update the markdown renderer in public/index.html to convert lines starting
with "* " or "- " to proper ul/li HTML. Commit and deploy.
```

Updated system prompt: converted content-type definitions from numbered to bullet points, added completion and conciseness rules. Applied blank-line tolerance to the unordered list renderer (same fix as ordered lists).

---

## 12. README

```
Rewrite README.md to be professional and compelling. Structure it as follows:
[title, one-line description, The Problem, Solution, Tech Stack table,
Architecture, Live Demo, Getting Started with prerequisites/dev/deploy,
AI Development section referencing PROMPTS.md]. Keep formatting clean, use
proper markdown headers, and make it feel like a real shipped product.
Commit and push after.
```

Replaced boilerplate README with a structured project document covering problem, solution, tech stack table, architecture, live demo, setup instructions, and AI development attribution.

---

## Tools Used

- **Claude Code** — AI coding assistant (Sonnet 4.6)
- **Cloudflare Workers AI** — Llama 3.3 70B inference at the edge
- **Cloudflare Agents SDK** — Durable Object agent runtime and WebSocket routing
- **Wrangler CLI** — local development and deployment
