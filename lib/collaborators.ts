import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export interface Collaborator {
  id: string;
  email: string;
  createdAt: string;
  displayName: string | null;
  imageUrl: string | null;
}

export async function listCollaboratorsWithClerkData(
  projectId: string
): Promise<Collaborator[]> {
  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  if (collaborators.length === 0) return [];

  const emails = collaborators.map((c) => c.email);
  const client = await clerkClient();

  const chunkSize = 100;
  const users = [];

  for (let i = 0; i < emails.length; i += chunkSize) {
    const chunk = emails.slice(i, i + chunkSize);
    const { data: chunkUsers } = await client.users.getUserList({
      emailAddress: chunk,
      limit: chunk.length,
    });
    users.push(...chunkUsers);
  }

  const byEmail = new Map<
    string,
    { displayName: string | null; imageUrl: string | null }
  >();

  for (const user of users) {
    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      null;

    for (const emailAddress of user.emailAddresses) {
      byEmail.set(emailAddress.emailAddress.toLowerCase(), {
        displayName,
        imageUrl: user.imageUrl || null,
      });
    }
  }

  return collaborators.map((c) => {
    const match = byEmail.get(c.email.toLowerCase());

    return {
      id: c.id,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
      displayName: match?.displayName ?? null,
      imageUrl: match?.imageUrl ?? null,
    };
  });
}

export function addCollaborator(projectId: string, email: string) {
  return prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    update: {},
    create: { projectId, email },
  });
}

export function removeCollaborator(projectId: string, email: string) {
  return prisma.projectCollaborator.delete({
    where: { projectId_email: { projectId, email } },
  });
}
