import { loadIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { UserProjects } from "@/types/project";

/** Projects the user owns, and projects shared with them by email as a collaborator. */
export async function getUserProjects(userId: string): Promise<UserProjects> {
  const { email } = await loadIdentity(userId);

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    email
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: { some: { email: { equals: email, mode: "insensitive" } } },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        })
      : [],
  ]);

  return {
    owned: owned.map((project) => ({ ...project, role: "owner" as const })),
    shared: shared.map((project) => ({ ...project, role: "collaborator" as const })),
  };
}
