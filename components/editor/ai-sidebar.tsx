"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed right-0 top-14 bottom-0 z-40 w-80 flex-col border-l border-surface-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out flex",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-ai-text" />
          <h2 className="font-semibold text-base text-copy-primary">AI Assistant</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-copy-muted hover:text-copy-primary hover:bg-subtle"
            aria-label="Close AI sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <Sparkles className="h-8 w-8 text-copy-faint" />
        <p className="text-sm font-medium text-copy-secondary">AI chat coming soon</p>
        <p className="max-w-[200px] text-xs text-copy-muted">
          Prompt-driven architecture generation will appear here.
        </p>
      </div>
    </aside>
  );
}
