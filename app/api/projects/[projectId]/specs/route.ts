import { NextRequest, NextResponse } from "next/server";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import { listProjectSpecs } from "@/lib/specs";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const specs = await listProjectSpecs(projectId);

  return NextResponse.json({ specs });
}
