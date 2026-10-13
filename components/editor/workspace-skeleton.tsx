export function WorkspaceSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-base" aria-busy="true">
      <div className="h-14 shrink-0 border-b border-surface-border bg-surface" />
      <div className="flex-1" />
    </div>
  );
}
