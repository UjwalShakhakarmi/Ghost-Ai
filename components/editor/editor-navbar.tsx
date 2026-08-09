"use client";

import * as React from "react";
import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SaveStatusIndicator } from "@/components/editor/save-status-indicator";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  projectName?: string;
  saveStatus?: CanvasSaveStatus;
  onShare?: () => void;
  onOpenTemplates?: () => void;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  showUserButton?: boolean;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  title = "Ghost AI",
  projectName,
  saveStatus,
  onShare,
  onOpenTemplates,
  isAiSidebarOpen,
  onToggleAiSidebar,
  showUserButton = true,
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

      {/* Center section: current project name */}
      <div className="flex min-w-0 items-center justify-center">
        {projectName && (
          <span className="truncate text-sm font-medium text-copy-secondary">
            {projectName}
          </span>
        )}
      </div>

      {/* Right section: workspace actions + Clerk UserButton */}
      <div className="flex items-center justify-end gap-2 min-w-[200px]">
        {saveStatus && <SaveStatusIndicator status={saveStatus} />}
        {onOpenTemplates && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTemplates}
            className="gap-1.5 rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
          >
            <LayoutTemplate className="h-4 w-4 text-brand" />
            <span>Templates</span>
          </Button>
        )}
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="gap-1.5 rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        )}
        {onToggleAiSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAiSidebar}
            className={cn(
              "h-9 w-9 text-copy-secondary hover:text-copy-primary hover:bg-subtle",
              isAiSidebarOpen && "bg-subtle text-accent-ai-text"
            )}
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            title="AI Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        )}
        {showUserButton && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-full border border-surface-border",
              },
            }}
          />
        )}
      </div>
    </header>
  );
}
