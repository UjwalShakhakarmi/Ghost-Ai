"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import "@xyflow/react/dist/style.css";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import {
  ShapePanel,
  SHAPE_DRAG_MIME_TYPE,
  type ShapeDragPayload,
} from "@/components/editor/shape-panel";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

let nodeIdCounter = 0;

function generateNodeId(shape: string): string {
  nodeIdCounter += 1;
  return `${shape}-${Date.now()}-${nodeIdCounter}`;
}

function CanvasFlowInner() {
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const handleDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE);
      if (!raw) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        id: generateNodeId(payload.shape),
        type: "canvasNode",
        position,
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.fill,
          shape: payload.shape,
        },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      connectionMode={ConnectionMode.Loose}
      fitView
      colorMode="dark"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <Background variant={BackgroundVariant.Dots} bgColor="var(--bg-base)" />
      <MiniMap />
      <ShapePanel />
    </ReactFlow>
  );
}

export function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  );
}
