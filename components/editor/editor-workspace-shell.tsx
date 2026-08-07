"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { Canvas } from "@/components/editor/canvas";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { useProjectActions, Project } from "@/hooks/use-project-actions";
import { useShareDialog } from "@/hooks/use-share-dialog";

interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface EditorWorkspaceShellProps {
  project: { id: string; name: string; isOwner: boolean };
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
}

export function EditorWorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = React.useState(false);

  const projects: Project[] = React.useMemo(
    () => [
      ...ownedProjects.map((p) => ({ ...p, isOwner: true })),
      ...sharedProjects.map((p) => ({ ...p, isOwner: false })),
    ],
    [ownedProjects, sharedProjects]
  );

  const handleSelectTemplate = React.useCallback((template: CanvasTemplate) => {
    window.dispatchEvent(new CustomEvent("canvas:import-template", { detail: template }));
    setIsTemplatesModalOpen(false);
  }, []);

  const {
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
  } = useProjectActions({ activeProjectId: project.id });

  const {
    isOpen: isShareDialogOpen,
    open: openShareDialog,
    close: closeShareDialog,
    projectLink,
    collaborators,
    isLoading: isLoadingCollaborators,
    inviteEmail,
    setInviteEmail,
    isInviting,
    removingEmail,
    error: shareError,
    isCopied,
    inviteCollaborator,
    removeCollaborator,
    copyProjectLink,
  } = useShareDialog({ projectId: project.id, isOwner: project.isOwner });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-base text-copy-primary">
      {/* Top Fixed Editor Navbar */}
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        projectName={project.name}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onShare={openShareDialog}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Floating Project Sidebar */}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewProject={openCreateDialog}
          projects={projects}
          activeProjectId={project.id}
          onRenameProject={openRenameDialog}
          onDeleteProject={openDeleteDialog}
        />

        {/* Collaborative Canvas */}
        <main className="relative flex flex-1 overflow-hidden bg-base">
          <Canvas roomId={project.id} />
        </main>

        {/* Floating AI Sidebar Placeholder */}
        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
        />
      </div>

      {/* Project Dialogs (Create, Rename, Delete) */}
      <ProjectDialogs
        activeDialog={activeDialog}
        targetProject={targetProject}
        projectName={projectName}
        roomIdPreview={roomIdPreview}
        isLoading={isLoading}
        error={error}
        onClose={closeDialog}
        onProjectNameChange={handleProjectNameChange}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        isOwner={project.isOwner}
        projectName={project.name}
        projectLink={projectLink}
        collaborators={collaborators}
        isLoading={isLoadingCollaborators}
        inviteEmail={inviteEmail}
        isInviting={isInviting}
        removingEmail={removingEmail}
        error={shareError}
        isCopied={isCopied}
        onClose={closeShareDialog}
        onInviteEmailChange={setInviteEmail}
        onInvite={inviteCollaborator}
        onRemove={removeCollaborator}
        onCopyLink={copyProjectLink}
      />

      {/* Starter Templates Modal */}
      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
