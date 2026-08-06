import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import {
  getOwnedProjects,
  getProjectById,
  getSharedProjects,
} from "@/lib/projects";

export const metadata: Metadata = {
  title: "Ghost AI - Editor",
};

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function EditorRoomPage({
  params,
}: EditorRoomPageProps) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  const { roomId } = await params;
  const project = await getProjectById(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  const allowed = await hasProjectAccess(project, identity);

  if (!allowed) {
    return <AccessDenied />;
  }

  const [owned, shared] = await Promise.all([
    getOwnedProjects(identity.userId),
    getSharedProjects(identity.email),
  ]);

  return (
    <EditorWorkspaceShell
      project={{
        id: project.id,
        name: project.name,
        isOwner: project.ownerId === identity.userId,
      }}
      ownedProjects={owned.map((p) => ({
        id: p.id,
        name: p.name,
        updatedAt: p.updatedAt.toISOString(),
      }))}
      sharedProjects={shared.map((p) => ({
        id: p.id,
        name: p.name,
        updatedAt: p.updatedAt.toISOString(),
      }))}
    />
  );
}
