"use client";

import * as React from "react";
import Image from "next/image";
import { Panel } from "@xyflow/react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useOthers, shallow } from "@liveblocks/react";

const MAX_VISIBLE_AVATARS = 5;
const FALLBACK_COLOR = "#808090";

interface CollaboratorInfo {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

function initialsFor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function CollaboratorAvatar({ collaborator }: { collaborator: CollaboratorInfo }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showImage = Boolean(collaborator.avatar) && !imageFailed;

  return (
    <div
      title={collaborator.name}
      className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-surface"
      style={{ backgroundColor: showImage ? undefined : collaborator.color }}
    >
      {showImage ? (
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          fill
          unoptimized
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-white">
          {initialsFor(collaborator.name)}
        </span>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { user } = useUser();
  const currentUserId = user?.id;

  const collaborators = useOthers(
    (others) =>
      others
        .filter((other) => other.id !== currentUserId)
        .map((other) => ({
          id: other.id,
          name: other.info?.name || "Anonymous",
          avatar: other.info?.avatar || "",
          color: other.info?.color || FALLBACK_COLOR,
        })),
    shallow
  );

  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = collaborators.length - visibleCollaborators.length;
  const hasCollaborators = collaborators.length > 0;

  return (
    <Panel position="top-right">
      <div className="flex items-center gap-2.5 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur select-none">
        {hasCollaborators && (
          <>
            <div className="flex items-center -space-x-2">
              {visibleCollaborators.map((collaborator) => (
                <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
              ))}
              {overflowCount > 0 && (
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-[11px] font-semibold text-copy-secondary ring-2 ring-surface">
                  +{overflowCount}
                </div>
              )}
            </div>
            <div className="h-5 w-px shrink-0 bg-surface-border" />
          </>
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 rounded-full border border-surface-border",
            },
          }}
        />
      </div>
    </Panel>
  );
}
