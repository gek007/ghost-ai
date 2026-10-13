import { NextResponse } from "next/server";
import { errorResponse, getUserId } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROJECT_NAME, parseProjectName, parseJsonObject } from "@/lib/project-validation";

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
  let value: unknown;
  if (text.trim()) {
    const body = parseJsonObject(text);
    if (!body) return errorResponse("Body must be a JSON object", 400);
    value = body.name;
  }

  const parsed = parseProjectName(value, DEFAULT_PROJECT_NAME);
  if (!parsed.ok) return errorResponse(parsed.error, 400);

  const project = await prisma.project.create({
    data: { ownerId: userId, name: parsed.name },
  });
  return NextResponse.json({ project }, { status: 201 });
}
