"use client";

import { AlertTriangle, Check, Loader2, Save } from "lucide-react";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import { cn } from "@/lib/utils";

interface SaveStatusIndicatorProps {
  status: CanvasSaveStatus;
}

const STATUS_CONFIG: Record<
  CanvasSaveStatus,
  { label: string; icon: typeof Save; className: string }
> = {
  idle: { label: "Save", icon: Save, className: "text-copy-secondary" },
  saving: { label: "Saving…", icon: Loader2, className: "text-copy-secondary" },
  saved: { label: "Saved", icon: Check, className: "text-state-success" },
  error: { label: "Save failed", icon: AlertTriangle, className: "text-state-error" },
};

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-9 items-center gap-1.5 rounded-xl border border-surface-border bg-subtle px-3 text-sm font-medium select-none"
    >
      <Icon className={cn("h-4 w-4", className, status === "saving" && "animate-spin")} />
      <span className={className}>{label}</span>
    </div>
  );
}
