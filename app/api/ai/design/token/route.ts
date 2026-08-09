import { NextRequest, NextResponse } from "next/server";
import { auth } from "@trigger.dev/sdk/v3";
import { getCurrentIdentity } from "@/lib/project-access";
import { getTaskRunByRunId } from "@/lib/task-runs";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const runId = typeof body?.runId === "string" ? body.runId : "";

  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await getTaskRunByRunId(runId);

  if (!taskRun) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return NextResponse.json({ token });
}
