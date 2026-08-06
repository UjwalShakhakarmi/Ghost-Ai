import { NextRequest, NextResponse } from "next/server";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import {
  addCollaborator,
  listCollaboratorsWithClerkData,
  removeCollaborator,
} from "@/lib/collaborators";

interface RouteParams {
  params: Promise<{ projectId: string }>;
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

  const allowed = await hasProjectAccess(project, identity);

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await listCollaboratorsWithClerkData(projectId);

  return NextResponse.json(
    { collaborators },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }

  await addCollaborator(projectId, email);
  const collaborators = await listCollaboratorsWithClerkData(projectId);

  return NextResponse.json({ collaborators }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    await removeCollaborator(projectId, email);
  } catch (err: unknown) {
    if ((err as { code?: string })?.code !== "P2025") {
      throw err;
    }
  }

  const collaborators = await listCollaboratorsWithClerkData(projectId);

  return NextResponse.json({ collaborators });
}
