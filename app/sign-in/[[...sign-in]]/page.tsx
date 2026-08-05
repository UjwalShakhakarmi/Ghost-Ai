import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Cpu, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Ghost AI - Sign In",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0c] text-copy-primary">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between border-r border-[#1a1a22] bg-[#0d0d12] p-16">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00d8d6] shadow-sm">
            <span className="font-bold text-black text-lg">G</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Ghost AI
          </span>
        </div>

        {/* Hero Content */}
        <div className="space-y-8 max-w-xl">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white leading-tight mb-4">
              Design systems at the speed of thought.
            </h1>
            <p className="text-base text-[#808090] leading-relaxed">
              Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-6 pt-2">
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141d24] border border-[#1e2f38] text-[#00d8d6] shrink-0 mt-0.5">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  AI Architecture Generation
                </h2>
                <p className="text-sm text-[#808090] mt-0.5">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141d24] border border-[#1e2f38] text-[#00d8d6] shrink-0 mt-0.5">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Real-time Collaboration
                </h2>
                <p className="text-sm text-[#808090] mt-0.5">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#141d24] border border-[#1e2f38] text-[#00d8d6] shrink-0 mt-0.5">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Instant Spec Generation
                </h2>
                <p className="text-sm text-[#808090] mt-0.5">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#505060]">
          © {new Date().getFullYear()} Ghost AI. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Centered Clerk Sign In Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[#070709]">
        <SignIn />
      </div>
    </div>
  );
}
