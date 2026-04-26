# GTM Content Agent

An AI-powered GTM content generation agent built on Cloudflare's edge infrastructure — purpose-built to help B2B tech sales and marketing teams produce case studies, sales enablement briefs, and event messaging at scale.

## The Problem

GTM teams at B2B tech companies spend hours manually writing case studies, sales briefs, and event content. The output is inconsistent, slow to produce, and rarely reused effectively. This project automates that workflow using a conversational AI agent that understands GTM context and produces structured, metric-driven content on demand.

## Solution

A chat interface where users describe what they need, the agent asks clarifying questions (audience, product, desired outcome), then generates structured GTM content instantly. Persistent conversation state means the agent remembers context across the session and can iterate on content without losing prior turns.

## Tech Stack

| Layer | Technology |
|---|---|
| LLM Inference | Workers AI — Llama 3.3 70B, running at the edge |
| Session State | Durable Objects — persistent conversation history and WebSocket management |
| Agent Runtime | Cloudflare Agents SDK — routing, orchestration, and MCP support |
| Implementation | TypeScript + HTML/CSS — full-stack, zero external dependencies |

## Architecture

The agent runs entirely on Cloudflare's edge network. Each user session is backed by a Durable Object instance that maintains conversation history and WebSocket state. The frontend connects via WebSocket to the agent endpoint, which routes through `routeAgentRequest` to the correct Durable Object. Workers AI handles inference using Llama 3.3 70B with a GTM-specific system prompt that enforces structured output, metric-backed claims, and audience-matched vocabulary.

## Live Demo

**[cf_ai_gtm_agent.shivendra-f0c.workers.dev](https://cf_ai_gtm_agent.shivendra-f0c.workers.dev)**

Try asking it to write a case study, sales enablement brief, or event messaging for any Cloudflare product.

## Getting Started

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with Workers AI enabled

### Local Development

```bash
npm install
npx wrangler dev
```

Open [http://localhost:8787](http://localhost:8787)

### Deploy

```bash
npx wrangler deploy
```

## AI Development

This project was built using Claude Code as the AI coding assistant. All prompts used during development are documented in [PROMPTS.md](./PROMPTS.md).
