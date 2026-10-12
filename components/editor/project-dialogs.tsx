"use client";

import type { FormEvent } from "react";
import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

type ProjectDialogsProps = Omit<
  ReturnType<typeof useProjectDialogs>,
  "projects"
>;

const FORM_ID = "project-dialog-form";

export function ProjectDialogs({
  dialog,
  name,
  setName,
  slug,
  isLoading,
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

  const canSubmit = name.trim().length > 0 && !isLoading;

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
            <Button type="submit" form={FORM_ID} disabled={!canSubmit}>
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
            Slug:{" "}
            <span className="font-mono text-copy-secondary">
              {slug || "your-project-name"}
            </span>
          </p>
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
            <Button type="submit" form={FORM_ID} disabled={!canSubmit}>
              {isLoading ? "Saving…" : "Rename"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <Input
            autoFocus
            className="!text-copy-primary placeholder:text-copy-faint"
            aria-label="Project name"
            placeholder="Project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isLoading}
          />
        </form>
      </EditorDialog>

      <EditorDialog
        open={dialog?.type === "delete"}
        onOpenChange={handleOpenChange}
        title="Delete project"
        description={
          dialog?.type === "delete"
            ? `Delete “${dialog.project.name}”? This action cannot be undone.`
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
      />
    </>
  );
}
