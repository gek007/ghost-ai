import { clerkClient } from "@clerk/nextjs/server";
import type { Collaborator } from "@/types/project";

const CLERK_EMAIL_FILTER_LIMIT = 100;

interface CollaboratorRow {
  id: string;
  email: string;
}

/**
 * Attaches Clerk display name and avatar to collaborator rows by email.
 * Collaborators without a Clerk user, or any Clerk failure, fall back to email only.
 */
export async function enrichCollaborators(rows: CollaboratorRow[]): Promise<Collaborator[]> {
  const profiles = new Map<string, { name: string | null; imageUrl: string | null }>();

  if (rows.length > 0) {
    try {
      const client = await clerkClient();
      const emails = rows.map((row) => row.email);
      for (let i = 0; i < emails.length; i += CLERK_EMAIL_FILTER_LIMIT) {
        const batch = emails.slice(i, i + CLERK_EMAIL_FILTER_LIMIT);
        const { data: users } = await client.users.getUserList({
          emailAddress: batch,
          limit: CLERK_EMAIL_FILTER_LIMIT,
        });
        for (const user of users) {
          const name =
            [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null;
          for (const { emailAddress } of user.emailAddresses) {
            profiles.set(emailAddress.toLowerCase(), { name, imageUrl: user.imageUrl });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load collaborator profiles from Clerk", error);
    }
  }

  return rows.map(({ id, email }) => ({
    id,
    email,
    name: profiles.get(email.toLowerCase())?.name ?? null,
    imageUrl: profiles.get(email.toLowerCase())?.imageUrl ?? null,
  }));
}
