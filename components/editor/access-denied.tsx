import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-base p-6 text-center text-copy-primary">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-elevated">
        <Lock className="h-6 w-6 text-copy-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-copy-primary">Access denied</h1>
        <p className="max-w-sm text-sm text-copy-muted">
          You don&apos;t have access to this project, or it no longer exists.
        </p>
      </div>
      <Button
        asChild
        className="mt-2 rounded-xl bg-brand font-semibold text-bg-base hover:bg-brand/90"
      >
        <Link href="/editor">Back to Editor</Link>
      </Button>
    </div>
  );
}
