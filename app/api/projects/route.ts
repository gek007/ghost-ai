import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { errorResponse, getUserId } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROJECT_NAME,
  parseJsonObject,
  parseProjectId,
  parseNewProjectName,
} from "@/lib/project-validation";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return errorResponse("Unauthorized", 401);

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return errorResponse("Unauthorized", 401);

  // An empty body is allowed: the name then defaults.
  const text = await request.text();
  const body = text.trim() ? parseJsonObject(text) : {};
  if (!body) return errorResponse("Body must be a JSON object", 400);

  const name = parseNewProjectName(body.name, DEFAULT_PROJECT_NAME);
  if (!name.ok) return errorResponse(name.error, 400);
  // The client may choose the ID so it can double as the Liveblocks room ID; otherwise the schema's cuid is used.
  const id = parseProjectId(body.id);
  if (!id.ok) return errorResponse(id.error, 400);

  try {
    const project = await prisma.project.create({
      data: { ...(id.id && { id: id.id }), ownerId: userId, name: name.name },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("A project with this ID already exists", 409);
    }
    throw error;
  }
}
