import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

// Constructed lazily (on first real use, not at module load) since the
// Liveblocks SDK validates the secret key format eagerly in its constructor.
export function getLiveblocksClient(): Liveblocks {
  const client =
    globalForLiveblocks.liveblocks ??
    new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "" });

  if (process.env.NODE_ENV !== "production") {
    globalForLiveblocks.liveblocks = client;
  }

  return client;
}

const CURSOR_COLORS = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#9575CD",
  "#7986CB",
  "#64B5F6",
  "#4FC3F7",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#AED581",
  "#FFD54F",
  "#FFB74D",
  "#FF8A65",
];

export function getCursorColorForUser(userId: string): string {
  let hash = 0;

  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
