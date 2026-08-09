"use client";

import * as React from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DEBOUNCE_MS = 1500;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  enabled: boolean;
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
}: UseCanvasAutosaveOptions): CanvasSaveStatus {
  const [status, setStatus] = React.useState<CanvasSaveStatus>("idle");
  const skipNextSaveRef = React.useRef(true);

  React.useEffect(() => {
    if (!enabled) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      setStatus("saving");

      fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save canvas");
          if (!cancelled) setStatus("saved");
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [nodes, edges, projectId, enabled]);

  return status;
}
