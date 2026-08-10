"use client";

import * as React from "react";
import { useFeedMessages } from "@liveblocks/react";
import {
  AI_STATUS_FEED_ID,
  isAiStatusGenerating,
  parseAiStatusFeedMessageData,
  type AiStatusFeedMessageData,
} from "@/types/tasks";

export interface AiStatusFeedState {
  latestMessage: AiStatusFeedMessageData | null;
  isGenerating: boolean;
}

// Non-suspense variant on purpose: this hook is used from the AI sidebar,
// which sits outside the canvas's own ErrorBoundary/Suspense boundary so a
// canvas connection failure doesn't take the sidebar down with it. Loading
// and error states just resolve to "no message yet" instead of throwing.
export function useAiStatusFeed(): AiStatusFeedState {
  const result = useFeedMessages(AI_STATUS_FEED_ID, { limit: 1 });
  const messages = result.isLoading || result.error ? undefined : result.messages;

  return React.useMemo(() => {
    if (!messages || messages.length === 0) {
      return { latestMessage: null, isGenerating: false };
    }

    const latestRaw = messages.reduce((latest, message) =>
      message.createdAt > latest.createdAt ? message : latest
    );
    const latestMessage = parseAiStatusFeedMessageData(latestRaw.data);

    return {
      latestMessage,
      isGenerating: latestMessage ? isAiStatusGenerating(latestMessage.status) : false,
    };
  }, [messages]);
}
