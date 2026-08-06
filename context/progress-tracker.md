# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 9: Share Dialog & Collaborator Management

## Current Goal

- Verify end-to-end project CRUD, `/editor/[roomId]` access checks, and the share dialog (invite/remove/copy-link) in a real browser session, then proceed to Canvas Core & Node Components.

## Completed

- 01-design-system.md (Design System & UI Primitives)
- 02-editor.md (Editor Chrome & Project Sidebar)
- 03-auth.md (Clerk Authentication & Route Protection)
- 04-project-dialogs.md (Project Dialogs & Editor Home)
- 05-prisma.md (Prisma Schema & Database Client)
- 06-project-apis.md (Project REST API Routes)
- 07-wire-editor-home.md (Wire Editor Home To Real Project API)
- 08-editor-workspace-shell.md (Editor Workspace Shell & Access Checks)
- 09-share-dialog.md (Share Dialog & Collaborator Management)

## In Progress

- None.

## Next Up

- Canvas Core & Node Components

## Open Questions

- None.

## Architecture Decisions

- Created multi-file Prisma schema structure with `prisma/models/project.prisma` containing `Project` and `ProjectCollaborator` models.
- Configured cached PrismaClient singleton in `lib/prisma.ts` with conditional branching for `prisma+postgres://` (Accelerate) vs `@prisma/adapter-pg`.
- Added `lib/projects.ts` as the shared project data-access helper (owned/shared lookups, create/rename/delete) used by both API routes and server components.
- `GET/POST /api/projects` and `PATCH/DELETE /api/projects/[projectId]` enforce Clerk auth (401) and owner-only mutation checks (403) before touching Prisma.
- `/editor` and `/editor/[projectId]` are server components that fetch owned + shared projects directly via `lib/projects.ts` (no client-side fetch for initial load); `[projectId]` marks the active workspace so delete can redirect correctly.
- Replaced the mock `useProjectDialogs` hook with `useProjectActions` (`hooks/use-project-actions.ts`), which calls the real REST API and uses `router.push`/`router.refresh` instead of local mock state.
- The create dialog's room ID preview (slugified name + client-generated short suffix) is cosmetic only; the authoritative project ID is always the Prisma-generated `cuid` returned by `POST /api/projects`, which is then reused as the workspace route segment (future Liveblocks room id) — the two are never allowed to diverge.
- Sidebar project rows now show a formatted `updatedAt` date instead of a `slug`, since `Project` has no slug field in the schema.
- Added `lib/project-access.ts` outside the page component: `getCurrentIdentity()` (Clerk `userId` + primary email) and `hasProjectAccess(project, identity)` (true for the owner, or for a collaborator matched by email against `ProjectCollaborator`).
- Renamed the workspace route segment from `/editor/[projectId]` to `/editor/[roomId]` to make explicit that the route segment, the Prisma `cuid`, and the future Liveblocks room id are the same canonical value.
- `/editor/[roomId]` is a server component: redirects unauthenticated visitors to `/sign-in`, and renders the new `components/editor/access-denied.tsx` (centered, lock icon, link back to `/editor`) for missing or unauthorized projects, before ever rendering the workspace shell.
- Split the "active project" workspace UI out of `EditorWorkspace` (now home-listing only) into a dedicated `components/editor/editor-workspace-shell.tsx`, since the two views diverged too much to share one component: full-viewport layout, `EditorNavbar` showing the project name plus new Share/AI-toggle actions, `ProjectSidebar` with the current room highlighted (`activeProjectId` prop), a canvas placeholder, and a new `components/editor/ai-sidebar.tsx` slide-over placeholder on the right.
- AI sidebar toggle remains UI-only per spec scope — no AI chat logic wired yet.
- Added `lib/collaborators.ts`: `listCollaboratorsWithClerkData()` reads `ProjectCollaborator` rows and enriches them via Clerk's Backend API (`clerkClient().users.getUserList({ emailAddress })`), matched back to each collaborator by lowercased email; falls back to email-only display when no Clerk user is found. `addCollaborator`/`removeCollaborator` upsert/delete by the `projectId_email` compound key. No local user table was added, per spec.
- `GET/POST/DELETE /api/projects/[projectId]/collaborators` (single route file): GET is available to the owner or any collaborator (`hasProjectAccess`); POST and DELETE are owner-only (403 otherwise), matching "collaborators can view only, not invite/remove/manage."
- The Share button in `EditorNavbar` now opens `components/editor/share-dialog.tsx` (wired via `hooks/use-share-dialog.ts`) instead of a no-op. The dialog always shows the project link (with `Copied!` feedback on copy) and the collaborator list; the invite form and per-row remove buttons only render when `project.isOwner` is true. `isOwner` is computed server-side in `app/editor/[roomId]/page.tsx` (`project.ownerId === identity.userId`) and passed down through `EditorWorkspaceShell`.
- Collaborator avatars use `next/image` with `unoptimized` (Clerk-hosted URLs aren't in the Image Optimization allowlist) and fall back to an initial-letter badge when no Clerk user/avatar is found.

## Session Notes

- Completed implementation of `05-prisma.md`.
- Models `Project` and `ProjectCollaborator` created with required relations, unique constraints, and indexes.
- `lib/prisma.ts` implemented as global singleton.
- Completed `06-project-apis.md`: added `app/api/projects/route.ts` (GET/POST) and `app/api/projects/[projectId]/route.ts` (PATCH/DELETE) with Clerk auth + owner checks. `npm run build` and `npm run lint` pass.
- Completed `07-wire-editor-home.md`: `EditorWorkspace` now takes `ownedProjects`/`sharedProjects`/`activeProjectId` props from server components instead of mock data; added `app/editor/[projectId]/page.tsx` for workspace navigation after create; removed `hooks/use-project-dialogs.ts` (superseded by `use-project-actions.ts`).
- Verified unauthenticated requests are rejected before reaching route logic (Clerk dev-browser handshake redirects raw `curl` requests in dev, identical to pre-existing `/` and `/editor` behavior) — could not complete a full interactive sign-in browser pass in this session, so real end-to-end CRUD through the UI still needs manual verification.
- Completed `08-editor-workspace-shell.md`: moved `app/editor/[projectId]` to `app/editor/[roomId]`, added `lib/project-access.ts`, `components/editor/access-denied.tsx`, `components/editor/ai-sidebar.tsx`, and `components/editor/editor-workspace-shell.tsx`. `npm run build` and `npm run lint` pass; confirmed via a clean local `next dev` run that both `/editor` and `/editor/[roomId]` compile and route correctly with no server-side errors (only the pre-existing Clerk dev-browser redirect noise from unauthenticated `curl` requests, not a regression).
- Completed `09-share-dialog.md`: added `lib/collaborators.ts`, `app/api/projects/[projectId]/collaborators/route.ts` (GET/POST/DELETE), `hooks/use-share-dialog.ts`, and `components/editor/share-dialog.tsx`; wired the navbar Share button to it in `editor-workspace-shell.tsx`. `npm run build` and `npm run lint` pass. During this session's local `next dev` run, the user's own browser was observed successfully loading `/editor` and a real `/editor/[roomId]` (200s, no server errors) against the updated code, though the share dialog's invite/remove/copy flow itself still needs a manual click-through pass to confirm end-to-end.

