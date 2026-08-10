import { z } from "zod";

// Room-scoped Liveblocks Feed used to broadcast shared AI activity status
// (design generation today; kept generic enough to be reused by spec
// generation later — see feature spec 24).
export const AI_STATUS_FEED_ID = "ai-status-feed";

export const AI_STATUS_VALUES = ["start", "processing", "complete", "error"] as const;
export type AiStatus = (typeof AI_STATUS_VALUES)[number];

export const aiStatusFeedMessageSchema = z.object({
  status: z.enum(AI_STATUS_VALUES),
  text: z.string().max(500).optional(),
});

export type AiStatusFeedMessageData = z.infer<typeof aiStatusFeedMessageSchema>;

export function parseAiStatusFeedMessageData(
  data: unknown
): AiStatusFeedMessageData | null {
  const result = aiStatusFeedMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function isAiStatusGenerating(status: AiStatus): boolean {
  return status === "start" || status === "processing";
}

// Separate room-scoped Liveblocks Feed for collaborative sidebar chat.
// Deliberately kept apart from ai-status-feed — one is AI progress/presence,
// the other is human chat messages — per feature spec 25.
export const AI_CHAT_FEED_ID = "ai-chat";

export const CHAT_ROLE_VALUES = ["user", "assistant"] as const;
export type ChatRole = (typeof CHAT_ROLE_VALUES)[number];

export const aiChatMessageSchema = z.object({
  sender: z.string().min(1).max(120),
  role: z.enum(CHAT_ROLE_VALUES),
  content: z.string().min(1).max(4000),
  timestamp: z.number(),
});

export type AiChatMessageData = z.infer<typeof aiChatMessageSchema>;

export function parseAiChatMessageData(data: unknown): AiChatMessageData | null {
  const result = aiChatMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}

// Every feed message payload shape used in this app, for the global
// Liveblocks FeedMessageData override — extend this union for future feeds.
export type FeedMessageData = AiStatusFeedMessageData | AiChatMessageData;
