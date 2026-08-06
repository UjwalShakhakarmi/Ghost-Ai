"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  isOwner: boolean;
  updatedAt: string;
}

type DialogType = "create" | "rename" | "delete" | null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateShortSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

interface UseProjectActionsOptions {
  activeProjectId?: string | null;
}

export function useProjectActions({
  activeProjectId = null,
}: UseProjectActionsOptions = {}) {
  const router = useRouter();

  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);
  const [targetProject, setTargetProject] = React.useState<Project | null>(
    null
  );
  const [projectName, setProjectName] = React.useState("");
  const [roomSuffix, setRoomSuffix] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Cosmetic preview only — never sent to the server. The canonical Liveblocks
  // room ID is always the Prisma cuid returned by POST /api/projects.
  const roomIdPreview = projectName.trim()
    ? `${slugify(projectName)}-${roomSuffix}`
    : "";

  const openCreateDialog = React.useCallback(() => {
    setProjectName("");
    setRoomSuffix(generateShortSuffix());
    setTargetProject(null);
    setError(null);
    setActiveDialog("create");
  }, []);

  const openRenameDialog = React.useCallback((project: Project) => {
    setTargetProject(project);
    setProjectName(project.name);
    setError(null);
    setActiveDialog("rename");
  }, []);

  const openDeleteDialog = React.useCallback((project: Project) => {
    setTargetProject(project);
    setError(null);
    setActiveDialog("delete");
  }, []);

  const closeDialog = React.useCallback(() => {
    setActiveDialog(null);
    setTargetProject(null);
    setProjectName("");
    setRoomSuffix("");
    setIsLoading(false);
    setError(null);
  }, []);

  const handleProjectNameChange = React.useCallback((name: string) => {
    setProjectName(name);
  }, []);

  const handleCreateProject = React.useCallback(async () => {
    const name = projectName.trim();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const { project } = await res.json();
      closeDialog();
      router.push(`/editor/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }, [projectName, closeDialog, router]);

  const handleRenameProject = React.useCallback(async () => {
    if (!targetProject) return;
    const name = projectName.trim();
    if (!name) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      closeDialog();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }, [targetProject, projectName, closeDialog, router]);

  const handleDeleteProject = React.useCallback(async () => {
    if (!targetProject) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      const wasActive = activeProjectId === targetProject.id;
      closeDialog();
      if (wasActive) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }, [targetProject, activeProjectId, closeDialog, router]);

  return {
    activeDialog,
    targetProject,
    projectName,
    roomIdPreview,
    isLoading,
    error,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    handleProjectNameChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  };
}
