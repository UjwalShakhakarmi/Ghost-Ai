# Prisma Schema & Database Client

## Goal

Set up Prisma ORM, define PostgreSQL models for relational metadata (Projects, Collaborators, Specs, Task Runs), and export a global Prisma client instance in `lib/db.ts`.

## Implementation

1. Install `prisma` (dev dependency) and `@prisma/client`.
2. Initialize `prisma/schema.prisma` configured for PostgreSQL data source.
3. Define the core schema models:
   - `Project` (id, name, slug, ownerId, canvasJsonPath, timestamps, relations)
   - `Collaborator` (id, projectId, userId, role, timestamps)
   - `Spec` (id, projectId, title, filePath, timestamps)
   - `TaskRun` (id, projectId, runId, taskType, status, timestamps)
4. Generate Prisma Client (`npx prisma generate`).
5. Create `lib/db.ts` with a global singleton `db` instance to prevent multiple client connections in hot reloading.

## Check When Done

- `prisma/schema.prisma` validates cleanly (`npx prisma validate`)
- Prisma client generated without errors
- `lib/db.ts` exports `db` singleton
- `npm run build` passes
