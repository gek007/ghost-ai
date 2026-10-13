import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface Identity {
  userId: string;
  email: string | null;
}

export interface AccessibleProject {
  id: string;
  name: string;
  role: "owner" | "collaborator";
}

/**
 * Current Clerk identity (user ID + primary email). Redirects to sign-in when
 * unauthenticated, so callers always receive a signed-in identity.
 */
export async function getIdentity(): Promise<Identity> {
  const { userId } = await auth.protect();
  const user = await currentUser();
  return { userId, email: user?.primaryEmailAddress?.emailAddress ?? null };
}

/**
 * The project when the identity owns it or is a collaborator (matched by
 * email, case-insensitive); `null` for missing and unauthorized projects alike,
 * so callers cannot leak whether a project exists.
 */
export async function getProjectAccess(
  projectId: string,
  { userId, email }: Identity,
): Promise<AccessibleProject | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...(email
          ? [{ collaborators: { some: { email: { equals: email, mode: "insensitive" as const } } } }]
          : []),
      ],
    },
    select: { id: true, name: true, ownerId: true },
  });
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    role: project.ownerId === userId ? "owner" : "collaborator",
  };
}

/**
 * Like `getIdentity`, but for route handlers: returns `null` instead of
 * redirecting so the caller can answer 401.
 */
export async function getRequestIdentity(): Promise<Identity | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return { userId, email: user?.primaryEmailAddress?.emailAddress ?? null };
}
