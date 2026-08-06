"use client";

import type * as React from "react";
import { Panel } from "@xyflow/react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { NodeShape } from "@/types/canvas";

export const SHAPE_DRAG_MIME_TYPE = "application/x-canvas-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

interface ShapeTool {
  shape: NodeShape;
  label: string;
  icon: LucideIcon;
  width: number;
  height: number;
}

const SHAPE_TOOLS: ShapeTool[] = [
  { shape: "rectangle", label: "Rectangle", icon: RectangleHorizontal, width: 160, height: 80 },
  { shape: "diamond", label: "Diamond", icon: Diamond, width: 170, height: 170 },
  { shape: "circle", label: "Circle", icon: Circle, width: 120, height: 120 },
  { shape: "pill", label: "Pill", icon: Pill, width: 170, height: 70 },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder, width: 130, height: 130 },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon, width: 150, height: 120 },
];

function handleDragStart(event: React.DragEvent<HTMLDivElement>, tool: ShapeTool) {
  const payload: ShapeDragPayload = {
    shape: tool.shape,
    width: tool.width,
    height: tool.height,
  };
  event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
}

export function ShapePanel() {
  return (
    <Panel position="bottom-center">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-2xl backdrop-blur">
        {SHAPE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.shape}
              role="button"
              tabIndex={0}
              draggable
              onDragStart={(event) => handleDragStart(event, tool)}
              title={tool.label}
              aria-label={`Drag to add a ${tool.label.toLowerCase()} node`}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Icon className="h-4 w-4" />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
