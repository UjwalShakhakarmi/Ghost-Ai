"use client";

import type * as React from "react";
import { Panel, useReactFlow } from "@xyflow/react";
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react";
import {
  Maximize2,
  Minus,
  Plus,
  Redo2,
  Undo2,
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function CanvasControlBar() {
  const reactFlow = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    reactFlowInstance: reactFlow,
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
  });

  const handleZoomIn = () => {
    reactFlow.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    reactFlow.zoomOut({ duration: 300 });
  };

  const handleFitView = () => {
    reactFlow.fitView({ duration: 300 });
  };

  return (
    <Panel position="bottom-left">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur select-none">
        {/* Zoom Controls */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom out (-)"
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleFitView}
          title="Fit view"
          aria-label="Fit view"
          className="flex h-8 w-8 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom in (+)"
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="mx-1 h-4 w-px bg-surface-border" />

        {/* History Controls */}
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            canUndo
              ? "text-copy-secondary hover:bg-subtle hover:text-copy-primary"
              : "text-copy-muted/40 cursor-not-allowed opacity-40"
          }`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          aria-label="Redo"
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            canRedo
              ? "text-copy-secondary hover:bg-subtle hover:text-copy-primary"
              : "text-copy-muted/40 cursor-not-allowed opacity-40"
          }`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </Panel>
  );
}
