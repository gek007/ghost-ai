export type ProjectRole = "owner" | "collaborator";

export interface Project {
  id: string;
  name: string;
  role: ProjectRole;
}

export interface UserProjects {
  owned: Project[];
  shared: Project[];
}

export interface Collaborator {
  id: string;
  email: string;
  /** Display name and avatar from Clerk; null when no Clerk user matches the email. */
  name: string | null;
  imageUrl: string | null;
}
