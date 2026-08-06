"use client";

import * as React from "react";
import Link from "next/link";
import { Folder, Plus, Users, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Project } from "@/hooks/use-project-actions";

const DISPLAY_LOCALE = "en-US";
const DISPLAY_TIME_ZONE = "UTC";

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(DISPLAY_LOCALE, {
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  });
}

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onNewProject?: () => void;
  projects?: Project[];
  activeProjectId?: string | null;
  onRenameProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  projects = [],
  activeProjectId = null,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((p) => p.isOwner);
  const sharedProjects = projects.filter((p) => !p.isOwner);

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

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
                My Projects ({ownedProjects.length})
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="rounded-lg text-xs font-medium data-[state=active]:bg-elevated data-[state=active]:text-copy-primary"
              >
                Shared ({sharedProjects.length})
              </TabsTrigger>
            </TabsList>

            {/* My Projects Tab */}
            <TabsContent
              value="my-projects"
              className="flex flex-1 flex-col overflow-y-auto pt-3 space-y-2"
            >
              {ownedProjects.length > 0 ? (
                ownedProjects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      "group flex items-center justify-between rounded-xl border p-3 transition-colors",
                      project.id === activeProjectId
                        ? "border-brand bg-accent-dim"
                        : "border-surface-border bg-subtle/50 hover:bg-subtle"
                    )}
                  >
                    <Link
                      href={`/editor/${project.id}`}
                      className="flex flex-col min-w-0 pr-2"
                    >
                      <span className="truncate text-sm font-medium text-copy-primary">
                        {project.name}
                      </span>
                      <span className="text-xs text-copy-muted">
                        Updated {formatUpdatedAt(project.updatedAt)}
                      </span>
                    </Link>

                    {/* Actions: Show only for owned projects */}
                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRenameProject?.(project)}
                        className="h-7 w-7 text-copy-muted hover:text-brand hover:bg-elevated rounded-lg"
                        title="Rename project"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteProject?.(project)}
                        className="h-7 w-7 text-copy-muted hover:text-state-error hover:bg-elevated rounded-lg"
                        title="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated/50 p-6 text-center">
                  <Folder className="h-10 w-10 text-copy-faint mb-3" />
                  <p className="text-sm font-medium text-copy-secondary mb-1">
                    No projects yet
                  </p>
                  <p className="text-xs text-copy-muted max-w-[200px]">
                    Create a new project to start designing your architecture canvas.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Shared Tab */}
            <TabsContent
              value="shared"
              className="flex flex-1 flex-col overflow-y-auto pt-3 space-y-2"
            >
              {sharedProjects.length > 0 ? (
                sharedProjects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3",
                      project.id === activeProjectId
                        ? "border-brand bg-accent-dim"
                        : "border-surface-border bg-subtle/50"
                    )}
                  >
                    <Link
                      href={`/editor/${project.id}`}
                      className="flex flex-col min-w-0"
                    >
                      <span className="truncate text-sm font-medium text-copy-primary">
                        {project.name}
                      </span>
                      <span className="text-xs text-copy-muted">
                        Updated {formatUpdatedAt(project.updatedAt)}
                      </span>
                    </Link>

                    {/* Actions: HIDE for shared/collaborator projects */}
                    <span className="text-[10px] font-medium text-copy-faint bg-elevated px-2 py-0.5 rounded-md shrink-0">
                      Shared
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-elevated/50 p-6 text-center">
                  <Users className="h-10 w-10 text-copy-faint mb-3" />
                  <p className="text-sm font-medium text-copy-secondary mb-1">
                    No shared projects
                  </p>
                  <p className="text-xs text-copy-muted max-w-[200px]">
                    Projects shared with you or your team will appear here.
                  </p>
                </div>
              )}
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
    </>
  );
}
