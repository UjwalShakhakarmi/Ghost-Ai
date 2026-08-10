import { logger, task } from "@trigger.dev/sdk";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";
import { LiveObject, LiveMap } from "@liveblocks/node";
import { ensureFeedExists, getLiveblocksClient } from "@/lib/liveblocks";
import { NODE_COLORS, NODE_SHAPES, DEFAULT_NODE_COLOR } from "@/types/canvas";
import type { NodeShape } from "@/types/canvas";
import { AI_STATUS_FEED_ID, type AiStatus } from "@/types/tasks";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

// The AI's own presence identity in the room — a synthetic "user" set via
// Liveblocks' server-side setPresence (no WebSocket connection needed),
// exactly the pattern Liveblocks documents for showing an AI agent's
// presence. Color matches this app's existing --accent-ai design token.
const AI_USER_ID = "ai-assistant";
const AI_USER_INFO = { name: "Ghost AI", color: "#6457f9" };
const AI_PRESENCE_TTL_SECONDS = 120;

const SHAPE_VALUES = NODE_SHAPES as [NodeShape, ...NodeShape[]];
const COLOR_VALUES = NODE_COLORS.map((c) => c.fill) as [string, ...string[]];

const DEFAULT_SIZE_BY_SHAPE: Record<
  NodeShape,
  { width: number; height: number }
> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 170, height: 170 },
  circle: { width: 120, height: 120 },
  pill: { width: 170, height: 70 },
  cylinder: { width: 130, height: 130 },
  hexagon: { width: 150, height: 120 },
};

// Gemini's structured output is more reliable against a flat action object
// (one "type" discriminator, every other field optional) than a Zod
// discriminated union — verified directly against the live API before
// wiring this in; the discriminated-union version failed schema validation.
const designActionSchema = z.object({
  type: z.enum([
    "addNode",
    "moveNode",
    "resizeNode",
    "updateNodeData",
    "deleteNode",
    "addEdge",
    "deleteEdge",
  ]),
  nodeId: z
    .string()
    .max(60)
    .optional()
    .describe("Target or new node id. Used by every node action."),
  label: z
    .string()
    .max(60)
    .optional()
    .describe(
      "Node label text (2-4 words, e.g. 'API Gateway', 'User Auth Service', 'Product Catalog', 'Redis Cache', 'NoSQL DB', 'Order Queue'). REQUIRED for addNode.",
    ),
  shape: z
    .enum(SHAPE_VALUES)
    .optional()
    .describe(
      "Node shape: pill (gateways/services), rectangle (workers/services), cylinder (databases/caches), hexagon (queues/brokers), diamond (auth/decisions). Used by addNode.",
    ),
  color: z
    .enum(COLOR_VALUES)
    .optional()
    .describe(
      "Node fill color hex. Use distinct colors for different roles: #10233D (blue for Gateway), #2E1938 (purple for Auth), #062822 (teal for Cache), #331B00 (orange for Database), #3A1726 (pink for Queues), #0F2E18 (green for Processing). Used by addNode, updateNodeData.",
    ),
  x: z
    .number()
    .min(-2000)
    .max(4000)
    .optional()
    .describe("X position. Used by addNode, moveNode."),
  y: z
    .number()
    .min(-2000)
    .max(4000)
    .optional()
    .describe("Y position. Used by addNode, moveNode."),
  width: z
    .number()
    .min(20)
    .max(1000)
    .optional()
    .describe("Node width. Used by addNode, resizeNode."),
  height: z
    .number()
    .min(20)
    .max(1000)
    .optional()
    .describe("Node height. Used by addNode, resizeNode."),
  edgeId: z
    .string()
    .max(60)
    .optional()
    .describe("Target existing edge id. Used by deleteEdge."),
  source: z
    .string()
    .max(60)
    .optional()
    .describe("Source node id. Used by addEdge."),
  target: z
    .string()
    .max(60)
    .optional()
    .describe("Target node id. Used by addEdge."),
  edgeLabel: z
    .string()
    .max(60)
    .optional()
    .describe(
      "Edge label text describing data flow or protocol (e.g., 'HTTPS / Auth', 'Read / Write', 'Cache Lookup', 'Publish Event', 'Consume Queue'). Used by addEdge.",
    ),
});

const designPlanSchema = z.object({
  summary: z
    .string()
    .max(300)
    .describe(
      "One sentence describing what was generated or changed, for a status message.",
    ),
  actions: z.array(designActionSchema).max(60),
});

type DesignAction = z.infer<typeof designActionSchema>;

interface StoredCanvasNode {
  id: string;
  position: { x: number; y: number };
  data?: { label?: string; color?: string; shape?: string };
}

interface StoredCanvasEdge {
  id: string;
  source: string;
  target: string;
}

interface FlowStorageJson {
  flow?: {
    nodes?: Record<string, StoredCanvasNode>;
    edges?: Record<string, StoredCanvasEdge>;
  };
}

// Mirrors the storage shape @liveblocks/react-flow's useLiveblocksFlow
// creates client-side (a "flow" LiveObject holding "nodes"/"edges"
// LiveMaps) — typed here, rather than in liveblocks.config.ts's global
// Storage type, to avoid making RoomProvider's initialStorage prop
// required across the whole app (out of scope for this task file).
type FlowNodeData = { label: string; color: string; shape: string };
type FlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  data: LiveObject<FlowNodeData>;
};
type FlowEdgeData = { label?: string };
type FlowEdge = {
  id: string;
  type: string;
  source: string;
  target: string;
  data: LiveObject<FlowEdgeData>;
};
type FlowStorage = {
  nodes: LiveMap<string, LiveObject<FlowNode>>;
  edges: LiveMap<string, LiveObject<FlowEdge>>;
};
type CanvasStorageRoot = {
  flow: LiveObject<FlowStorage>;
};

function summarizeExistingCanvas(
  nodes: StoredCanvasNode[],
  edges: StoredCanvasEdge[],
): string {
  if (nodes.length === 0 && edges.length === 0) {
    return "The canvas is currently empty.";
  }

  const nodeLines = nodes.map(
    (n) =>
      `- id="${n.id}" shape=${n.data?.shape ?? "rectangle"} label="${n.data?.label ?? ""}" position=(${n.position.x}, ${n.position.y})`,
  );
  const edgeLines = edges.map(
    (e) => `- id="${e.id}" from="${e.source}" to="${e.target}"`,
  );

  return [
    "The canvas currently has these nodes:",
    ...nodeLines,
    "and these edges:",
    ...edgeLines,
    "When the request asks to modify or extend the existing design, reference these exact ids for moveNode, resizeNode, updateNodeData, deleteNode, and deleteEdge, and use them as source/target for new edges where relevant.",
  ].join("\n");
}

function buildPrompt(userPrompt: string, canvasSummary: string): string {
  return `You are a system design assistant embedded in a collaborative architecture diagramming tool called Ghost AI. Convert the request below into a sequence of canvas actions that build or modify a system architecture diagram.

Rules:
- Only use these action types: addNode, moveNode, resizeNode, updateNodeData, deleteNode, addEdge, deleteEdge.
- Only use these node shapes: ${NODE_SHAPES.join(", ")}.
- Only use these node fill colors (hex): ${NODE_COLORS.map((c) => c.fill).join(", ")}.
- For addNode, invent a short, readable, kebab-case nodeId (e.g. "api-gateway", "user-db", "redis-cache") unique among your new nodes.
- **CRITICAL**: Every addNode MUST include a descriptive "label" field (2-4 words, e.g. "API Gateway", "User Auth Service", "Product Catalog", "Redis Cache", "MongoDB NoSQL DB", "Order Queue"). NEVER leave label empty or omitted.
- Choose intuitive shapes:
  * "pill": API Gateways, Routers, and Primary Entry Points
  * "diamond": Auth checks, Decisions, or Security Firewalls
  * "rectangle": Microservices, Processing Workers, and Core Logic
  * "cylinder": Databases (NoSQL, SQL) and Storage
  * "circle": In-memory Caches (Redis, Memcached)
  * "hexagon": Message Queues (Kafka, RabbitMQ) and External Systems
- Assign meaningful color coding:
  * #10233D (Blue): API Gateway / Routing
  * #2E1938 (Purple): Auth / Security
  * #062822 (Teal): Cache (Redis)
  * #331B00 (Orange): Database / Storage
  * #3A1726 (Pink): Message Queue / Event Bus
  * #0F2E18 (Green): Processing Service / Backend Logic
- Add concise "edgeLabel" on addEdge actions describing the data flow (e.g. "HTTPS / Auth", "Cache Lookup", "Read/Write", "Publish Event", "Consume Queue").
- Lay nodes out left-to-right or top-to-bottom by data flow. Space sibling nodes at least 220px apart horizontally and 150px apart vertically. Start near (80, 80) and flow outward — never stack nodes on top of each other.
- Keep the design focused and proportional to the request — do not add unrelated components.
- Provide a one-sentence "summary" of what you generated or changed, written for a status message shown to the user.

${canvasSummary}

Request: "${userPrompt}"`;
}

let idCounter = 0;

function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

const ACRONYMS: Record<string, string> = {
  api: "API",
  db: "DB",
  nosql: "NoSQL",
  sql: "SQL",
  auth: "Auth",
  ui: "UI",
  url: "URL",
  http: "HTTP",
  https: "HTTPS",
  grpc: "gRPC",
  kafka: "Kafka",
  redis: "Redis",
  mq: "MQ",
  cpu: "CPU",
  gpu: "GPU",
  id: "ID",
  ip: "IP",
};

function formatFallbackLabel(nodeId: string): string {
  if (!nodeId) return "Service Node";
  return nodeId
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS[lower]) return ACRONYMS[lower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function applyDesignActions(
  root: LiveObject<CanvasStorageRoot>,
  actions: DesignAction[],
) {
  const flow = root.get("flow");
  const nodesMap = flow.get("nodes");
  const edgesMap = flow.get("edges");

  // Maps the AI's own chosen node ids (e.g. "api-gateway") to the real,
  // globally-unique storage ids created for them during this run.
  const idMap = new Map<string, string>();

  function resolveNodeId(candidateId: string | undefined): string | undefined {
    if (!candidateId) return undefined;
    if (idMap.has(candidateId)) return idMap.get(candidateId);
    if (nodesMap.get(candidateId)) return candidateId;
    return undefined;
  }

  for (const action of actions) {
    switch (action.type) {
      case "addNode": {
        if (!action.nodeId) break;
        const shape = SHAPE_VALUES.includes(action.shape as NodeShape)
          ? (action.shape as NodeShape)
          : "rectangle";
        const defaultSize = DEFAULT_SIZE_BY_SHAPE[shape];
        const color = COLOR_VALUES.includes(action.color ?? "")
          ? (action.color as string)
          : DEFAULT_NODE_COLOR.fill;
        const realId = generateId(shape);
        idMap.set(action.nodeId, realId);

        // Compute label: if action.label is provided, use it; otherwise format action.nodeId into a human readable label
        let label = action.label?.trim() ?? "";
        if (!label) {
          label = formatFallbackLabel(action.nodeId);
        }

        nodesMap.set(
          realId,
          new LiveObject<FlowNode>({
            id: realId,
            type: "canvasNode",
            position: { x: action.x ?? 0, y: action.y ?? 0 },
            width: action.width ?? defaultSize.width,
            height: action.height ?? defaultSize.height,
            data: new LiveObject<FlowNodeData>({
              label,
              color,
              shape,
            }),
          }),
        );
        break;
      }
      case "moveNode": {
        const realId = resolveNodeId(action.nodeId);
        if (!realId || action.x === undefined || action.y === undefined) break;
        const node = nodesMap.get(realId);
        if (!node) break;
        node.set("position", { x: action.x, y: action.y });
        break;
      }
      case "resizeNode": {
        const realId = resolveNodeId(action.nodeId);
        if (!realId) break;
        const node = nodesMap.get(realId);
        if (!node) break;
        if (action.width !== undefined) node.set("width", action.width);
        if (action.height !== undefined) node.set("height", action.height);
        break;
      }
      case "updateNodeData": {
        const realId = resolveNodeId(action.nodeId);
        if (!realId) break;
        const node = nodesMap.get(realId);
        if (!node) break;
        const data = node.get("data");
        if (!data) break;
        if (action.label !== undefined && action.label.trim().length > 0) {
          data.set("label", action.label.trim());
        }
        if (action.color && COLOR_VALUES.includes(action.color))
          data.set("color", action.color);
        break;
      }
      case "deleteNode": {
        const realId = resolveNodeId(action.nodeId);
        if (!realId) break;
        nodesMap.delete(realId);
        for (const [edgeId, edge] of edgesMap.entries()) {
          if (edge.get("source") === realId || edge.get("target") === realId) {
            edgesMap.delete(edgeId);
          }
        }
        break;
      }
      case "addEdge": {
        const sourceId = resolveNodeId(action.source);
        const targetId = resolveNodeId(action.target);
        if (!sourceId || !targetId) break;
        const realEdgeId = generateId("edge");
        const edgeLabel = action.edgeLabel?.trim();
        edgesMap.set(
          realEdgeId,
          new LiveObject<FlowEdge>({
            id: realEdgeId,
            type: "canvasEdge",
            source: sourceId,
            target: targetId,
            data: new LiveObject<FlowEdgeData>(
              edgeLabel ? { label: edgeLabel } : {},
            ),
          }),
        );
        break;
      }
      case "deleteEdge": {
        if (action.edgeId && edgesMap.get(action.edgeId)) {
          edgesMap.delete(action.edgeId);
        }
        break;
      }
    }
  }
}

const GENERATION_ATTEMPTS = 3;
const GENERATION_ATTEMPT_TIMEOUT_MS = 90_000;

// Candidate Google Gemini models to try in order. If GEMINI_MODEL is set in .env.local, it is prioritized.
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

/**
 * Generates the design plan via OpenRouter or Google AI Studio based on configured keys.
 * If OPENROUTER_API_KEY is present, OpenRouter free models are prioritized.
 */
async function generateDesignPlan(prompt: string) {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  if (openrouterKey) {
    logger.log("Using OpenRouter provider for design generation");
    const openrouter = createOpenRouter({ apiKey: openrouterKey });

    let lastError: unknown;
    for (const modelId of OPENROUTER_FREE_MODELS) {
      for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
        try {
          logger.log("Attempting design plan generation via OpenRouter", {
            modelId,
            attempt,
          });
          const { output } = await generateText({
            model: openrouter(modelId),
            output: Output.object({ schema: designPlanSchema }),
            temperature: 0.4,
            prompt,
            abortSignal: AbortSignal.timeout(GENERATION_ATTEMPT_TIMEOUT_MS),
          });
          return output;
        } catch (error) {
          lastError = error;
          const errStr = error instanceof Error ? error.message : String(error);
          logger.warn("OpenRouter design plan generation attempt failed", {
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
      "Neither OPENROUTER_API_KEY nor GOOGLE_AI_API_KEY is set in environment variables. Please add OPENROUTER_API_KEY or GOOGLE_AI_API_KEY to .env.local.",
    );
  }

  if (!googleKey.startsWith("AIzaSy")) {
    logger.warn(
      "GOOGLE_AI_API_KEY format check: Key does not start with 'AIzaSy'. Standard Google AI Studio keys start with 'AIzaSy...'. Obtain a key at https://aistudio.google.com/app/apikey",
      { keyPrefix: googleKey.slice(0, 6) },
    );
  }

  const google = createGoogleGenerativeAI({ apiKey: googleKey });

  let lastError: unknown;
  for (const modelId of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= GENERATION_ATTEMPTS; attempt++) {
      try {
        logger.log("Attempting design plan generation via Google AI", {
          modelId,
          attempt,
        });
        const { output } = await generateText({
          model: google(modelId),
          output: Output.object({ schema: designPlanSchema }),
          temperature: 0.4,
          prompt,
          abortSignal: AbortSignal.timeout(GENERATION_ATTEMPT_TIMEOUT_MS),
        });
        return output;
      } catch (error) {
        lastError = error;
        const errStr = error instanceof Error ? error.message : String(error);
        logger.warn("Google AI design plan generation attempt failed", {
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

export const designAgentTask = task({
  id: "design-agent",
  maxDuration: 600,
  run: async (payload: DesignAgentPayload) => {
    const { prompt, roomId } = payload;
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
      logger.log("Design agent starting", { prompt, roomId });
      await setAiPresence(true);
      await postStatus("start", "Ghost AI is reading your request…");

      const existing = (await liveblocks.getStorageDocument(
        roomId,
        "json",
      )) as unknown as FlowStorageJson;
      const existingNodes = Object.values(existing.flow?.nodes ?? {});
      const existingEdges = Object.values(existing.flow?.edges ?? {});

      await postStatus(
        "processing",
        "Ghost AI is designing the architecture…",
      );

      const plan = await generateDesignPlan(
        buildPrompt(
          prompt,
          summarizeExistingCanvas(existingNodes, existingEdges),
        ),
      );

      logger.log("Design plan generated", {
        summary: plan.summary,
        actionCount: plan.actions.length,
      });

      await liveblocks.mutateStorage(roomId, ({ root }) => {
        applyDesignActions(
          root as unknown as LiveObject<CanvasStorageRoot>,
          plan.actions,
        );
      });

      await postStatus("complete", plan.summary);

      return { summary: plan.summary, actionsApplied: plan.actions.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Design generation failed.";
      logger.error("Design agent failed", { error: message });
      await postStatus(
        "error",
        "Ghost AI couldn't finish that design. Please try again.",
      );
      throw error;
    } finally {
      await setAiPresence(false);
    }
  },
});
