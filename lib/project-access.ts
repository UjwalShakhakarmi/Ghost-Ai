import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { Project } from "@prisma/client";

export interface ClerkIdentity {
  userId: string;
  email: string;
}

export async function getCurrentIdentity(): Promise<ClerkIdentity | null> {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return { userId, email };
}

export async function hasProjectAccess(
  project: Project,
  identity: ClerkIdentity
): Promise<boolean> {
  if (project.ownerId === identity.userId) return true;
  if (!identity.email) return false;

  const collaboratorCount = await prisma.projectCollaborator.count({
    where: { projectId: project.id, email: identity.email },
  });

  return collaboratorCount > 0;
}
