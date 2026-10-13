import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getProjectAccess, getRequestIdentity } from "@/lib/project-access";

type Context = { params: Promise<{ projectId: string; collaboratorId: string }> };

/** Owner-only: removes a collaborator from the project. */
export async function DELETE(_request: Request, { params }: Context) {
  const identity = await getRequestIdentity();
  if (!identity) return errorResponse("Unauthorized", 401);

  const { projectId, collaboratorId } = await params;
  const access = await getProjectAccess(projectId, identity);
  if (!access) return errorResponse("Project not found", 404);
  if (access.role !== "owner") return errorResponse("Only the owner can remove collaborators", 403);

  // Scoped by projectId so an ID from another project can never match.
  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });
  if (count === 0) return errorResponse("Collaborator not found", 404);
  return NextResponse.json({ success: true });
}
