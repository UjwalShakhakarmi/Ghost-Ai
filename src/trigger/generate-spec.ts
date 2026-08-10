import { logger, task } from "@trigger.dev/sdk/v3";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { put } from "@vercel/blob";
import { generateText } from "ai";
import { z } from "zod";
import { ensureFeedExists, getLiveblocksClient } from "@/lib/liveblocks";
import { createProjectSpec } from "@/lib/specs";
import { AI_STATUS_FEED_ID, type AiStatus } from "@/types/tasks";

export const generateSpecPayloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(z.record(z.string(), z.unknown())).default([]),
  nodes: z.array(z.record(z.string(), z.unknown())).default([]),
  edges: z.array(z.record(z.string(), z.unknown())).default([]),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;

const AI_USER_ID = "ai-assistant";
const AI_USER_INFO = { name: "Ghost AI", color: "#6457f9" };
const AI_PRESENCE_TTL_SECONDS = 120;

const GENERATION_ATTEMPTS = 3;
const GENERATION_ATTEMPT_TIMEOUT_MS = 90_000;

const CANDIDATE_MODELS = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : ["gemini-2.0-flash", "gemini-1.5-flash"];

const OPENROUTER_FREE_MODELS =
  process.env.OPENROUTER_MODEL || process.env.GEMINI_MODEL
    ? [process.env.OPENROUTER_MODEL || process.env.GEMINI_MODEL!]
    : [
        "google/gemini-2.0-flash-001",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
      ];

function buildSpecPrompt(
  nodes: Record<string, unknown>[],
  edges: Record<string, unknown>[],
  chatHistory: Record<string, unknown>[]
): string {
  const nodeSummary = nodes.length
    ? nodes
        .map((n) => {
          const id = String(n.id ?? "");
          const data = (n.data as Record<string, unknown>) ?? {};
          const label = String(data.label ?? "Unlabeled");
          const shape = String(data.shape ?? "rectangle");
          const color = String(data.color ?? "#1F1F1F");
          return `- Node id="${id}": label="${label}", shape=${shape}, color=${color}`;
        })
        .join("\n")
    : "No nodes on canvas.";

  const edgeSummary = edges.length
    ? edges
        .map((e) => {
          const id = String(e.id ?? "");
          const source = String(e.source ?? "");
          const target = String(e.target ?? "");
          const data = (e.data as Record<string, unknown>) ?? {};
          const label = String(data.label ?? "");
          const labelText = label ? `, label="${label}"` : "";
          return `- Edge id="${id}": from="${source}" to="${target}"${labelText}`;
        })
        .join("\n")
    : "No edges on canvas.";

  const chatSummary = chatHistory.length
    ? chatHistory
        .map((c) => {
          const sender = String(c.sender ?? "User");
          const role = String(c.role ?? "user");
          const content = String(c.content ?? "");
          return `[${sender} (${role})]: ${content}`;
        })
        .join("\n")
    : "No prior chat messages.";

  return `You are Ghost AI, an expert principal software architect.
Produce a comprehensive, publication-ready Technical Specification document in GitHub-flavored Markdown for the system architecture defined below.

### System Architecture Input

#### Canvas Components (Nodes):
${nodeSummary}

#### Relationships & Connections (Edges):
${edgeSummary}

#### Discussion & Design Context (Chat History):
${chatSummary}

---

### Instructions & Formatting Guidelines:
Generate a full, detailed Markdown technical specification. It MUST include the following sections:

# System Technical Specification: [System Title]

## 1. Executive Summary & Architectural Overview
- High-level purpose of the system.
- Summary of core architectural design patterns (e.g. Microservices, Event-Driven, Serverless, Layered).

## 2. Component Topology & Responsibility Matrix
- Detailed breakdown of every component (node) identified in the canvas graph.
- Role, responsibilities, input/output channels, and technology recommendations for each node.

## 3. Data Flow & Communication Protocols
- Step-by-step description of data movement through the edges.
- Protocols (REST, gRPC, WebSockets, Kafka/AMQP), payload types, and sync/async communication models.

## 4. Data Storage, Caches & Persistence Strategy
- Storage engines, cache topologies (e.g. Redis read-aside, MongoDB NoSQL, PostgreSQL relational), and data retention/backup policies.

## 5. Security, Auth & Boundary Isolation
- Authentication (JWT, OAuth2, Session Tokens), API Gateway rate-limiting, network isolation, and encryption standards.

## 6. Resilience, Scalability & Failure Modes
- High availability strategies, fallback mechanisms, auto-scaling triggers, and message queue consumer fault tolerance.

Write clear, authoritative, and exhaustive technical content formatted cleanly in GitHub Markdown. Do not include meta commentary or introductory chatter before the title.`;
}

async function generateSpecContent(prompt: string): Promise<string> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  if (openrouterKey) {
    logger.log("Using OpenRouter provider for spec generation");
    const openrouter = createOpenRouter({ apiKey: openrouterKey });

    let lastError: unknown;
    for (const modelId of OPENROUTER_FREE_MODELS) {
      for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
        try {
          logger.log("Attempting spec generation via OpenRouter", {
            modelId,
            attempt,
          });
          const { text } = await generateText({
            model: openrouter(modelId),
            temperature: 0.3,
            prompt,
            abortSignal: AbortSignal.timeout(GENERATION_ATTEMPT_TIMEOUT_MS),
          });
          if (text && text.trim().length > 0) {
            return text;
          }
        } catch (error) {
          lastError = error;
          const errStr = error instanceof Error ? error.message : String(error);
          logger.warn("OpenRouter spec generation attempt failed", {
            modelId,
            attempt,
            error: errStr,
          });

          if (
            errStr.includes("not found") ||
            errStr.includes("not supported") ||
            errStr.includes("404")
          ) {
            break;
          }
        }
      }
    }
    throw lastError;
  }

  if (!googleKey) {
    throw new Error(
      "Neither OPENROUTER_API_KEY nor GOOGLE_AI_API_KEY is set in environment variables. Please add OPENROUTER_API_KEY or GOOGLE_AI_API_KEY to .env.local."
    );
  }

  const google = createGoogleGenerativeAI({ apiKey: googleKey });

  let lastError: unknown;
  for (const modelId of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
      try {
        logger.log("Attempting spec generation via Google AI", {
          modelId,
          attempt,
        });
        const { text } = await generateText({
          model: google(modelId),
          temperature: 0.3,
          prompt,
          abortSignal: AbortSignal.timeout(GENERATION_ATTEMPT_TIMEOUT_MS),
        });
        if (text && text.trim().length > 0) {
          return text;
        }
      } catch (error) {
        lastError = error;
        const errStr = error instanceof Error ? error.message : String(error);
        logger.warn("Google AI spec generation attempt failed", {
          modelId,
          attempt,
          error: errStr,
        });

        if (errStr.includes("not found") || errStr.includes("not supported")) {
          break;
        }
      }
    }
  }

  throw lastError;
}

export const generateSpecTask = task({
  id: "generate-spec",
  maxDuration: 600,
  run: async (payload: GenerateSpecPayload) => {
    const validated = generateSpecPayloadSchema.parse(payload);
    const { projectId, roomId, chatHistory, nodes, edges } = validated;
    const liveblocks = getLiveblocksClient();

    async function setAiPresence(thinking: boolean) {
      await liveblocks.setPresence(roomId, {
        userId: AI_USER_ID,
        userInfo: AI_USER_INFO,
        data: { cursor: null, thinking },
        ttl: AI_PRESENCE_TTL_SECONDS,
      });
    }

    async function postStatus(status: AiStatus, text: string) {
      await liveblocks.createFeedMessage({
        roomId,
        feedId: AI_STATUS_FEED_ID,
        data: { status, text },
      });
    }

    try {
      await ensureFeedExists(liveblocks, roomId, AI_STATUS_FEED_ID);
      logger.log("Spec generation task starting", { roomId, nodeCount: nodes.length, edgeCount: edges.length });
      await setAiPresence(true);
      await postStatus("start", "Ghost AI is analyzing the architecture graph…");

      await postStatus("processing", "Ghost AI is drafting the technical spec…");

      const prompt = buildSpecPrompt(nodes, edges, chatHistory);
      const markdownSpec = await generateSpecContent(prompt);

      logger.log("Technical spec generated successfully", {
        specLength: markdownSpec.length,
      });

      const timestamp = Date.now();
      const blob = await put(
        `specs/${projectId}/spec-${timestamp}.md`,
        markdownSpec,
        {
          access: "private",
          contentType: "text/markdown; charset=utf-8",
          addRandomSuffix: true,
        }
      );

      const dateStr = new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const specRecord = await createProjectSpec({
        projectId,
        filePath: blob.url,
        title: `Technical Spec (${dateStr})`,
      });

      await postStatus("complete", "Technical spec generated and persisted successfully.");

      return {
        spec: markdownSpec,
        specId: specRecord.id,
        filePath: blob.url,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Spec generation failed.";
      logger.error("Spec generation task failed", { error: message });
      await postStatus(
        "error",
        "Ghost AI couldn't generate the spec. Please try again."
      );
      throw error;
    } finally {
      await setAiPresence(false);
    }
  },
});
