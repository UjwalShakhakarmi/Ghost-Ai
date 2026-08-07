"use client";

import * as React from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow } from "@xyflow/react";
import type { CanvasNode, NodeColor, NodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR, NODE_COLORS } from "@/types/canvas";

function textColorFor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? DEFAULT_NODE_COLOR.text;
}

function ShapeSvg({
  shape,
  fill,
  stroke,
  strokeWidth,
}: {
  shape: NodeShape;
  fill: string;
  stroke: string;
  strokeWidth: number;
}) {
  switch (shape) {
    case "diamond": {
      return (
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      );
    }
    case "hexagon": {
      return (
        <polygon
          points="25,2 75,2 98,50 75,98 25,98 2,50"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      );
    }
    case "cylinder": {
      return (
        <>
          <path
            d="M2,16 L2,84 A48,16 0 0 0 98,84 L98,16"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="50"
            cy="16"
            rx="48"
            ry="16"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </>
      );
    }
    default: {
      return null;
    }
  }
}

function svgLabelPadding(shape: NodeShape): string {
  switch (shape) {
    case "diamond":
      return "px-[22%] py-[20%]";
    case "hexagon":
      return "px-[20%] py-[12%]";
    case "cylinder":
      return "pt-[22%] pb-[10%] px-[12%]";
    default:
      return "px-3 py-2";
  }
}

function minDimensionsForShape(shape: NodeShape): { minWidth: number; minHeight: number } {
  switch (shape) {
    case "circle":
      return { minWidth: 60, minHeight: 60 };
    case "pill":
      return { minWidth: 80, minHeight: 40 };
    case "diamond":
      return { minWidth: 80, minHeight: 80 };
    case "hexagon":
      return { minWidth: 80, minHeight: 60 };
    case "cylinder":
      return { minWidth: 70, minHeight: 70 };
    case "rectangle":
    default:
      return { minWidth: 80, minHeight: 40 };
  }
}

function ConnectionHandles({ isConnectable }: { isConnectable?: boolean }) {
  return (
    <>
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-[#18181c] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 !z-20"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-[#18181c] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 !z-20"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-[#18181c] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 !z-20"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="!w-2.5 !h-2.5 !bg-white !border-2 !border-[#18181c] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 !z-20"
      />
    </>
  );
}

function ColorSwatch({
  pair,
  isActive,
  onSelect,
}: {
  pair: NodeColor;
  isActive: boolean;
  onSelect: (fill: string, e: React.MouseEvent) => void;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={(e) => onSelect(pair.fill, e)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Set color theme`}
      aria-label={`Set node color theme to ${pair.fill}`}
      className={`h-5 w-5 rounded-full transition-all duration-150 focus:outline-none ${
        isActive ? "ring-2 ring-white scale-110" : "hover:scale-110 opacity-90 hover:opacity-100"
      }`}
      style={{
        backgroundColor: pair.fill,
        border: `1.5px solid ${pair.text}`,
        boxShadow: isActive
          ? `0 0 8px ${pair.text}90`
          : isHovered
          ? `0 0 6px ${pair.text}60`
          : "none",
      }}
    />
  );
}

function NodeColorToolbar({
  id,
  selectedColor,
  isVisible,
}: {
  id: string;
  selectedColor: string;
  isVisible?: boolean;
}) {
  const { updateNodeData } = useReactFlow();

  const handleSelectColor = React.useCallback(
    (color: string, e: React.MouseEvent) => {
      e.stopPropagation();
      updateNodeData(id, { color });
    },
    [id, updateNodeData]
  );

  return (
    <NodeToolbar
      isVisible={isVisible}
      position={Position.Top}
      offset={10}
      className="nodrag nopan flex items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-xl backdrop-blur select-none"
    >
      {NODE_COLORS.map((pair) => (
        <ColorSwatch
          key={pair.fill}
          pair={pair}
          isActive={selectedColor === pair.fill}
          onSelect={handleSelectColor}
        />
      ))}
    </NodeToolbar>
  );
}

export function CanvasNodeRenderer({ id, data, selected, isConnectable }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const fill = data.color || DEFAULT_NODE_COLOR.fill;
  const textColor = textColorFor(fill);

  const strokeColor = selected ? textColor : "rgba(255, 255, 255, 0.2)";
  const strokeWidth = selected ? 2.5 : 1.5;

  const validShapes: NodeShape[] = ["rectangle", "pill", "circle", "diamond", "hexagon", "cylinder"];
  const shape: NodeShape = validShapes.includes(data.shape) ? data.shape : "rectangle";

  const isCssShape = shape === "rectangle" || shape === "pill" || shape === "circle";
  const { minWidth, minHeight } = minDimensionsForShape(shape);

  const adjustTextareaHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      adjustTextareaHeight();
    }
  }, [isEditing, adjustTextareaHeight]);

  const handleDoubleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { label: e.target.value });
      adjustTextareaHeight();
    },
    [id, updateNodeData, adjustTextareaHeight]
  );

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      setIsEditing(false);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  }, []);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const labelContent = isEditing ? (
    <div className="flex items-center justify-center w-full h-full">
      <textarea
        ref={textareaRef}
        value={data.label}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onMouseDown={(e) => e.stopPropagation()}
        className="nodrag nopan w-full bg-transparent text-center text-sm font-medium outline-none resize-none overflow-hidden p-0 m-0 leading-tight focus:ring-0 focus:outline-none"
        style={{ color: textColor }}
        rows={1}
      />
    </div>
  ) : (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full h-full flex items-center justify-center cursor-text leading-tight"
    >
      {data.label && data.label.trim().length > 0 ? (
        <span>{data.label}</span>
      ) : (
        <span className="opacity-40 italic">Add label...</span>
      )}
    </div>
  );

  if (isCssShape) {
    let borderRadiusClass = "rounded-xl";
    let paddingClass = "px-3 py-2";

    if (shape === "pill") {
      borderRadiusClass = "rounded-full";
      paddingClass = "px-6 py-2";
    } else if (shape === "circle") {
      borderRadiusClass = "rounded-full";
      paddingClass = "p-4";
    }

    return (
      <div
        className={`group relative h-full w-full flex items-center justify-center text-center text-sm font-medium transition-all duration-150 ${borderRadiusClass}`}
        style={{
          backgroundColor: fill,
          color: textColor,
          borderStyle: "solid",
          borderWidth: `${strokeWidth}px`,
          borderColor: strokeColor,
          boxShadow: selected ? `0 0 10px ${textColor}40` : "none",
        }}
      >
        <NodeColorToolbar id={id} selectedColor={fill} isVisible={selected} />
        <ConnectionHandles isConnectable={isConnectable} />
        <NodeResizer
          isVisible={selected}
          minWidth={minWidth}
          minHeight={minHeight}
          color={textColor}
          handleClassName="!z-30 !pointer-events-auto"
          lineClassName="!z-10 !pointer-events-auto"
          handleStyle={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: textColor,
            borderColor: "var(--bg-surface, #111114)",
          }}
          lineStyle={{
            borderColor: `${textColor}60`,
          }}
        />
        <div className={`pointer-events-none w-full h-full flex items-center justify-center ${paddingClass}`}>
          <div className="pointer-events-auto flex items-center justify-center w-full h-full">
            {labelContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative h-full w-full">
      <NodeColorToolbar id={id} selectedColor={fill} isVisible={selected} />
      <ConnectionHandles isConnectable={isConnectable} />
      <NodeResizer
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        color={textColor}
        handleClassName="!z-30 !pointer-events-auto"
        lineClassName="!z-10 !pointer-events-auto"
        handleStyle={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: textColor,
          borderColor: "var(--bg-surface, #111114)",
        }}
        lineStyle={{
          borderColor: `${textColor}60`,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
        style={{
          filter: selected ? `drop-shadow(0 0 4px ${textColor}40)` : "none",
        }}
      >
        <ShapeSvg
          shape={shape}
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm font-medium ${svgLabelPadding(
          shape
        )}`}
      >
        <div className="pointer-events-auto flex items-center justify-center w-full h-full">
          {labelContent}
        </div>
      </div>
    </div>
  );
}
