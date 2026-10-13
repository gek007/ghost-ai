"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Collaborator } from "@/types/project";

const COPIED_FEEDBACK_MS = 2000;

interface UseShareDialogOptions {
  projectId: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Something went wrong");
  return data as T;
}

/**
 * Loads and mutates a project's collaborators and handles the copy-link feedback.
 * Mount it only while the dialog is open so the list reloads and state resets on each open.
 */
export function useShareDialog({ projectId }: UseShareDialogOptions) {
  const baseUrl = `/api/projects/${projectId}/collaborators`;
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let ignore = false;
    request<{ collaborators: Collaborator[] }>(baseUrl)
      .then((data) => !ignore && setCollaborators(data.collaborators))
      .catch((err: Error) => !ignore && setError(err.message))
      .finally(() => !ignore && setIsLoading(false));
    return () => {
      ignore = true;
    };
  }, [baseUrl]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const invite = useCallback(async () => {
    setIsInviting(true);
    setError(null);
    try {
      const { collaborator } = await request<{ collaborator: Collaborator }>(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCollaborators((current) => [...current, collaborator]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsInviting(false);
    }
  }, [baseUrl, email]);

  const remove = useCallback(
    async (collaboratorId: string) => {
      setRemovingId(collaboratorId);
      setError(null);
      try {
        await request(`${baseUrl}/${collaboratorId}`, { method: "DELETE" });
        setCollaborators((current) => current.filter((item) => item.id !== collaboratorId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setRemovingId(null);
      }
    },
    [baseUrl],
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`);
    } catch {
      setError("Couldn't copy the link");
      return;
    }
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }, [projectId]);

  return {
    collaborators,
    isLoading,
    email,
    setEmail,
    isInviting,
    removingId,
    error,
    copied,
    invite,
    remove,
    copyLink,
  };
}
