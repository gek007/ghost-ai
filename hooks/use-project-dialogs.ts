"use client";

import { useCallback, useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock-projects";
import { slugify } from "@/lib/slugify";
import type { Project } from "@/types/project";

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project }
  | null;

/** Placeholder latency until the dialogs call real API routes. */
const MOCK_LATENCY_MS = 400;

/**
 * Owns dialog, form, and loading state for the create / rename / delete
 * project dialogs. Submission is mocked: projects live in in-memory state only, with no API
 * calls or persistence.
 */
export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const slug = slugify(name);

  const openCreate = useCallback(() => {
    setName("");
    setDialog({ type: "create" });
  }, []);

  const openRename = useCallback((project: Project) => {
    setName(project.name);
    setDialog({ type: "rename", project });
  }, []);

  const openDelete = useCallback((project: Project) => {
    setDialog({ type: "delete", project });
  }, []);

  const close = useCallback(() => {
    if (isLoading) return;
    setDialog(null);
  }, [isLoading]);

  const submit = useCallback(async () => {
    if (!dialog || isLoading) return;
    if (dialog.type !== "delete" && !name.trim()) return;
    if (dialog.type === "create" && !slug) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    const trimmed = name.trim();
    if (dialog.type === "create") {
      setProjects((current) => [
        { id: crypto.randomUUID(), name: trimmed, role: "owner" },
        ...current,
      ]);
    } else if (dialog.type === "rename") {
      setProjects((current) =>
        current.map((project) =>
          project.id === dialog.project.id
            ? { ...project, name: trimmed }
            : project,
        ),
      );
    } else {
      setProjects((current) =>
        current.filter((project) => project.id !== dialog.project.id),
      );
    }
    setIsLoading(false);
    setDialog(null);
  }, [dialog, isLoading, name, slug]);

  return {
    projects,
    dialog,
    name,
    setName,
    slug,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}
