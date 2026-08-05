"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorWorkspace() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const {
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
  } = useProjectDialogs();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base text-copy-primary">
      {/* Top Fixed Editor Navbar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Floating Project Sidebar */}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewProject={openCreateDialog}
          projects={projects}
          onRenameProject={openRenameDialog}
          onDeleteProject={openDeleteDialog}
        />

        {/* Editor Home Center Area */}
        <main className="flex flex-1 items-center justify-center bg-base p-6 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md">
            <h1 className="text-2xl font-bold tracking-tight text-copy-primary">
              Create a project or open an existing one
            </h1>
            <p className="text-sm text-copy-muted leading-relaxed">
              Start a new architecture workspace, or choose a project from the sidebar.
            </p>
            <Button
              onClick={openCreateDialog}
              className="mt-2 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-bg-base hover:bg-brand/90"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Button>
          </div>
        </main>
      </div>

      {/* Project Dialogs (Create, Rename, Delete) */}
      <ProjectDialogs
        activeDialog={activeDialog}
        targetProject={targetProject}
        projectName={projectName}
        slug={slug}
        isLoading={isLoading}
        onClose={closeDialog}
        onProjectNameChange={handleProjectNameChange}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}
