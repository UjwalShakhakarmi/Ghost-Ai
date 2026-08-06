"use client";

import Image from "next/image";
import { Check, Copy, Loader2, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Collaborator } from "@/hooks/use-share-dialog";

interface ShareDialogProps {
  isOpen: boolean;
  isOwner: boolean;
  projectName: string;
  projectLink: string;
  collaborators: Collaborator[];
  isLoading: boolean;
  inviteEmail: string;
  isInviting: boolean;
  removingEmail: string | null;
  error: string | null;
  isCopied: boolean;
  onClose: () => void;
  onInviteEmailChange: (email: string) => void;
  onInvite: () => void;
  onRemove: (email: string) => void;
  onCopyLink: () => void;
}

function initialsFor(collaborator: Collaborator): string {
  const source = collaborator.displayName || collaborator.email;
  return source.charAt(0).toUpperCase();
}

export function ShareDialog({
  isOpen,
  isOwner,
  projectName,
  projectLink,
  collaborators,
  isLoading,
  inviteEmail,
  isInviting,
  removingEmail,
  error,
  isCopied,
  onClose,
  onInviteEmailChange,
  onInvite,
  onRemove,
  onCopyLink,
}: ShareDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-copy-primary">
            Share &quot;{projectName}&quot;
          </DialogTitle>
          <DialogDescription className="text-sm text-copy-muted">
            {isOwner
              ? "Invite collaborators by email or share the project link."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Project link */}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              aria-label="Project link"
              value={projectLink}
              className="rounded-xl border border-surface-border bg-subtle text-copy-primary"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onCopyLink}
              className="shrink-0 gap-1.5 rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          {/* Invite form (owner only) */}
          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onInvite();
              }}
              className="flex items-center gap-2"
            >
              <Input
                type="email"
                aria-label="Invitation email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => onInviteEmailChange(e.target.value)}
                className="rounded-xl border border-surface-border bg-subtle text-copy-primary placeholder:text-copy-faint focus:border-brand"
              />
              <Button
                type="submit"
                disabled={!inviteEmail.trim() || isInviting}
                className="shrink-0 rounded-xl bg-brand font-semibold text-bg-base hover:bg-brand/90"
              >
                {isInviting ? "Inviting..." : "Invite"}
              </Button>
            </form>
          )}

          {error && <p className="text-xs text-state-error">{error}</p>}

          {/* Collaborator list */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-copy-secondary uppercase tracking-wider">
              Collaborators
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
              </div>
            ) : collaborators.length > 0 ? (
              <ul className="max-h-56 space-y-1.5 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <li
                    key={collaborator.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-subtle/50 p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {collaborator.imageUrl ? (
                        <Image
                          src={collaborator.imageUrl}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-copy-secondary">
                          {initialsFor(collaborator)}
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-copy-primary">
                          {collaborator.displayName || collaborator.email}
                        </span>
                        {collaborator.displayName && (
                          <span className="truncate text-xs text-copy-muted">
                            {collaborator.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(collaborator.email)}
                        disabled={removingEmail === collaborator.email}
                        className="h-7 w-7 shrink-0 rounded-lg text-copy-muted hover:bg-elevated hover:text-state-error"
                        title="Remove collaborator"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border bg-elevated/50 p-6 text-center">
                <Users className="h-8 w-8 text-copy-faint" />
                <p className="text-xs text-copy-muted">No collaborators yet.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
