"use client";

import * as React from "react";
import { Folder, Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
}: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-40 w-80 flex-col border-r border-surface-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Header with Projects title + close button */}
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-brand" />
          <h2 className="font-semibold text-base text-copy-primary">Projects</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-copy-muted hover:text-copy-primary hover:bg-subtle"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Content Area with Tabs */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Tabs defaultValue="my-projects" className="flex flex-1 flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-subtle p-1 shrink-0">
            <TabsTrigger
              value="my-projects"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-elevated data-[state=active]:text-copy-primary"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-elevated data-[state=active]:text-copy-primary"
            >
              Shared
            </TabsTrigger>
          </TabsList>

          {/* My Projects Tab Placeholder */}
          <TabsContent
            value="my-projects"
            className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated/50 p-6 text-center mt-4"
          >
            <Folder className="h-10 w-10 text-copy-faint mb-3" />
            <p className="text-sm font-medium text-copy-secondary mb-1">
              No projects yet
            </p>
            <p className="text-xs text-copy-muted max-w-[200px]">
              Create a new project to start designing your architecture canvas.
            </p>
          </TabsContent>

          {/* Shared Tab Placeholder */}
          <TabsContent
            value="shared"
            className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated/50 p-6 text-center mt-4"
          >
            <Users className="h-10 w-10 text-copy-faint mb-3" />
            <p className="text-sm font-medium text-copy-secondary mb-1">
              No shared projects
            </p>
            <p className="text-xs text-copy-muted max-w-[200px]">
              Projects shared with you or your team will appear here.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Full-width New Project button at the bottom */}
      <div className="border-t border-surface-border p-4 shrink-0 bg-surface">
        <Button
          onClick={onNewProject}
          className="w-full justify-center gap-2 rounded-xl bg-brand text-base font-semibold text-bg-base hover:bg-brand/90"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Button>
      </div>
    </aside>
  );
}
