"use client";

import * as React from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import "@xyflow/react/dist/style.css";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";
import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import {
  ShapePanel,
  SHAPE_DRAG_MIME_TYPE,
  type ShapeDragPayload,
} from "@/components/editor/shape-panel";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#808090",
    width: 14,
    height: 14,
  },
};

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

  const nodesRef = React.useRef(nodes);
  const edgesRef = React.useRef(edges);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

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

  const reactFlow = useReactFlow();

  React.useEffect(() => {
    function handleImportEvent(e: Event) {
      const customEvent = e as CustomEvent<CanvasTemplate>;
      const template = customEvent.detail;
      if (!template) return;

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      if (currentNodes.length > 0) {
        onNodesChange(currentNodes.map((n) => ({ type: "remove", id: n.id })));
      }
      if (currentEdges.length > 0) {
        onEdgesChange(currentEdges.map((e) => ({ type: "remove", id: e.id })));
      }

      const nodeIdMap = new Map<string, string>();
      const newNodes: CanvasNode[] = template.nodes.map((node) => {
        const newId = generateNodeId(node.data.shape || "rectangle");
        nodeIdMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
        };
      });

      let edgeCounter = 0;
      const newEdges: CanvasEdge[] = template.edges.map((edge) => {
        edgeCounter += 1;
        const newEdgeId = `edge-${Date.now()}-${edgeCounter}`;
        return {
          ...edge,
          id: newEdgeId,
          source: nodeIdMap.get(edge.source) || edge.source,
          target: nodeIdMap.get(edge.target) || edge.target,
        };
      });

      if (newNodes.length > 0) {
        onNodesChange(newNodes.map((item) => ({ type: "add", item })));
      }
      if (newEdges.length > 0) {
        onEdgesChange(newEdges.map((item) => ({ type: "add", item })));
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        reactFlow.fitView({ duration: 400 });
      }, 50);
    }

    window.addEventListener("canvas:import-template", handleImportEvent);
    return () => {
      window.removeEventListener("canvas:import-template", handleImportEvent);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [onNodesChange, onEdgesChange, reactFlow]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
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
      <CanvasControlBar />
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
