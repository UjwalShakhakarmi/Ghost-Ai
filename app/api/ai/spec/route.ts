import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import { createTaskRun } from "@/lib/task-runs";
import type { generateSpecTask } from "@/src/trigger/generate-spec";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const roomId = typeof body?.roomId === "string" ? body.roomId.trim() : "";

  if (!roomId) {
    return NextResponse.json(
      { error: "roomId is required" },
      { status: 400 }
    );
  }

  // Project access MUST be resolved from roomId, never client-provided projectId
  const project = await getProjectById(roomId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const chatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory : [];
  const nodes = Array.isArray(body?.nodes) ? body.nodes : [];
  const edges = Array.isArray(body?.edges) ? body.edges : [];

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  });

  await createTaskRun(handle.id, project.id, identity.userId);

  return NextResponse.json({ runId: handle.id });
}
