import { cache } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface Identity {
  userId: string;
  email: string | null;
  name: string;
  avatarUrl: string;
}

export interface AccessibleProject {
  id: string;
  name: string;
  role: "owner" | "collaborator";
}

const PROFILE_TTL_MS = 60_000;
const PROFILE_CACHE_MAX = 500;
const profileCache = new Map<string, { profile: Identity; expires: number }>();

/** Drops expired entries, then the oldest ones, so the map cannot grow without bound. */
function pruneProfileCache() {
  if (profileCache.size < PROFILE_CACHE_MAX) return;
  const now = performance.now();
  for (const [key, entry] of profileCache) {
    if (entry.expires <= now) profileCache.delete(key);
  }
  while (profileCache.size >= PROFILE_CACHE_MAX) {
    const oldest = profileCache.keys().next().value;
    if (oldest === undefined) break;
    profileCache.delete(oldest);
  }
}

/**
 * Clerk profile lookup by user ID. This hits the Clerk Backend API (rate
 * limited), so results are cached per user for a short TTL, and a stale entry
 * is served when Clerk answers with an error such as 429.
 */
async function fetchProfile(userId: string): Promise<Identity> {
  const cached = profileCache.get(userId);
  // performance.now(): Cache Components forbids Date.now() while prerendering.
  if (cached && cached.expires > performance.now()) return cached.profile;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? null;
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || email || "Anonymous";
    const profile: Identity = { userId, email, name, avatarUrl: user.imageUrl };
    pruneProfileCache();
    profileCache.set(userId, { profile, expires: performance.now() + PROFILE_TTL_MS });
    return profile;
  } catch (error) {
    if (cached) return cached.profile;
    throw error;
  }
}

/** Identity for `userId`, deduplicated within a single server render. */
export const loadIdentity = cache(fetchProfile);

/**
 * Current Clerk identity (user ID + primary email). Redirects to sign-in when
 * unauthenticated, so callers always receive a signed-in identity.
 */
export async function getIdentity(): Promise<Identity> {
  const { userId } = await auth.protect();
  return loadIdentity(userId);
}

/**
 * The project when the identity owns it or is a collaborator (matched by
 * email, case-insensitive); `null` for missing and unauthorized projects alike,
 * so callers cannot leak whether a project exists.
 */
export async function getProjectAccess(
  projectId: string,
  { userId, email }: Pick<Identity, "userId" | "email">,
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
  return loadIdentity(userId);
}
