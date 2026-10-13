import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { errorResponse } from "@/lib/api-response";
import { enrichCollaborators } from "@/lib/collaborators";
import { prisma } from "@/lib/prisma";
import { getProjectAccess, getRequestIdentity } from "@/lib/project-access";
import { parseCollaboratorEmail, parseJsonObject } from "@/lib/project-validation";

type Context = { params: Promise<{ projectId: string }> };

/** Owners and collaborators can read the list. */
export async function GET(_request: Request, { params }: Context) {
  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("Unauthorized", 401);

  const { projectId } = await params;
  const access = await getProjectAccess(projectId, identity);
  if (!access) return errorResponse("Project not found", 404);

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
  return NextResponse.json({ collaborators: await enrichCollaborators(rows) });
}

/** Owner-only: invites a collaborator by email. */
export async function POST(request: Request, { params }: Context) {
  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("Unauthorized", 401);

  const body = parseJsonObject(await request.text());
  if (!body) return errorResponse("Body must be a JSON object", 400);
  const parsed = parseCollaboratorEmail(body.email);
  if (!parsed.ok) return errorResponse(parsed.error, 400);

  const { projectId } = await params;
  const access = await getProjectAccess(projectId, identity);
  if (!access) return errorResponse("Project not found", 404);
  if (access.role !== "owner") return errorResponse("Only the owner can invite collaborators", 403);
  if (parsed.email === identity.email?.toLowerCase()) {
    return errorResponse("You already own this project", 400);
  }

  try {
    const row = await prisma.projectCollaborator.create({
      data: { projectId, email: parsed.email },
      select: { id: true, email: true },
    });
    const [collaborator] = await enrichCollaborators([row]);
    return NextResponse.json({ collaborator }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("This person is already a collaborator", 409);
    }
    throw error;
  }
}
