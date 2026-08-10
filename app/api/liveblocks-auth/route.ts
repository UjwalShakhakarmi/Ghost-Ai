import { NextRequest, NextResponse } from "next/server";
import { getCurrentIdentity, hasProjectAccess } from "@/lib/project-access";
import { getProjectById } from "@/lib/projects";
import { ensureFeedExists, getCursorColorForUser, getLiveblocksClient } from "@/lib/liveblocks";
import { AI_CHAT_FEED_ID } from "@/types/tasks";

export async function POST(request: NextRequest) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const roomId = typeof body?.room === "string" ? body.room : "";

  if (!roomId) {
    return NextResponse.json({ error: "A room is required" }, { status: 400 });
  }

  const project = await getProjectById(roomId);

  if (!project || !(await hasProjectAccess(project, identity))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveblocks = getLiveblocksClient();

  // Ensure the room exists (create only if needed), then make sure this
  // already-verified user has write access even if the room already existed.
  await liveblocks.getOrCreateRoom(project.id, {
    defaultAccesses: [],
    usersAccesses: { [identity.userId]: ["room:write"] },
  });

  await liveblocks.updateRoom(project.id, {
    usersAccesses: { [identity.userId]: ["room:write"] },
  });

  // The ai-chat feed is client-driven (users post to it directly, unlike
  // ai-status-feed which a Trigger.dev task creates lazily on first run), so
  // it needs to exist before any client's first send — this auth route is
  // the one place every room-joining client already passes through.
  await ensureFeedExists(liveblocks, project.id, AI_CHAT_FEED_ID);

  const { status, body: sessionBody } = await liveblocks.identifyUser(
    identity.userId,
    {
      userInfo: {
        name: identity.name,
        avatar: identity.avatarUrl,
        color: getCursorColorForUser(identity.userId),
      },
    }
  );

  return new Response(sessionBody, { status });
}
