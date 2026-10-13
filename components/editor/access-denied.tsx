import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-base px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-surface text-copy-muted">
        <Lock className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-copy-primary">Access denied</h1>
        <p className="max-w-sm text-sm text-copy-muted">
          This project doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/editor" />}>Back to editor</Button>
    </div>
  );
}
