import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { getLiveblocks, getUserColor } from "@/lib/liveblocks";
import { getProjectAccess, getRequestIdentity } from "@/lib/project-access";

export async function POST(request: Request) {
  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("Unauthorized", 401);

  let room: unknown;
  try {
    ({ room } = await request.json());
  } catch {
    return errorResponse("Body must be JSON", 400);
  }
  if (typeof room !== "string" || !room) return errorResponse("Missing room", 400);

  // The room ID is the project ID.
  const project = await getProjectAccess(room, identity);
  // `{ error: "forbidden" }` tells the Liveblocks client to stop retrying this room.
  if (!project) return NextResponse.json({ error: "forbidden", reason: "No access to this project" }, { status: 403 });

  let liveblocks: ReturnType<typeof getLiveblocks>;
  try {
    liveblocks = getLiveblocks();
    // Private by default; access comes from the session token below.
    await liveblocks.getOrCreateRoom(project.id, { defaultAccesses: [] });
  } catch (error) {
    console.error("Liveblocks room setup failed", error);
    return errorResponse("Could not prepare the room", 502);
  }

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name: identity.name,
      avatar: identity.avatarUrl,
      color: getUserColor(identity.userId),
    },
  });
  session.allow(project.id, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status, headers: { "Content-Type": "application/json" } });
}
