"use client";

import { useState } from "react";
import { EditorHome } from "@/components/editor/editor-home";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectDialogs = useProjectDialogs();

  return (
    <div className="flex h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />
      <main className="relative flex-1 overflow-hidden">
        <EditorHome onCreateProject={projectDialogs.openCreate} />
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projectDialogs.projects}
          onCreateProject={projectDialogs.openCreate}
          onRenameProject={projectDialogs.openRename}
          onDeleteProject={projectDialogs.openDelete}
        />
      </main>
      <ProjectDialogs {...projectDialogs} />
    </div>
  );
}
