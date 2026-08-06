Wire the editor home sidebar and dialogs to the real project API.

### Data Fetching

The editor home page is a server component.

Fetch owned and shared projects server-side using the existing project data helper and pass both lists to the sidebar.

No client-side fetching for initial load.

### `useProjectActions`

Create a hook in `hooks/` that manages dialog state and project mutations.

**Create**

- manage create dialog state
- manage project name input
- generate a short unique suffix and slugify the name to render a cosmetic room ID preview only — this value is never sent to the server and never used as an identifier
- call `POST /api/projects`
- navigate to the new workspace using the project's Prisma `cuid` (`project.id`) returned by the API

The canonical Liveblocks room ID is the project's Prisma `cuid`. The project ID and Liveblocks room ID must be the exact same value everywhere (URL route segment, future Liveblocks room, and database record) — never a client-generated slug/suffix.

**Rename**

- store target project id + current name
- call `PATCH /api/projects/[id]`
- refresh on success

**Delete**

- store target project
- call `DELETE /api/projects/[id]`
- redirect to `/editor` if deleting the active workspace
- otherwise refresh

### Wiring

Connect the hook to the sidebar and dialogs.

- create dialog shows room ID preview
- rename dialog pre-fills current name
- delete dialog shows project name

### Check When Done

- sidebar uses real project data
- create navigates to workspace
- rename updates correctly
- delete refreshes or redirects correctly
- `npm run build` passes
