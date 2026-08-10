import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import { getProjectSpecById } from "@/lib/specs";

interface RouteParams {
  params: Promise<{
    projectId: string;
    specId: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await params;

  if (!projectId || !specId) {
    return NextResponse.json(
      { error: "projectId and specId are required" },
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

  const spec = await getProjectSpecById(specId);

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  if (spec.projectId !== project.id) {
    return NextResponse.json(
      { error: "Spec does not belong to this project" },
      { status: 403 }
    );
  }

  const blobResult = await get(spec.filePath, {
    access: "private",
    useCache: false,
  });

  if (!blobResult || !blobResult.stream) {
    return NextResponse.json(
      { error: "Failed to retrieve spec file content" },
      { status: 502 }
    );
  }

  const cleanSlug = spec.title
    ? spec.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : `technical-spec-${spec.id}`;

  const filename = `${cleanSlug || "technical-spec"}.md`;

  return new NextResponse(blobResult.stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
