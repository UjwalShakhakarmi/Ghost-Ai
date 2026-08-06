import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createProject, getOwnedProjects, getSharedProjects } from "@/lib/projects";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const [owned, shared] = await Promise.all([
    getOwnedProjects(userId),
    getSharedProjects(email),
  ]);

  return NextResponse.json({ owned, shared });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : undefined;

  const project = await createProject(userId, name);

  return NextResponse.json({ project }, { status: 201 });
}
