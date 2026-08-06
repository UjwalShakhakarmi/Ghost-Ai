import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getOwnedProjects, getSharedProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Ghost AI - Editor",
};

interface EditorProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorProjectPage({
  params,
}: EditorProjectPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in");
  }

  const { projectId } = await params;
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const [owned, shared] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(email),
  ]);

  return (
    <EditorWorkspace
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
      activeProjectId={projectId}
    />
  );
}
