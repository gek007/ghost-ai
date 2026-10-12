# Progress Tracker

Update this file after every step: tick the checkbox when a step is done, and add new steps as features are scoped.

## Status

- **Current phase:** Feature 03 (Auth) — complete
- **Current goal:** Feature 04 (not started)

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

### Feature 04
- [ ] Not started

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
