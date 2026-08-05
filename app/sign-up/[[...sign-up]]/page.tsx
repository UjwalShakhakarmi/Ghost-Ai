import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Ghost AI - Sign Up",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full bg-base text-copy-primary">
      {/* Left panel: visible on large screens */}
      <div className="hidden lg:flex flex-1 flex-col justify-between border-r border-surface-border bg-surface p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle border border-surface-border">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <span className="text-xl font-bold tracking-tight text-copy-primary">
            ghost Al
          </span>
        </div>

        <div className="space-y-6 max-w-md">
          <div>
            <h1 className="text-2xl font-bold text-copy-primary mb-2">
              Visual AI Architecture Canvas
            </h1>
            <p className="text-sm text-copy-muted">
              Create your account to start building and sharing architecture models.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-copy-secondary">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
              <span>Design interactive architecture diagrams</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
              <span>AI-powered canvas workflow and analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
              <span>Collaborative workspace for engineering teams</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-copy-faint">
          © {new Date().getFullYear()} ghost Al. All rights reserved.
        </div>
      </div>

      {/* Right panel: centered Clerk form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-base">
        <SignUp />
      </div>
    </div>
  );
}
