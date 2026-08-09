"use client";

import * as React from "react";
import type { OnEdgesChange, OnNodesChange } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface UseCanvasLoadOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
}

interface SavedCanvas {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
}

/**
 * Loads the project's saved canvas from Vercel Blob into the Liveblocks room,
 * but only once, and only if the room didn't already have nodes/edges when it
 * was opened — otherwise this would clobber an already-active collaboration.
 * Returns whether the load check has finished, so autosave can wait for it.
 */
export function useCanvasLoad({
  projectId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}: UseCanvasLoadOptions): boolean {
  const [isLoadComplete, setIsLoadComplete] = React.useState(
    () => nodes.length > 0 || edges.length > 0
  );
  const hasAttemptedLoadRef = React.useRef(false);

  React.useEffect(() => {
    if (hasAttemptedLoadRef.current || isLoadComplete) return;
    hasAttemptedLoadRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`, { cache: "no-store" });
        if (!res.ok || cancelled) return;

        const saved: SavedCanvas = await res.json();
        if (cancelled) return;

        if (saved.nodes && saved.nodes.length > 0) {
          onNodesChange(saved.nodes.map((item) => ({ type: "add", item })));
        }
        if (saved.edges && saved.edges.length > 0) {
          onEdgesChange(saved.edges.map((item) => ({ type: "add", item })));
        }
      } catch {
        // No saved canvas to load, or the request failed — start blank.
      } finally {
        if (!cancelled) setIsLoadComplete(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, onNodesChange, onEdgesChange, isLoadComplete]);

  return isLoadComplete;
}
