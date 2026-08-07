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

function removeShapeGhostPreview() {
  const existing = document.getElementById("shape-drag-preview");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}

function createShapeGhostPreview(tool: ShapeTool, event: React.DragEvent<HTMLDivElement>) {
  removeShapeGhostPreview();

  const ghost = document.createElement("div");
  ghost.id = "shape-drag-preview";
  ghost.style.position = "fixed";
  ghost.style.top = "-9999px";
  ghost.style.left = "-9999px";
  ghost.style.width = `${tool.width}px`;
  ghost.style.height = `${tool.height}px`;
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "99999";
  ghost.style.boxSizing = "border-box";

  const fillColor = "#1F1F1F";
  const strokeColor = "#00c8d4";

  if (tool.shape === "rectangle" || tool.shape === "pill" || tool.shape === "circle") {
    let borderRadius = "12px";
    if (tool.shape === "pill" || tool.shape === "circle") {
      borderRadius = "9999px";
    }
    ghost.style.backgroundColor = fillColor;
    ghost.style.border = `2px dashed ${strokeColor}`;
    ghost.style.borderRadius = borderRadius;
    ghost.style.opacity = "0.75";
  } else {
    let svgContent = "";
    if (tool.shape === "diamond") {
      svgContent = `<polygon points="50,2 98,50 50,98 2,50" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />`;
    } else if (tool.shape === "hexagon") {
      svgContent = `<polygon points="25,2 75,2 98,50 75,98 25,98 2,50" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />`;
    } else if (tool.shape === "cylinder") {
      svgContent = `
        <path d="M2,16 L2,84 A48,16 0 0 0 98,84 L98,16" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
        <ellipse cx="50" cy="16" rx="48" ry="16" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
      `;
    }
    ghost.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block; opacity: 0.75;">${svgContent}</svg>`;
  }

  document.body.appendChild(ghost);

  if (event.dataTransfer && typeof event.dataTransfer.setDragImage === "function") {
    event.dataTransfer.setDragImage(ghost, tool.width / 2, tool.height / 2);
  }

  setTimeout(() => {
    removeShapeGhostPreview();
  }, 0);
}

function handleDragStart(event: React.DragEvent<HTMLDivElement>, tool: ShapeTool) {
  const payload: ShapeDragPayload = {
    shape: tool.shape,
    width: tool.width,
    height: tool.height,
  };
  event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "copy";
  createShapeGhostPreview(tool, event);
}

function handleDragEnd() {
  removeShapeGhostPreview();
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
              onDragEnd={handleDragEnd}
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
