import type { FeedMessageData } from "@/types/tasks";

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: Record<string, never>;

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    RoomEvent: Record<string, never>;

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: Record<string, never>;

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    RoomInfo: Record<string, never>;

    // Custom metadata set on feeds, for useFeeds, useCreateFeed, etc.
    FeedMetadata: Record<string, never>;

    // Payload shape for messages in any room feed, for useFeedMessages,
    // useCreateFeedMessage, etc. — a union of every feed's payload shape
    // (ai-status-feed, ai-chat); each is narrowed with its own zod parser
    // before use since Liveblocks types this per-app, not per-feed.
    FeedMessageData: FeedMessageData;
  }
}

export {};
