import { prisma } from "./prisma";
import type { Project } from "@prisma/client";

export function getOwnedProjects(ownerId: string): Promise<Project[]> {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
  });
}

export function getSharedProjects(email: string): Promise<Project[]> {
  if (!email) return Promise.resolve([]);

  return prisma.project.findMany({
    where: { collaborators: { some: { email } } },
    orderBy: { updatedAt: "desc" },
  });
}

export function getProjectById(id: string): Promise<Project | null> {
  return prisma.project.findUnique({ where: { id } });
}

export function createProject(ownerId: string, name?: string): Promise<Project> {
  const trimmed = name?.trim();

  return prisma.project.create({
    data: {
      ownerId,
      name: trimmed && trimmed.length > 0 ? trimmed : "Untitled Project",
    },
  });
}

export function renameProject(id: string, name: string): Promise<Project> {
  return prisma.project.update({
    where: { id },
    data: { name },
  });
}

export function deleteProject(id: string): Promise<Project> {
  return prisma.project.delete({ where: { id } });
}
