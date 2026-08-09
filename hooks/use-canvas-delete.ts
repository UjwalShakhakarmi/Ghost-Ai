"use client";

import * as React from "react";
import { useEdges, useNodes } from "@xyflow/react";
import type { OnDelete } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface UseCanvasDeleteOptions {
  onDelete: OnDelete<CanvasNode, CanvasEdge>;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  return target.isContentEditable;
}

/**
 * Deletes selected nodes/edges on Delete/Backspace through `onDelete` (the
 * Liveblocks-backed mutation from useLiveblocksFlow that calls
 * nodesMap.delete()/edgesMap.delete() directly), instead of React Flow's own
 * built-in deleteKeyCode handling — deleteKeyCode must stay disabled (see
 * `deleteKeyCode={null}` on <ReactFlow>) so every deletion goes through this
 * one collaborative mutation path.
 *
 * Deliberately NOT onNodesChange/onEdgesChange with `{ type: "remove" }`:
 * @liveblocks/react-flow's applyNodeChanges/applyEdgeChanges treat "remove"
 * as a no-op (confirmed in node_modules/@liveblocks/react-flow/dist/lib/flow.js
 * — `case "remove": break;`), so that path silently does nothing.
 */
export function useCanvasDelete({ onDelete }: UseCanvasDeleteOptions) {
  const nodes = useNodes<CanvasNode>();
  const edges = useEdges<CanvasEdge>();

  const nodesRef = React.useRef(nodes);
  const edgesRef = React.useRef(edges);

  React.useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isEditableTarget(event.target)) return;

      const selectedNodes = nodesRef.current.filter((node) => node.selected);
      const selectedEdges = edgesRef.current.filter((edge) => edge.selected);

      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

      event.preventDefault();
      onDelete({ nodes: selectedNodes, edges: selectedEdges });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDelete]);
}
