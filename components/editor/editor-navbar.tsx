"use client";

import { PanelLeftClose, PanelLeftOpen, PanelRight, Share2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  /** Workspace-only: project title plus share / AI sidebar actions. */
  workspace?: {
    projectName: string;
    isAiSidebarOpen: boolean;
    onToggleAiSidebar: () => void;
  };
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  workspace,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className="relative z-30 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-surface-border bg-surface px-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
          className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
        >
          <ToggleIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex min-w-0 items-center justify-center px-2">
        {workspace && (
          <h1 className="max-w-[40vw] truncate text-sm font-medium text-copy-primary">
            {workspace.projectName}
          </h1>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {workspace && (
          <>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                workspace.isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-expanded={workspace.isAiSidebarOpen}
              onClick={workspace.onToggleAiSidebar}
              className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  );
}
