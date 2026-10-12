# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 02 (Editor chrome) — complete

## Current Goal
- Feature 03 (not started)

## Completed

- Feature 01: Design System — shadcn/ui (v4.21, base-nova style, @base-ui/react) initialized for Tailwind v4; Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added to components/ui/ (unmodified); lucide-react installed; lib/utils.ts re-exports cn() from the shadcn `cn` package (clsx + tailwind-merge replacement; `cn("p-2 p-4")` → `p-4`). globals.css is dark-only: ui-context tokens defined on :root, mapped via @theme inline (bg-base, text-copy-primary, border-surface-border, text-brand, etc.), shadcn variables pointed at those tokens, `.dark` block removed, circular --font-sans fixed; `dark` class set on <html> so generated dark: variants apply. `npm run build` passes.
- Feature 02: Editor chrome — `components/editor/editor-navbar.tsx` (fixed h-14 navbar, left/center/right grid, sidebar toggle with PanelLeftOpen/PanelLeftClose, right/center empty), `project-sidebar.tsx` (absolute-positioned overlay that slides in from left, `isOpen`/`onClose` props, Projects header + close button, shadcn Tabs My Projects/Shared with empty states, full-width New Project button with Plus icon), `editor-dialog.tsx` (token-styled dialog pattern with title, description, body, footer actions; no concrete dialogs yet), plus `editor-shell.tsx` (client state holder) mounted at `/editor`. tsc, eslint, and `npm run build` pass.

## In Progress

- None.

## Next Up

- Feature 03

## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching (the `dark` class on <html> exists only so generated `dark:` variants apply).
- Sidebar is `absolute` inside the editor `main` (overlay, never pushes content); closed state uses `inert` + translate.
- Dialog pattern wraps shadcn Dialog in `EditorDialog` rather than editing `components/ui/dialog.tsx`.
- Do not modify generated components/ui/* files after shadcn installation.

## Session Notes

- Next.js 16.4.0 with React 19.3.0 and Tailwind CSS v4.
- shadcn 4.21.4 auto-detected Tailwind v4; lucide-react ^1.55.0 is a direct dependency.
