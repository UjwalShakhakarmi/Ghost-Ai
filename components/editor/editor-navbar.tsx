"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  title = "ghost Al",
}: EditorNavbarProps) {
  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-surface-border bg-surface px-4 z-30 shrink-0">
      {/* Left section: Sidebar toggle button */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 text-copy-secondary hover:text-copy-primary hover:bg-subtle"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          <span className="font-semibold text-sm tracking-tight text-copy-primary">
            {title}
          </span>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center justify-center">
        {/* Placeholder for workspace title / canvas status in future chapters */}
      </div>

      {/* Right section stays empty for now */}
      <div className="flex items-center justify-end min-w-[200px]" />
    </header>
  );
}
