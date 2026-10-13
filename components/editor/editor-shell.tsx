"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { UserProjects } from "@/types/project";

interface EditorShellProps {
  projects: UserProjects;
  activeProjectId: string | null;
}

export function EditorShell({ projects, activeProjectId }: EditorShellProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const projectActions = useProjectActions({ activeProjectId });
  const activeProject =
    [...projects.owned, ...projects.shared].find(
      (project) => project.id === activeProjectId,
    ) ?? null;

  return (
    <div className="flex h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        workspace={
          activeProject
            ? {
                projectName: activeProject.name,
                isAiSidebarOpen,
                onToggleAiSidebar: () => setIsAiSidebarOpen((open) => !open),
              }
            : undefined
        }
      />
      <main className="relative flex-1 overflow-hidden">
        {activeProject ? (
          <div className="flex h-full">
            <div className="flex min-w-0 flex-1 items-center justify-center bg-base px-6">
              <p className="text-sm text-copy-muted">
                Canvas for {activeProject.name} coming soon
              </p>
            </div>
            <aside
              aria-label="AI assistant"
              aria-hidden={!isAiSidebarOpen}
              inert={!isAiSidebarOpen}
              className={cn(
                "flex shrink-0 flex-col overflow-hidden border-surface-border bg-surface transition-[width] duration-200 ease-out",
                isAiSidebarOpen ? "w-80 border-l" : "w-0",
              )}
            >
              <div className="flex h-12 w-80 shrink-0 items-center border-b border-surface-border px-4">
                <h2 className="text-sm font-semibold text-copy-primary">AI Assistant</h2>
              </div>
              <div className="flex w-80 flex-1 items-center justify-center px-6 text-center">
                <p className="text-xs text-copy-muted">AI chat coming soon</p>
              </div>
            </aside>
          </div>
        ) : (
          <EditorHome onCreateProject={projectActions.openCreate} />
        )}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={projects.owned}
          sharedProjects={projects.shared}
          selectedProjectId={activeProject?.id ?? null}
          onSelectProject={(project) => {
            setIsSidebarOpen(false);
            router.push(`/editor/${project.id}`);
          }}
          onCreateProject={projectActions.openCreate}
          onRenameProject={projectActions.openRename}
          onDeleteProject={projectActions.openDelete}
        />
      </main>
      <ProjectDialogs {...projectActions} />
    </div>
  );
}
