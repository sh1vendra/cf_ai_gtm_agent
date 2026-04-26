import { createWorkersAI } from "workers-ai-provider";
import { callable, routeAgentRequest } from "agents";
import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import {
  convertToModelMessages,
  pruneMessages,
  streamText,
  type ModelMessage
} from "ai";

/**
 * The AI SDK's downloadAssets step runs `new URL(data)` on every file
 * part's string data. Data URIs parse as valid URLs, so it tries to
 * HTTP-fetch them and fails. Decode to Uint8Array so the SDK treats
 * them as inline data instead.
 */
function inlineDataUrls(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((msg) => {
    if (msg.role !== "user" || typeof msg.content === "string") return msg;
    return {
      ...msg,
      content: msg.content.map((part) => {
        if (part.type !== "file" || typeof part.data !== "string") return part;
        const match = part.data.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return part;
        const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
        return { ...part, data: bytes, mediaType: match[1] };
      })
    };
  });
}

export class GTMAgent extends AIChatAgent<Env> {
  maxPersistedMessages = 100;

  onStart() {
    this.mcp.configureOAuthCallback({
      customHandler: (result) => {
        if (result.authSuccess) {
          return new Response("<script>window.close();</script>", {
            headers: { "content-type": "text/html" },
            status: 200
          });
        }
        return new Response(
          `Authentication Failed: ${result.authError || "Unknown error"}`,
          { headers: { "content-type": "text/plain" }, status: 400 }
        );
      }
    });
  }

  @callable()
  async addServer(name: string, url: string) {
    return await this.addMcpServer(name, url);
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        sessionAffinity: this.sessionAffinity
      }),
      system: `You are a GTM content agent for B2B tech sales and marketing teams. You produce three content types:

1. TECHNICAL CASE STUDY — structured as: Problem → Solution → Measurable Outcome. Lead with the customer pain, show exactly how the product solved it, and close with specific metrics (e.g., "reduced onboarding time by 40%", "cut infra costs by $120K/yr").

2. SALES ENABLEMENT BRIEF — covers three sections: Positioning (why this product wins in this segment), Objection Handling (the top 3–5 objections reps hear and sharp, evidence-backed responses), and Competitive Angles (head-to-head differentiators vs. named or category competitors).

3. EVENT MESSAGING — delivers: a keynote hook (one punchy sentence that earns attention in <10 words), session descriptions (150 words max, outcome-first), and a follow-up sequence (3-email arc: recap → value add → CTA).

BEFORE generating any content, you must ask for and confirm:
- Target audience (role, industry, company size, maturity level)
- Product or feature being positioned
- Desired outcome (what the reader should think, feel, or do after consuming this content)

If any of these are missing, ask for them before writing a single word of output.

OUTPUT RULES — non-negotiable:
- Every claim needs a number or a named proof point. No vague benefits ("faster", "easier") without a metric or example.
- Structure everything for skimmability: headers, bullets, short sentences. No walls of text.
- Cut all filler: no "In today's competitive landscape…", no "leverage synergies", no throat-clearing intros.
- Match the vocabulary of the target audience — technical for engineers, pipeline and quota language for sales, pipeline impact for marketing.`,
      messages: pruneMessages({
        messages: inlineDataUrls(await convertToModelMessages(this.messages)),
        toolCalls: "before-last-2-messages"
      }),
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
