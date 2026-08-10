"use client";

import { useOther, useOthersConnectionIds } from "@liveblocks/react";
import { useViewport } from "@xyflow/react";
import { Loader2 } from "lucide-react";

const FALLBACK_COLOR = "#808090";

interface LiveCursorProps {
  connectionId: number;
  viewportX: number;
  viewportY: number;
  zoom: number;
}

function LiveCursor({ connectionId, viewportX, viewportY, zoom }: LiveCursorProps) {
  const other = useOther(connectionId, (o) => ({
    cursor: o.presence.cursor,
    name: o.info?.name || "Anonymous",
    color: o.info?.color || FALLBACK_COLOR,
    thinking: o.presence.thinking,
  }));

  if (!other.cursor) return null;

  const screenX = viewportX + other.cursor.x * zoom;
  const screenY = viewportY + other.cursor.y * zoom;

  return (
    <div
      className="absolute left-0 top-0 z-40"
      style={{ transform: `translate(${screenX}px, ${screenY}px)` }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="drop-shadow">
        <path
          d="M1.5 1L16 7.5L9.3 9.3L7.5 16L1.5 1Z"
          fill={other.color}
          stroke="white"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="ml-3.5 -mt-1 flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
        style={{ backgroundColor: other.color }}
      >
        {other.thinking && <Loader2 className="h-2.5 w-2.5 shrink-0 animate-spin" />}
        {other.name}
      </div>
    </div>
  );
}

export function LiveCursors() {
  const connectionIds = useOthersConnectionIds();
  const { x, y, zoom } = useViewport();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {connectionIds.map((connectionId) => (
        <LiveCursor
          key={connectionId}
          connectionId={connectionId}
          viewportX={x}
          viewportY={y}
          zoom={zoom}
        />
      ))}
    </div>
  );
}
