# Progress Tracker

Update this file after every step: tick the checkbox when a step is done, and add new steps as features are scoped.

## Status

- **Current phase:** Feature 08 (Editor Workspace Shell) — complete
- **Current goal:** Feature 09 (not scoped)

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
- [x] `PATCH/DELETE /api/projects/[projectId]`: 401 unauthenticated, 404 missing, 403 non-owner; writes also scoped by `ownerId`
- [x] `lib/api-response.ts` (`getUserId`, `errorResponse`) and `lib/project-validation.ts` (name: trimmed, ≤100 chars, must have a slug, mirrors the UI rule)
- [x] Handlers use `auth()` + explicit 401, not `auth.protect()` (which returns 404 for API requests)
- [x] `postinstall` and `prebuild` run `prisma generate` (generated client is gitignored, so clean `npm ci && npm run build` works; verified with client deleted and no `.env.local`)
- [x] tsc, eslint, `npm run build` pass; UI not wired (still mock data)
- [ ] Manual check with a signed-in session (200/403 paths)

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

## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching (the `dark` class on <html> exists only so generated `dark:` variants apply).
- Sidebar is `absolute` inside the editor `main` (overlay, never pushes content); closed state uses `inert` + translate.
- Dialog pattern wraps shadcn Dialog in `EditorDialog` rather than editing `components/ui/dialog.tsx`.
- Do not modify generated components/ui/* files after shadcn installation.

- Middleware/proxy is never the sole auth boundary: every protected page, route handler, and Server Function calls `await auth.protect()` itself.

## Session Notes

- Next.js 16.4.0 with React 19.3.0 and Tailwind CSS v4.
- shadcn 4.21.4 auto-detected Tailwind v4; lucide-react ^1.55.0 is a direct dependency.
