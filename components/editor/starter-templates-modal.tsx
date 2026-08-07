"use client";

import * as React from "react";
import { LayoutTemplate } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates";
import { DEFAULT_NODE_COLOR, NODE_COLORS } from "@/types/canvas";

function textColorFor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? DEFAULT_NODE_COLOR.text;
}

function getHandleOffset(handle: string | null | undefined, w: number, h: number): { dx: number; dy: number } {
  switch (handle) {
    case "top":
      return { dx: w / 2, dy: 0 };
    case "right":
      return { dx: w, dy: h / 2 };
    case "bottom":
      return { dx: w / 2, dy: h };
    case "left":
      return { dx: 0, dy: h / 2 };
    default:
      return { dx: w / 2, dy: h / 2 };
  }
}

function StarterTemplatePreview({ template }: { template: CanvasTemplate }) {
  if (!template.nodes || template.nodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  template.nodes.forEach((node) => {
    const w = node.width ?? 160;
    const h = node.height ?? 80;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + w);
    maxY = Math.max(maxY, node.position.y + h);
  });

  const padding = 35;
  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;
  const viewBoxW = Math.max(100, maxX - minX + padding * 2);
  const viewBoxH = Math.max(100, maxY - minY + padding * 2);

  const nodeMap = new Map(template.nodes.map((n) => [n.id, n]));

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-surface-border bg-base p-2 select-none">
      <svg
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <defs>
          <marker
            id="template-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Edges */}
        {template.edges.map((edge) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return null;

          const sW = source.width ?? 160;
          const sH = source.height ?? 80;
          const tW = target.width ?? 160;
          const tH = target.height ?? 80;

          const sOffset = getHandleOffset(edge.sourceHandle, sW, sH);
          const tOffset = getHandleOffset(edge.targetHandle, tW, tH);

          const sx = source.position.x + sOffset.dx;
          const sy = source.position.y + sOffset.dy;
          const tx = target.position.x + tOffset.dx;
          const ty = target.position.y + tOffset.dy;

          return (
            <g key={edge.id}>
              <line
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                stroke="#64748b"
                strokeWidth="2.5"
                markerEnd="url(#template-arrow)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {template.nodes.map((node) => {
          const w = node.width ?? 160;
          const h = node.height ?? 80;
          const fill = node.data.color || "#1F1F1F";
          const textColor = textColorFor(fill);
          const shape = node.data.shape;
          const cx = node.position.x + w / 2;
          const cy = node.position.y + h / 2;

          let shapeElement: React.ReactNode = null;

          if (shape === "circle" || shape === "pill") {
            shapeElement = (
              <rect
                x={node.position.x}
                y={node.position.y}
                width={w}
                height={h}
                rx={h / 2}
                fill={fill}
                stroke={textColor}
                strokeWidth="1.5"
              />
            );
          } else if (shape === "diamond") {
            const points = `${cx},${node.position.y} ${node.position.x + w},${cy} ${cx},${
              node.position.y + h
            } ${node.position.x},${cy}`;
            shapeElement = (
              <polygon
                points={points}
                fill={fill}
                stroke={textColor}
                strokeWidth="1.5"
              />
            );
          } else if (shape === "hexagon") {
            const cut = w * 0.2;
            const points = `${node.position.x + cut},${node.position.y} ${
              node.position.x + w - cut
            },${node.position.y} ${node.position.x + w},${cy} ${
              node.position.x + w - cut
            },${node.position.y + h} ${node.position.x + cut},${node.position.y + h} ${
              node.position.x
            },${cy}`;
            shapeElement = (
              <polygon
                points={points}
                fill={fill}
                stroke={textColor}
                strokeWidth="1.5"
              />
            );
          } else if (shape === "cylinder") {
            shapeElement = (
              <g>
                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={w}
                  height={h}
                  rx="12"
                  fill={fill}
                  stroke={textColor}
                  strokeWidth="1.5"
                />
                <ellipse
                  cx={cx}
                  cy={node.position.y + 16}
                  rx={w / 2 - 2}
                  ry="12"
                  fill={fill}
                  stroke={textColor}
                  strokeWidth="1.5"
                />
              </g>
            );
          } else {
            shapeElement = (
              <rect
                x={node.position.x}
                y={node.position.y}
                width={w}
                height={h}
                rx="12"
                fill={fill}
                stroke={textColor}
                strokeWidth="1.5"
              />
            );
          }

          return (
            <g key={node.id}>
              {shapeElement}
              <text
                x={cx}
                y={cy + (shape === "cylinder" ? 6 : 0)}
                fill={textColor}
                fontSize="11"
                fontWeight="600"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {node.data.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl border-surface-border bg-surface text-copy-primary rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <LayoutTemplate className="h-5 w-5 text-brand" />
            <span>Starter Architecture Templates</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-copy-muted">
            Choose a pre-built system design to load onto your canvas. Importing a template will replace the current canvas content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4 max-h-[65vh] overflow-y-auto pr-1">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col justify-between rounded-2xl border border-surface-border bg-elevated/50 p-4 transition-all hover:border-subtle hover:bg-elevated"
            >
              <div>
                <StarterTemplatePreview template={template} />
                <h3 className="mt-3 text-base font-semibold text-copy-primary">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs text-copy-muted leading-relaxed line-clamp-3">
                  {template.description}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectTemplate(template)}
                className="mt-4 w-full gap-1.5 rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-brand hover:text-black hover:border-brand transition-colors"
              >
                <span>Import Template</span>
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
