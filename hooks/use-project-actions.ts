"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { slugify } from "@/lib/slugify";
import type { Project } from "@/types/project";

type DialogState =
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project }
  | null;

interface UseProjectActionsOptions {
  /** ID of the project whose workspace is open, if any. */
  activeProjectId: string | null;
}

function generateSuffix() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6);
}

async function request(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data: { error?: string; project?: { id: string } } = await response
    .json()
    .catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

/**
 * Owns dialog, form, and loading state for the create / rename / delete
 * project dialogs and performs the mutations against `/api/projects`.
 */
export function useProjectActions({ activeProjectId }: UseProjectActionsOptions) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slug = slugify(name);
  // Doubles as the project ID and the Liveblocks room ID.
  const roomId = slug ? `${slug}-${suffix}` : "";

  const openCreate = useCallback(() => {
    setName("");
    setSuffix(generateSuffix());
    setError(null);
    setDialog({ type: "create" });
  }, []);

  const openRename = useCallback((project: Project) => {
    setName(project.name);
    setError(null);
    setDialog({ type: "rename", project });
  }, []);

  const openDelete = useCallback((project: Project) => {
    setError(null);
    setDialog({ type: "delete", project });
  }, []);

  const close = useCallback(() => {
    if (isLoading) return;
    setDialog(null);
  }, [isLoading]);

  const submit = useCallback(async () => {
    if (!dialog || isLoading) return;
    const trimmed = name.trim();
    if (dialog.type !== "delete" && !trimmed) return;
    if (dialog.type === "create" && !roomId) return;

    setIsLoading(true);
    setError(null);
    try {
      if (dialog.type === "create") {
        const { project } = await request("/api/projects", "POST", {
          id: roomId,
          name: trimmed,
        });
        setDialog(null);
        router.push(`/editor/${project?.id ?? roomId}`);
      } else if (dialog.type === "rename") {
        await request(`/api/projects/${dialog.project.id}`, "PATCH", {
          name: trimmed,
        });
        setDialog(null);
        router.refresh();
      } else {
        await request(`/api/projects/${dialog.project.id}`, "DELETE");
        setDialog(null);
        if (dialog.project.id === activeProjectId) router.replace("/editor");
        else router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [dialog, isLoading, name, roomId, router, activeProjectId]);

  return {
    dialog,
    name,
    setName,
    roomId,
    isLoading,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    submit,
  };
}
