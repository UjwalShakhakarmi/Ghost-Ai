"use client";

import * as React from "react";
import { useCreateFeedMessage, useFeedMessages, useSelf } from "@liveblocks/react";
import {
  AI_CHAT_FEED_ID,
  parseAiChatMessageData,
  type AiChatMessageData,
  type ChatRole,
} from "@/types/tasks";

export interface AiChatFeedMessage extends AiChatMessageData {
  id: string;
}

export interface SendChatMessageOptions {
  role?: ChatRole;
  sender?: string;
}

export interface UseAiChatFeedResult {
  messages: AiChatFeedMessage[];
  sendMessage: (content: string, options?: SendChatMessageOptions) => Promise<boolean>;
  isSending: boolean;
  sendError: string | null;
}

// Non-suspense, same reasoning as use-ai-status-feed: this hook is used from
// the AI sidebar, which sits outside the canvas's own Suspense boundary.
export function useAiChatFeed(): UseAiChatFeedResult {
  const result = useFeedMessages(AI_CHAT_FEED_ID, { limit: 100 });
  const createFeedMessage = useCreateFeedMessage();
  const self = useSelf();
  const [isSending, setIsSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);

  const rawMessages = result.isLoading || result.error ? undefined : result.messages;

  const messages = React.useMemo(() => {
    if (!rawMessages) return [];

    const parsed: AiChatFeedMessage[] = [];
    for (const message of rawMessages) {
      const data = parseAiChatMessageData(message.data);
      if (data) {
        parsed.push({ id: message.id, ...data });
      }
    }

    return parsed.sort((a, b) => a.timestamp - b.timestamp);
  }, [rawMessages]);

  const sendMessage = React.useCallback(
    async (content: string, options?: SendChatMessageOptions) => {
      const trimmed = content.trim();
      if (!trimmed) return false;

      setIsSending(true);
      setSendError(null);

      const data: AiChatMessageData = {
        sender: options?.sender ?? self?.info?.name ?? "Anonymous",
        role: options?.role ?? "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      try {
        await createFeedMessage(AI_CHAT_FEED_ID, data);
        return true;
      } catch {
        setSendError("Message failed to send. Try again.");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [createFeedMessage, self]
  );

  return { messages, sendMessage, isSending, sendError };
}
