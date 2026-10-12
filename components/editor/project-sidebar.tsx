"use client";

import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="text-copy-faint">{icon}</div>
      <p className="text-sm font-medium text-copy-secondary">{title}</p>
      <p className="text-xs text-copy-muted">{description}</p>
    </div>
  );
}

interface ProjectItemProps {
  project: Project;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectItem({ project, onRename, onDelete }: ProjectItemProps) {
  const isOwner = project.role === "owner";

  return (
    <li className="group flex items-center gap-1 rounded-xl px-3 py-1.5 hover:bg-subtle">
      <span className="min-w-0 flex-1 truncate text-sm text-copy-secondary">
        {project.name}
      </span>
      {isOwner && (
        <div className="flex shrink-0 items-center opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename(project)}
            className="text-copy-muted hover:text-copy-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete(project)}
            className="text-copy-muted hover:text-state-error"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </li>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const owned = projects.filter((project) => project.role === "owner");
  const shared = projects.filter((project) => project.role !== "owner");

  const renderList = (items: Project[]) => (
    <ul className="flex flex-col gap-0.5 p-2">
      {items.map((project) => (
        <ProjectItem
          key={project.id}
          project={project}
          onRename={onRenameProject}
          onDelete={onDeleteProject}
        />
      ))}
    </ul>
  );

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 z-10 bg-black/60 md:hidden"
        />
      )}
      <aside
        aria-label="Projects"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "absolute inset-y-0 left-0 z-20 flex w-80 flex-col border-r border-surface-border bg-surface/95 backdrop-blur transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close sidebar"
            onClick={onClose}
            className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-0">
          <TabsList className="mx-4 mt-3 w-auto">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="overflow-y-auto">
            {owned.length > 0 ? (
              renderList(owned)
            ) : (
              <EmptyState
                icon={<FolderOpen className="h-8 w-8" />}
                title="No projects yet"
                description="Create your first project to get started."
              />
            )}
          </TabsContent>
          <TabsContent value="shared" className="overflow-y-auto">
            {shared.length > 0 ? (
              renderList(shared)
            ) : (
              <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="Nothing shared with you"
                description="Projects others share with you will appear here."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-4">
          <Button className="w-full" onClick={onCreateProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
