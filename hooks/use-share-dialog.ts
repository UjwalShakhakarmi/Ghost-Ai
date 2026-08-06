"use client";

import * as React from "react";

export interface Collaborator {
  id: string;
  email: string;
  createdAt: string;
  displayName: string | null;
  imageUrl: string | null;
}

interface UseShareDialogOptions {
  projectId: string;
  isOwner: boolean;
}

export function useShareDialog({ projectId, isOwner }: UseShareDialogOptions) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [projectLink, setProjectLink] = React.useState("");
  const [collaborators, setCollaborators] = React.useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [isInviting, setIsInviting] = React.useState(false);
  const [removingEmail, setRemovingEmail] = React.useState<string | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  const fetchCollaborators = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error("Failed to load collaborators");
      const { collaborators: data } = await res.json();
      setCollaborators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const open = React.useCallback(() => {
    setIsOpen(true);
    setInviteEmail("");
    setError(null);
    setIsCopied(false);
    setProjectLink(`${window.location.origin}/editor/${projectId}`);
    void fetchCollaborators();
  }, [projectId, fetchCollaborators]);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const inviteCollaborator = React.useCallback(async () => {
    if (!isOwner) return;
    const email = inviteEmail.trim();
    if (!email) return;

    setIsInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to invite collaborator");
      const { collaborators: data } = await res.json();
      setCollaborators(data);
      setInviteEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsInviting(false);
    }
  }, [isOwner, inviteEmail, projectId]);

  const removeCollaborator = React.useCallback(
    async (email: string) => {
      if (!isOwner) return;

      setRemovingEmail(email);
      setError(null);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/collaborators?email=${encodeURIComponent(
            email
          )}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Failed to remove collaborator");
        const { collaborators: data } = await res.json();
        setCollaborators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setRemovingEmail(null);
      }
    },
    [isOwner, projectId]
  );

  const copyProjectLink = React.useCallback(async () => {
    if (!projectLink) return;
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API is not available");
      }
      await navigator.clipboard.writeText(projectLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy link");
    }
  }, [projectLink]);

  return {
    isOpen,
    open,
    close,
    projectLink,
    collaborators,
    isLoading,
    inviteEmail,
    setInviteEmail,
    isInviting,
    removingEmail,
    error,
    isCopied,
    inviteCollaborator,
    removeCollaborator,
    copyProjectLink,
  };
}
