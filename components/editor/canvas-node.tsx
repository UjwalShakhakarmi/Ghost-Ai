"use client";

import type { NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR, NODE_COLORS } from "@/types/canvas";

function textColorFor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? DEFAULT_NODE_COLOR.text;
}

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  const textColor = textColorFor(data.color);

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-md border-2 px-3 py-2 text-center text-sm font-medium"
      style={{
        backgroundColor: data.color,
        borderColor: textColor,
        color: textColor,
      }}
    >
      {data.label}
    </div>
  );
}
