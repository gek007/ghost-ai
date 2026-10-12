"use client";

import { useState } from "react";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const projectDialogs = useProjectDialogs();
  // Derived so renaming updates the title and deleting clears the selection.
  const selectedProject =
    projectDialogs.projects.find(
      (project) => project.id === selectedProjectId,
    ) ?? null;

  return (
    <div className="flex h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="relative flex-1 overflow-hidden">
        {selectedProject ? (
          <div className="flex h-full items-center justify-center px-6">
            <h1 className="text-2xl font-semibold text-copy-primary">
              {selectedProject.name}
            </h1>
          </div>
        ) : (
          <EditorHome onCreateProject={projectDialogs.openCreate} />
        )}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projectDialogs.projects}
          selectedProjectId={selectedProject?.id ?? null}
          onSelectProject={(project) => {
            setSelectedProjectId(project.id);
            setIsSidebarOpen(false);
          }}
          onCreateProject={projectDialogs.openCreate}
          onRenameProject={projectDialogs.openRename}
          onDeleteProject={projectDialogs.openDelete}
        />
      </main>
      <ProjectDialogs {...projectDialogs} />
    </div>
  );
}
