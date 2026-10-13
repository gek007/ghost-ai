import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { EditorShell } from "@/components/editor/editor-shell";
import { WorkspaceSkeleton } from "@/components/editor/workspace-skeleton";
import { getUserProjects } from "@/lib/projects";

async function Editor() {
  const { userId } = await auth.protect();
  const projects = await getUserProjects(userId);
  return <EditorShell projects={projects} activeProjectId={null} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <Editor />
    </Suspense>
  );
}
