"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/hooks/use-project-actions";

interface ProjectDialogsProps {
  activeDialog: "create" | "rename" | "delete" | null;
  targetProject: Project | null;
  projectName: string;
  roomId: string;
  isLoading: boolean;
  error?: string | null;
  onClose: () => void;
  onProjectNameChange: (name: string) => void;
  onCreateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
}

export function ProjectDialogs({
  activeDialog,
  targetProject,
  projectName,
  roomId,
  isLoading,
  error,
  onClose,
  onProjectNameChange,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectDialogsProps) {
  const isCreateOpen = activeDialog === "create";
  const isRenameOpen = activeDialog === "rename";
  const isDeleteOpen = activeDialog === "delete";

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-copy-primary">
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              Start a new architecture workspace with a custom project name.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateProject();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <label
                htmlFor="create-project-name"
                className="text-xs font-semibold text-copy-secondary uppercase tracking-wider"
              >
                Project Name
              </label>
              <Input
                id="create-project-name"
                type="text"
                autoFocus
                placeholder="My Architecture System"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="rounded-xl border border-surface-border bg-subtle text-copy-primary placeholder:text-copy-faint focus:border-brand"
              />
            </div>

            {/* Live Room ID Preview */}
            <div className="rounded-xl border border-surface-border bg-subtle/50 p-3 text-xs">
              <span className="text-copy-muted">Room ID Preview: </span>
              <span className="font-mono text-brand font-medium">
                {roomId ? roomId : "my-architecture-system-xxxxx"}
              </span>
            </div>

            {error && (
              <p className="text-xs text-state-error">{error}</p>
            )}

            <DialogFooter className="flex gap-2 sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!projectName.trim() || isLoading}
                className="rounded-xl bg-brand font-semibold text-bg-base hover:bg-brand/90"
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-copy-primary">
              Rename Project
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              Updating name for &quot;<span className="font-semibold text-copy-primary">{targetProject?.name}</span>&quot;
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onRenameProject();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <label
                htmlFor="rename-project-name"
                className="text-xs font-semibold text-copy-secondary uppercase tracking-wider"
              >
                New Project Name
              </label>
              <Input
                id="rename-project-name"
                type="text"
                autoFocus
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                className="rounded-xl border border-surface-border bg-subtle text-copy-primary placeholder:text-copy-faint focus:border-brand"
              />
            </div>

            {error && (
              <p className="text-xs text-state-error">{error}</p>
            )}

            <DialogFooter className="flex gap-2 sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!projectName.trim() || isLoading}
                className="rounded-xl bg-brand font-semibold text-bg-base hover:bg-brand/90"
              >
                {isLoading ? "Saving..." : "Rename Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-state-error">
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              Are you sure you want to delete &quot;<span className="font-semibold text-copy-primary">{targetProject?.name}</span>&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-xs text-state-error">{error}</p>
          )}

          <DialogFooter className="flex gap-2 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDeleteProject}
              disabled={isLoading}
              className="rounded-xl bg-state-error font-semibold text-white hover:bg-state-error/90"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
