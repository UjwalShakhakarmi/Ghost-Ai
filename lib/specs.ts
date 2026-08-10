import { prisma } from "./prisma";
import type { ProjectSpec } from "@prisma/client";

export function createProjectSpec(data: {
  projectId: string;
  filePath: string;
  title?: string;
}): Promise<ProjectSpec> {
  return prisma.projectSpec.create({
    data,
  });
}

export function getProjectSpecById(specId: string): Promise<ProjectSpec | null> {
  return prisma.projectSpec.findUnique({
    where: { id: specId },
  });
}

export function listProjectSpecs(projectId: string): Promise<ProjectSpec[]> {
  return prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}
