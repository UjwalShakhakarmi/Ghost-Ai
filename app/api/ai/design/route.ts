import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import { createTaskRun } from "@/lib/task-runs";
import type { designAgentTask } from "@/src/trigger/design-agent";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";

  if (!prompt || !roomId || !projectId) {
    return NextResponse.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 }
    );
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
  });

  await createTaskRun(handle.id, projectId, identity.userId);

  return NextResponse.json({ runId: handle.id });
}
