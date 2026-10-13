import { Suspense } from "react";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorShell } from "@/components/editor/editor-shell";
import { WorkspaceSkeleton } from "@/components/editor/workspace-skeleton";
import { getIdentity, getProjectAccess } from "@/lib/project-access";
import { getUserProjects } from "@/lib/projects";

async function Workspace({ params }: { params: Promise<{ roomId: string }> }) {
  const identity = await getIdentity();
  const { roomId } = await params;

  const project = await getProjectAccess(roomId, identity);
  if (!project) return <AccessDenied />;

  const projects = await getUserProjects(identity.userId);
  return <EditorShell projects={projects} activeProjectId={project.id} />;
}

// Request-time data is read inside the Suspense boundary so navigation stays instant.
export default function WorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <Workspace params={params} />
    </Suspense>
  );
}
