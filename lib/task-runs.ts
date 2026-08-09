import { prisma } from "./prisma";
import type { TaskRun } from "@prisma/client";

export function createTaskRun(
  runId: string,
  projectId: string,
  userId: string
): Promise<TaskRun> {
  return prisma.taskRun.create({
    data: { runId, projectId, userId },
  });
}

export function getTaskRunByRunId(runId: string): Promise<TaskRun | null> {
  return prisma.taskRun.findUnique({ where: { runId } });
}
