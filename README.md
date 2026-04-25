# GTM Content Agent

AI agent that generates GTM content — case studies, sales enablement briefs, and event messaging — using Cloudflare Workers AI and Durable Objects.

## Tech Stack

- **Workers AI** — Llama 3.3 70B (hosted on Cloudflare, no API key required)
- **Durable Objects** — persistent conversation state per session
- **Agents SDK** — WebSocket-based agent runtime with scheduling support
- **TypeScript**

## Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers AI enabled

## Local Development

```bash
npm install
npx wrangler dev
```

The agent is available at `http://localhost:8787`.

## Deployment

```bash
npx wrangler deploy
```

## Usage

The agent produces three content types. Before generating anything it will ask for your **target audience**, **product or feature**, and **desired outcome**.

**Technical Case Study** — Structured as Problem → Solution → Measurable Outcome. Every claim is backed by a specific metric or named proof point.

**Sales Enablement Brief** — Covers positioning (why this product wins in the segment), objection handling (top 3–5 objections with evidence-backed responses), and competitive angles vs. named or category competitors.

**Event Messaging** — A keynote hook (≤10 words), session descriptions (150-word max, outcome-first), and a 3-email follow-up arc: recap → value add → CTA.

## Live Demo

https://cf_ai_gtm_agent.shivendra-f0c.workers.dev
