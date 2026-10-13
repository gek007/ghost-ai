"use client";

import { Check, Link2, Loader2, X } from "lucide-react";
import type { FormEvent } from "react";
import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShareDialog } from "@/hooks/use-share-dialog";
import type { Collaborator } from "@/types/project";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** Only owners can invite and remove; collaborators get a read-only list. */
  isOwner: boolean;
}

function CollaboratorAvatar({ collaborator }: { collaborator: Collaborator }) {
  if (collaborator.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- small remote Clerk avatar
      <img
        src={collaborator.imageUrl}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full bg-subtle object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium uppercase text-copy-secondary"
    >
      {(collaborator.name ?? collaborator.email).charAt(0)}
    </span>
  );
}

/** Mounts the dialog body only while open, so collaborators reload and form state resets each time. */
export function ShareDialog(props: ShareDialogProps) {
  return props.open ? <OpenShareDialog {...props} /> : null;
}

function OpenShareDialog({ open, onOpenChange, projectId, isOwner }: ShareDialogProps) {
  const share = useShareDialog({ projectId });

  function handleInvite(event: FormEvent) {
    event.preventDefault();
    void share.invite();
  }

  return (
    <EditorDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share project"
      description={
        isOwner
          ? "Invite people by email. Collaborators can open this project."
          : "People with access to this project."
      }
      footer={
        <Button variant="outline" onClick={() => void share.copyLink()}>
          {share.copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {share.copied ? "Copied!" : "Copy link"}
        </Button>
      }
    >
      {isOwner && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            className="!text-copy-primary placeholder:text-copy-faint"
            aria-label="Collaborator email"
            placeholder="name@example.com"
            value={share.email}
            onChange={(event) => share.setEmail(event.target.value)}
            disabled={share.isInviting}
          />
          <Button type="submit" disabled={!share.email.trim() || share.isInviting}>
            {share.isInviting ? "Inviting…" : "Invite"}
          </Button>
        </form>
      )}
      {share.error && (
        <p role="alert" className="text-xs text-state-error">
          {share.error}
        </p>
      )}
      <div className="grid gap-2">
        <h3 className="text-xs font-medium text-copy-muted">Collaborators</h3>
        {share.isLoading ? (
          <div className="flex justify-center py-4 text-copy-muted">
            <Loader2 className="h-4 w-4 animate-spin" aria-label="Loading collaborators" />
          </div>
        ) : share.collaborators.length === 0 ? (
          <p className="py-2 text-sm text-copy-muted">No collaborators yet.</p>
        ) : (
          <ul className="grid max-h-60 gap-1 overflow-y-auto">
            {share.collaborators.map((collaborator) => (
              <li key={collaborator.id} className="flex items-center gap-3 py-1">
                <CollaboratorAvatar collaborator={collaborator} />
                <div className="min-w-0 flex-1">
                  {collaborator.name && (
                    <p className="truncate text-sm text-copy-primary">{collaborator.name}</p>
                  )}
                  <p
                    className={
                      collaborator.name
                        ? "truncate text-xs text-copy-muted"
                        : "truncate text-sm text-copy-primary"
                    }
                  >
                    {collaborator.email}
                  </p>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${collaborator.email}`}
                    disabled={share.removingId === collaborator.id}
                    onClick={() => void share.remove(collaborator.id)}
                    className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </EditorDialog>
  );
}
