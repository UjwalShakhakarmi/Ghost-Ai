"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
          onNewProject={() => setIsDialogOpen(true)}
        />

        {/* Editor Canvas Area */}
        <main className="flex flex-1 items-center justify-center bg-base p-6 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md">
            <div className="rounded-full bg-subtle p-4 border border-surface-border">
              <Plus className="h-8 w-8 text-brand" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-copy-primary">
              Canvas Workspace
            </h2>
            <p className="text-sm text-copy-muted">
              Toggle the left project sidebar using the navbar icon or click below to test the dialog pattern.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl bg-brand text-bg-base hover:bg-brand/90 font-medium"
            >
              Test New Project Dialog
            </Button>
          </div>
        </main>
      </div>

      {/* Ready-to-use Dialog Pattern */}
      <EditorDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Create New Project"
        description="Set up a new architecture diagram on your dark workspace canvas."
        primaryActionLabel="Create Project"
        onPrimaryAction={() => {
          // Action handler for future implementation
        }}
        secondaryActionLabel="Cancel"
      >
        <div className="space-y-3">
          <label className="text-xs font-medium text-copy-secondary">
            Project Name
          </label>
          <input
            type="text"
            placeholder="my-awesome-system"
            className="w-full rounded-xl border border-surface-border bg-subtle px-3 py-2 text-sm text-copy-primary outline-none focus:border-brand"
          />
        </div>
      </EditorDialog>
    </div>
  );
}
