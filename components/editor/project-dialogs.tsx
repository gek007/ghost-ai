"use client";

import type { FormEvent } from "react";
import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectActions } from "@/hooks/use-project-actions";

type ProjectDialogsProps = ReturnType<typeof useProjectActions>;

const FORM_ID = "project-dialog-form";

export function ProjectDialogs({
  dialog,
  name,
  setName,
  roomId,
  isLoading,
  error,
  close,
  submit,
}: ProjectDialogsProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const hasName = name.trim().length > 0;
  const canCreate = hasName && roomId.length > 0 && !isLoading;
  const canRename = hasName && !isLoading;

  const errorMessage = error && (
    <p role="alert" className="text-xs text-state-error">
      {error}
    </p>
  );

  const cancel = (
    <Button variant="ghost" onClick={close} disabled={isLoading}>
      Cancel
    </Button>
  );

  return (
    <>
      <EditorDialog
        open={dialog?.type === "create"}
        onOpenChange={handleOpenChange}
        title="Create project"
        description="Give your architecture workspace a name."
        footer={
          <>
            {cancel}
            <Button type="submit" form={FORM_ID} disabled={!canCreate}>
              {isLoading ? "Creating…" : "Create project"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-2">
          <Input
            autoFocus
            className="!text-copy-primary placeholder:text-copy-faint"
            aria-label="Project name"
            placeholder="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-copy-muted">
            Room ID:{" "}
            {roomId || !name.trim() ? (
              <span className="font-mono text-copy-secondary">
                {roomId || "your-project-name-xxxxxx"}
              </span>
            ) : (
              <span className="text-state-warning">
                unavailable — use letters or numbers (a–z, 0–9)
              </span>
            )}
          </p>
          {errorMessage}
        </form>
      </EditorDialog>

      <EditorDialog
        open={dialog?.type === "rename"}
        onOpenChange={handleOpenChange}
        title="Rename project"
        description={
          dialog?.type === "rename"
            ? `Current name: ${dialog.project.name}`
            : undefined
        }
        footer={
          <>
            {cancel}
            <Button type="submit" form={FORM_ID} disabled={!canRename}>
              {isLoading ? "Saving…" : "Rename"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} className="grid gap-2">
          <Input
            autoFocus
            className="!text-copy-primary placeholder:text-copy-faint"
            aria-label="Project name"
            placeholder="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
          />
          {errorMessage}
        </form>
      </EditorDialog>

      <EditorDialog
        open={dialog?.type === "delete"}
        onOpenChange={handleOpenChange}
        title="Delete project"
        description={
          dialog?.type === "delete"
            ? `Delete “${dialog.project.name}”? This permanently removes the project.`
            : undefined
        }
        footer={
          <>
            {cancel}
            <Button
              variant="destructive"
              onClick={() => void submit()}
              disabled={isLoading}
            >
              {isLoading ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        {errorMessage}
      </EditorDialog>
    </>
  );
}
