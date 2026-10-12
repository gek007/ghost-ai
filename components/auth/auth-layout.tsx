import type { ReactNode } from "react";

const FEATURES = [
  "Describe a system in plain language and get a diagram",
  "Edit architecture on a shared real-time canvas",
  "Invite teammates to collaborate on any project",
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-base text-copy-primary lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-surface-border bg-surface p-10 lg:flex">
        <div className="text-lg font-semibold tracking-tight">Ghost AI</div>
        <div className="max-w-sm space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Design systems together, in real time.
          </h1>
          <ul className="space-y-3 text-sm text-copy-secondary">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden className="text-brand">
                  –
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div />
      </aside>
      <main className="flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
