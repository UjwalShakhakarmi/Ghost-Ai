import { NextRequest, NextResponse } from "next/server";
import { get, put } from "@vercel/blob";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById, updateCanvasJsonPath } from "@/lib/projects";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

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

  if (!(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json(
      { nodes: [], edges: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await get(project.canvasJsonPath, {
    access: "private",
    useCache: false,
  });

  if (!result || !result.stream) {
    return NextResponse.json(
      { error: "Failed to load saved canvas" },
      { status: 502 },
    );
  }

  const canvas = await new Response(result.stream).json();

  return NextResponse.json(canvas, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

  const body = await request.json().catch(() => null);
  const nodes: CanvasNode[] | null = Array.isArray(body?.nodes)
    ? body.nodes
    : null;
  const edges: CanvasEdge[] | null = Array.isArray(body?.edges)
    ? body.edges
    : null;

  if (!nodes || !edges) {
    return NextResponse.json(
      { error: "nodes and edges are required" },
      { status: 400 },
    );
  }

  const blob = await put(
    `canvas/${projectId}.json`,
    JSON.stringify({ nodes, edges }),
    {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    },
  );

  await updateCanvasJsonPath(projectId, blob.url);

  return NextResponse.json({ url: blob.url });
}
