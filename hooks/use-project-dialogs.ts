"use client";

import * as React from "react";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
  updatedAt: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "E-Commerce System",
    slug: "e-commerce-system",
    isOwner: true,
    updatedAt: "2 hours ago",
  },
  {
    id: "proj-2",
    name: "Payment Gateway Service",
    slug: "payment-gateway-service",
    isOwner: true,
    updatedAt: "Yesterday",
  },
  {
    id: "proj-3",
    name: "Analytics Pipeline",
    slug: "analytics-pipeline",
    isOwner: false,
    updatedAt: "3 days ago",
  },
];

export function useProjectDialogs() {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [activeDialog, setActiveDialog] = React.useState<
    "create" | "rename" | "delete" | null
  >(null);
  const [targetProject, setTargetProject] = React.useState<Project | null>(
    null
  );
  const [projectName, setProjectName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const openCreateDialog = React.useCallback(() => {
    setProjectName("");
    setSlug("");
    setTargetProject(null);
    setActiveDialog("create");
  }, []);

  const openRenameDialog = React.useCallback((project: Project) => {
    setTargetProject(project);
    setProjectName(project.name);
    setSlug(project.slug);
    setActiveDialog("rename");
  }, []);

  const openDeleteDialog = React.useCallback((project: Project) => {
    setTargetProject(project);
    setActiveDialog("delete");
  }, []);

  const closeDialog = React.useCallback(() => {
    setActiveDialog(null);
    setTargetProject(null);
    setProjectName("");
    setSlug("");
    setIsLoading(false);
  }, []);

  const handleProjectNameChange = React.useCallback((name: string) => {
    setProjectName(name);
    setSlug(slugify(name));
  }, []);

  const handleCreateProject = React.useCallback(() => {
    const normalizedSlug = slugify(projectName);
    if (!normalizedSlug) return;
    setIsLoading(true);
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectName.trim(),
      slug: normalizedSlug,
      isOwner: true,
      updatedAt: "Just now",
    };
    setProjects((prev) => [newProj, ...prev]);
    closeDialog();
  }, [projectName, closeDialog]);

  const handleRenameProject = React.useCallback(() => {
    if (!targetProject) return;
    const normalizedSlug = slugify(projectName);
    if (!normalizedSlug) return;
    setIsLoading(true);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProject.id
          ? {
              ...p,
              name: projectName.trim(),
              slug: normalizedSlug,
              updatedAt: "Just now",
            }
          : p
      )
    );
    closeDialog();
  }, [targetProject, projectName, closeDialog]);

  const handleDeleteProject = React.useCallback(() => {
    if (!targetProject) return;
    setIsLoading(true);
    setProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
    closeDialog();
  }, [targetProject, closeDialog]);

  return {
    projects,
    activeDialog,
    targetProject,
    projectName,
    slug,
    isLoading,
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
