"use client";

import * as React from "react";
import type { EdgeProps } from "@xyflow/react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const active = selected || isHovered;
  const strokeColor = active ? "#f8fafc" : "#808090";
  const strokeWidth = active ? 2 : 1.5;
  const opacity = active ? 1 : 0.6;

  const edgeStyle: React.CSSProperties = {
    ...style,
    stroke: strokeColor,
    strokeWidth,
    opacity,
    transition: "stroke 150ms, stroke-width 150ms, opacity 150ms",
  };

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDoubleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateEdgeData(id, { label: e.target.value });
    },
    [id, updateEdgeData]
  );

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" || e.key === "Escape") {
      setIsEditing(false);
    }
  }, []);

  const hasLabel = Boolean(data?.label && data.label.trim().length > 0);
  const inputWidth = Math.min(280, Math.max(60, ((data?.label ?? "").length + 3) * 8));

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      {/* Invisible wider interaction path for easy mouse hover and double click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              aria-label="Edge label"
              value={data?.label ?? ""}
              onChange={handleChange}
              onBlur={() => setIsEditing(false)}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Label..."
              className="nodrag nopan rounded-full border border-brand bg-surface px-2.5 py-0.5 text-xs font-medium text-copy-primary outline-none focus:ring-1 focus:ring-brand shadow-lg text-center"
              style={{ width: `${inputWidth}px` }}
            />
          ) : hasLabel ? (
            <div
              onDoubleClick={handleDoubleClick}
              className="rounded-full border border-surface-border bg-surface/95 px-2.5 py-0.5 text-xs font-medium text-copy-primary shadow-md backdrop-blur select-none cursor-pointer hover:border-brand transition-colors"
            >
              {data?.label}
            </div>
          ) : active ? (
            <div
              onDoubleClick={handleDoubleClick}
              className="rounded-full border border-transparent px-2 py-0.5 text-xs font-medium text-copy-muted opacity-60 hover:opacity-100 cursor-pointer select-none transition-opacity"
            >
              Add label...
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
