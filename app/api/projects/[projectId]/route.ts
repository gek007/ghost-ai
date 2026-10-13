import { NextResponse } from "next/server";
import { errorResponse, getUserId } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseProjectName, parseJsonObject } from "@/lib/project-validation";

type Context = { params: Promise<{ projectId: string }> };

/** Returns an error response unless the project exists and belongs to `userId`. */
async function checkOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return errorResponse("Project not found", 404);
  if (project.ownerId !== userId) return errorResponse("Forbidden", 403);
  return null;
}

export async function PATCH(request: Request, { params }: Context) {
  const userId = await getUserId();
  if (!userId) return errorResponse("Unauthorized", 401);

  const body = parseJsonObject(await request.text());
  if (!body) return errorResponse("Body must be a JSON object", 400);
  const parsed = parseProjectName(body.name);
  if (!parsed.ok) return errorResponse(parsed.error, 400);

  const { projectId } = await params;
  const denied = await checkOwner(projectId, userId);
  if (denied) return denied;

  // Scoping by ownerId keeps the write safe even if ownership changes after the check.
  const { count } = await prisma.project.updateMany({
    where: { id: projectId, ownerId: userId },
    data: { name: parsed.name },
  });
  if (count === 0) return errorResponse("Project not found", 404);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, { params }: Context) {
  const userId = await getUserId();
  if (!userId) return errorResponse("Unauthorized", 401);

  const { projectId } = await params;
  const denied = await checkOwner(projectId, userId);
  if (denied) return denied;

  await prisma.project.deleteMany({ where: { id: projectId, ownerId: userId } });
  return NextResponse.json({ success: true });
}
