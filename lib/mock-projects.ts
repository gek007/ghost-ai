import type { Project } from "@/types/project";

/** Placeholder data until projects are backed by the API. */
export const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Payments Platform", role: "owner" },
  { id: "p2", name: "Realtime Chat Backend", role: "owner" },
  { id: "p3", name: "Data Ingestion Pipeline", role: "collaborator" },
];
