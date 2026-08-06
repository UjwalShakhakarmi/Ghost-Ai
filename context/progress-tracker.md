# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 7: Editor Home Wired To Real Data

## Current Goal

- Verify end-to-end project CRUD in a real browser session, then proceed to Canvas Core & Node Components.

## Completed

- 01-design-system.md (Design System & UI Primitives)
- 02-editor.md (Editor Chrome & Project Sidebar)
- 03-auth.md (Clerk Authentication & Route Protection)
- 04-project-dialogs.md (Project Dialogs & Editor Home)
- 05-prisma.md (Prisma Schema & Database Client)
- 06-project-apis.md (Project REST API Routes)
- 07-wire-editor-home.md (Wire Editor Home To Real Project API)

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

## Session Notes

- Completed implementation of `05-prisma.md`.
- Models `Project` and `ProjectCollaborator` created with required relations, unique constraints, and indexes.
- `lib/prisma.ts` implemented as global singleton.
- Completed `06-project-apis.md`: added `app/api/projects/route.ts` (GET/POST) and `app/api/projects/[projectId]/route.ts` (PATCH/DELETE) with Clerk auth + owner checks. `npm run build` and `npm run lint` pass.
- Completed `07-wire-editor-home.md`: `EditorWorkspace` now takes `ownedProjects`/`sharedProjects`/`activeProjectId` props from server components instead of mock data; added `app/editor/[projectId]/page.tsx` for workspace navigation after create; removed `hooks/use-project-dialogs.ts` (superseded by `use-project-actions.ts`).
- Verified unauthenticated requests are rejected before reaching route logic (Clerk dev-browser handshake redirects raw `curl` requests in dev, identical to pre-existing `/` and `/editor` behavior) — could not complete a full interactive sign-in browser pass in this session, so real end-to-end CRUD through the UI still needs manual verification.

