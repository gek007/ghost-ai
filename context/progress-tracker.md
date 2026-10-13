# Progress Tracker

Update this file after every step: tick the checkbox when a step is done, and add new steps as features are scoped.

## Status

- **Current phase:** Feature 14 (Node Editing) — implemented; browser check pending
- **Current goal:** Verify Features 10-12 in the browser with a real key, then scope the next feature

## To-Do

### Feature 01: Design System
- [x] Initialize shadcn/ui (v4.21, base-nova, @base-ui/react) for Tailwind v4
- [x] Add Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea to `components/ui/` (unmodified)
- [x] Install lucide-react
- [x] `lib/utils.ts` re-exports `cn()` from the shadcn `cn` package
- [x] Dark-only `globals.css`: ui-context tokens on `:root`, mapped via `@theme inline`, shadcn variables pointed at tokens, `.dark` block removed, circular `--font-sans` fixed
- [x] `dark` class set on `<html>` so generated `dark:` variants apply
- [x] `npm run build` passes

### Feature 02: Editor Chrome
- [x] `editor-navbar.tsx`: fixed h-14 navbar, left/center/right grid, sidebar toggle (PanelLeftOpen/PanelLeftClose)
- [x] `project-sidebar.tsx`: absolute overlay sliding from left, `isOpen`/`onClose` props, Projects header, Tabs (My Projects / Shared) with empty states, full-width New Project button
- [x] `editor-dialog.tsx`: token-styled dialog pattern (title, description, body, footer actions)
- [x] `editor-shell.tsx`: client state holder
- [x] tsc, eslint, and `npm run build` pass

### Feature 03: Auth
- [x] Install `@clerk/nextjs` and `@clerk/ui`
- [x] `ClerkProvider` in root layout inside `<Suspense>` (required by cacheComponents)
- [x] Clerk `dark` theme + CSS-variable appearance in `lib/clerk-appearance.ts`
- [x] `proxy.ts` at project root: bare `clerkMiddleware()` (session + early redirect only, no route matcher protection)
- [x] Resource-level auth: `await auth.protect()` in `/editor` page; required in every protected page, route handler, and Server Function going forward
- [x] `lib/auth-routes.ts`: sign-in/up URLs from env with `/sign-in` / `/sign-up` fallback, passed to `clerkMiddleware` and `ClerkProvider`
- [x] `/sign-in` and `/sign-up` pages with two-panel `components/auth/auth-layout.tsx`
- [x] `/` redirects to `/editor` (signed in) or `/sign-in` (signed out)
- [x] Editor moved to `/editor`
- [x] `UserButton` in editor navbar right section
- [x] `npm run build` passes
- [x] Production server check: `/editor` streams a redirect to `/sign-in` with no editor content in the response (200 status because PPR streams the redirect); `/sign-in` and `/sign-up` → 200
- [ ] Manual browser check: sign up a test user, confirm redirect to `/editor` and `UserButton` appears

### Feature 04: Project Dialogs
- [x] `EditorHome` centered heading/description/New Project button, wired to the Create dialog
- [x] `hooks/use-project-dialogs.ts`: dialog, form (name), and loading state; mocked submit; projects held in in-memory state so create/rename/delete update the sidebar (no API/persistence, resets on reload)
- [x] `project-dialogs.tsx`: Create (live slug preview via `lib/slugify.ts`), Rename (prefilled, autofocus, Enter submits, current name in description), Delete (destructive confirm, no input)
- [x] Sidebar: mock projects (`lib/mock-projects.ts`), rename/delete actions for owned projects only, New Project wired to Create
- [x] Mobile: backdrop scrim closes the sidebar on tap
- [x] tsc and eslint pass
- [ ] Manual browser check of dialogs and sidebar actions

### Feature 05: Prisma
- [x] `prisma/models/project.prisma`: `ProjectStatus` enum, `Project`, `ProjectCollaborator` (cascade delete, unique project/email, indexes per spec)
- [x] `lib/prisma.ts`: cached singleton (global in dev); `prisma+postgres://` uses `accelerateUrl`, otherwise `@prisma/adapter-pg`
- [x] `prisma.config.ts` loads `.env.local` first (real `DATABASE_URL`), then `.env` (placeholder)
- [x] Migration `init` applied, client generated to `app/generated/prisma`
- [x] `npm run build` passes

### Feature 06: Project APIs
- [x] `GET/POST /api/projects` (list own projects, create with `ownerId` = Clerk user ID, default name `Untitled Project`, cuid IDs from schema)
- [x] `PATCH/DELETE /api/projects/[projectId]`: 401 unauthenticated, 404 missing or non-owner (deliberate deviation from spec 06's 403, so project IDs cannot be probed); writes also scoped by `ownerId`
- [x] `lib/api-response.ts` (`getUserId`, `errorResponse`) and `lib/project-validation.ts` (name: trimmed, ≤100 chars, must have a slug, mirrors the UI rule)
- [x] Slug requirement applies only to creation (`parseNewProjectName`); `parseProjectName` used by rename accepts any non-empty name (e.g. 設計) since the room ID never changes
- [x] Handlers use `auth()` + explicit 401, not `auth.protect()` (which returns 404 for API requests)
- [x] `postinstall` and `prebuild` run `prisma generate` (generated client is gitignored, so clean `npm ci && npm run build` works; verified with client deleted and no `.env.local`)
- [x] tsc, eslint, `npm run build` pass; UI not wired (still mock data)
- [ ] Manual check with a signed-in session (200/404 paths)

### Feature 07: Wire Editor Home
- [x] `lib/projects.ts` `getUserProjects(userId)`: owned projects + projects shared via `ProjectCollaborator` email (case-insensitive, from Clerk primary email)
- [x] `/editor` and new `/editor/[roomId]` are server pages (`auth.protect()`, server-side fetch, `notFound()` if the user has no access); no client fetching on load
- [x] `hooks/use-project-actions.ts` replaces the mock `use-project-dialogs`: create (name, short suffix, `slug-suffix` room ID, `POST`, navigate), rename (`PATCH`, refresh), delete (`DELETE`, redirect to `/editor` if active else refresh), inline API errors in dialogs
- [x] `POST /api/projects` accepts an optional `id` (lowercase slug, ≤128) so project ID = Liveblocks room ID; duplicate → 409; omitted → cuid
- [x] Sidebar takes `ownedProjects`/`sharedProjects`; create dialog shows room ID preview; mock projects removed
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check: create → workspace, rename, delete (active and inactive)

### Feature 08: Editor Workspace Shell
- [x] Route renamed to `/editor/[roomId]` (server component): `getIdentity()` redirects unauthenticated users to `/sign-in`; missing and unauthorized projects both render `AccessDenied` (no existence leak)
- [x] `lib/project-access.ts`: `getIdentity()` (Clerk `userId` + primary email) and `getProjectAccess()` (owner or collaborator by case-insensitive email)
- [x] `components/editor/access-denied.tsx`: centered lock icon, message, link back to `/editor`
- [x] Workspace layout: navbar with project name, Share button (no behavior) and AI sidebar toggle; sidebar highlights the current room; canvas placeholder fills remaining space; collapsible right AI sidebar placeholder
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check: owner, collaborator, unauthorized and missing room IDs

### Feature 09: Share Dialog
- [x] `GET/POST /api/projects/[projectId]/collaborators` and `DELETE .../collaborators/[collaboratorId]`: GET open to owner and collaborators; POST/DELETE owner-only (403 for collaborators, 404 for non-members); emails normalized to lowercase, duplicate → 409, inviting yourself → 400
- [x] `lib/collaborators.ts`: enriches emails with Clerk display name and avatar (`getUserList`, batched by 100); falls back to email only when no Clerk user matches or Clerk fails. No local user table
- [x] `lib/project-access.ts`: `getRequestIdentity()` for route handlers (null instead of redirect)
- [x] `ShareDialog` (mounted only while open) + `useShareDialog`: owners get invite form and remove buttons, collaborators see a read-only list; Copy link shows `Copied!` for 2s; navbar Share button opens it
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check: owner invite/remove, collaborator read-only view, Clerk names/avatars, copy link

### Feature 10: Liveblocks Setup
- [x] `@liveblocks/node` installed (it was not actually present, only client/react)
- [x] `liveblocks.config.ts`: Presence (`cursor`, `isThinking`) and UserMeta (`id`, `info.name/avatar/color`)
- [x] `lib/liveblocks.ts`: lazily cached node client (throws if `LIVEBLOCKS_SECRET_KEY` unset) and `getUserColor()` hash-to-palette helper
- [x] `POST /api/liveblocks-auth`: 401 unauthenticated, 403 no project access (room ID = project ID), `getOrCreateRoom` (private), access-token session with name/avatar/color
- [x] `lib/project-access.ts` `Identity` now carries `name` and `avatarUrl` from Clerk
- [x] tsc and `npm run build` pass
- [ ] Manual check with `LIVEBLOCKS_SECRET_KEY` set in `.env.local` (200 for member, 403 for others)

### Feature 11: Base Canvas
- [x] Installed `@xyflow/react`, `@liveblocks/react-flow`, `@liveblocks/react-ui`, `react-error-boundary`
- [x] `types/canvas.ts`: `NODE_COLORS`, `NODE_SHAPES`, `CanvasNodeData` (label, color, shape), `CanvasNode` (`canvasNode`), `CanvasEdge` (`canvasEdge`)
- [x] `components/canvas/canvas-room.tsx`: `LiveblocksProvider` (`/api/liveblocks-auth`), `RoomProvider` (room ID = project ID, presence `cursor: null`, `isThinking: false`), `ClientSideSuspense` loading state, `ErrorBoundary` connection fallback
- [x] `components/canvas/canvas.tsx`: `useLiveblocksFlow` (suspense, empty initial nodes/edges) wired into `ReactFlow` with loose connections, `fitView`, `MiniMap`, dot `Background`
- [x] Workspace page stays server-side; `editor-shell.tsx` renders `CanvasRoom` in place of the placeholder
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check with `LIVEBLOCKS_SECRET_KEY`: canvas loads, two browsers sync

### Feature 12: Shape Panel
- [x] `types/canvas.ts`: `SHAPE_DRAG_TYPE`, `ShapeDragPayload` (shape, width, height), `SHAPE_DEFAULT_SIZES` (rectangle 160x80, diamond 140x140, circle 100x100, pill 160x60, cylinder 120x100, hexagon 140x120)
- [x] `components/canvas/shape-panel.tsx`: floating pill toolbar, bottom-center, six draggable icon buttons that set the payload on `dragstart`
- [x] `canvas.tsx`: `ReactFlowProvider` wrapper; `dragover`/`drop` on the canvas wrapper, payload validated, `screenToFlowPosition`, node centered on the cursor and added via `onNodesChange([{ type: "add" }])` so it syncs through Liveblocks; ID `shape-timestamp-counter`, empty label, default color
- [x] `components/canvas/canvas-node.tsx`: basic `canvasNode` renderer (bordered rectangle, centered label); shape visuals come later
- [x] tsc, eslint, `npm run build` pass
- [x] Verified with Playwright (Chromium, no-auth harness): all six shapes drop with correct sizes, select, and move; nodes persist in the room
- [x] Fixes: canvas sized with `absolute inset-0` (React Flow error #004); shape icons are `div`s, not buttons (cross-browser drag); duplicate `LIVEBLOCKS_SECRET_KEY` in `.env.local` caused auth timeouts
- [x] Liveblocks best-practices pass: `useErrorListener` connection guard in `canvas-room.tsx`, 403 body `{ error: "forbidden" }`, 502 on room-creation failure
- [x] Code-review fixes: Clerk profile lookup by user ID with a capped cache, collision-proof node IDs (random suffix), `getLiveblocks()` inside the auth route's try/catch, connection error clears on reconnect and resets per room, shape tiles no longer claim button semantics
- [ ] Manual check on the signed-in editor page: two browsers sync

### Feature 13: Node Shape
- [x] `components/canvas/node-shape.tsx`: `NodeShapeBody` renders rectangle/pill/circle with CSS (border + radius) and diamond/hexagon/cylinder as inline SVG (100x100 viewBox, `preserveAspectRatio="none"`, non-scaling 1px stroke so shapes scale with node size); border `surface-border` at rest, `brand` when selected; label color looked up from `NODE_COLORS`
- [x] `canvas-node.tsx` uses `NodeShapeBody` with `data.shape`/`data.color` from the Liveblocks flow state
- [x] `shape-drag-preview.ts`: `setDragImage` with an offscreen-rendered `NodeShapeBody` at the default size, centered on the cursor like the drop; the browser removes it on drop/cancel; drop logic unchanged
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check: all six shapes render, ghost follows cursor, selected border brightens

### Feature 14: Node Editing
- [x] `canvas-node.tsx`: `NodeResizer` visible only when selected, min 60x40, subtle brand-tinted line and small square handles; resize flows through `onNodesChange` into Liveblocks
- [x] Inline label editing: double-click the label to open a textarea over it; an invisible mirror span sizes/centers it identically so there is no layout shift; empty labels show a faint "Label" placeholder in the same position
- [x] Typing calls `useReactFlow().updateNodeData` (controlled mode, so it syncs through `onNodesChange`); closes on blur or `Escape`; `nodrag nopan nowheel` on the textarea, key events stop propagating
- [x] tsc, eslint, `npm run build` pass
- [ ] Manual browser check: resize, min size, double-click edit, Escape/blur, two browsers sync

## Open Questions

- Spec 09 sets no limit on collaborators per project or on invite rate; none enforced.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching (the `dark` class on <html> exists only so generated `dark:` variants apply).
- Sidebar is `absolute` inside the editor `main` (overlay, never pushes content); closed state uses `inert` + translate.
- Dialog pattern wraps shadcn Dialog in `EditorDialog` rather than editing `components/ui/dialog.tsx`.
- Do not modify generated components/ui/* files after shadcn installation.

- Middleware/proxy is never the sole auth boundary: every protected page, route handler, and Server Function calls `await auth.protect()` itself.
- Clerk profile (`currentUser()`, a rate-limited Backend API call) is fetched only through `loadIdentity` in `lib/project-access.ts`: per-render `cache()`, 60s in-memory TTL per user, stale entry served on Clerk errors (fixes 429 `too_many_requests` during dev reloads).

## Session Notes

- Next.js 16.4.0 with React 19.3.0 and Tailwind CSS v4.
- shadcn 4.21.4 auto-detected Tailwind v4; lucide-react ^1.55.0 is a direct dependency.
