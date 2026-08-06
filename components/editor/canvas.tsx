"use client";

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle, Loader2 } from "lucide-react";
import { CanvasFlow } from "@/components/editor/canvas-flow";

interface CanvasProps {
  roomId: string;
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-base">
      <Loader2 className="h-6 w-6 animate-spin text-copy-muted" />
      <p className="text-sm text-copy-muted">Connecting to canvas…</p>
    </div>
  );
}

function CanvasError() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-base text-center">
      <AlertTriangle className="h-6 w-6 text-state-error" />
      <p className="text-sm font-medium text-copy-secondary">
        Couldn&apos;t connect to the canvas
      </p>
      <p className="text-xs text-copy-muted">
        Check your connection and try refreshing the page.
      </p>
    </div>
  );
}

export function Canvas({ roomId }: CanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
        <ErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <CanvasFlow />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
