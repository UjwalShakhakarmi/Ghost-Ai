"use client";

import * as React from "react";
import { Bot, X } from "lucide-react";
import { useRoom } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { designAgentTask } from "@/src/trigger/design-agent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { AiSpecsTab } from "@/components/editor/ai-specs-tab";
import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";
import { useAiChatFeed } from "@/hooks/use-ai-chat-feed";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AI_SENDER_NAME = "Ghost AI";

interface ActiveRun {
  runId: string;
  token: string;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = React.useState("");
  const [activeRun, setActiveRun] = React.useState<ActiveRun | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handledRunIdRef = React.useRef<string | null>(null);

  const roomId = useRoom().id;
  const { latestMessage, isGenerating } = useAiStatusFeed();
  const { messages, sendMessage, isSending, sendError } = useAiChatFeed();

  const { run } = useRealtimeRun<typeof designAgentTask>(activeRun?.runId, {
    accessToken: activeRun?.token,
    enabled: Boolean(activeRun),
  });

  // When the tracked run finishes (success or failure), post one final
  // message to ai-chat and clear local run state — guarded by a ref since
  // `run` keeps updating (new object identity) after isCompleted flips true.
  React.useEffect(() => {
    if (!run || !run.isCompleted) return;
    if (handledRunIdRef.current === run.id) return;
    handledRunIdRef.current = run.id;

    if (run.isSuccess) {
      const summary =
        (run.output && typeof run.output.summary === "string" && run.output.summary) ||
        "Design generation complete.";
      void sendMessage(summary, { role: "assistant", sender: AI_SENDER_NAME });
    } else {
      const errorMessage =
        run.error?.message || "Design generation failed. Please try again.";
      void sendMessage(errorMessage, { role: "assistant", sender: AI_SENDER_NAME });
    }

    setActiveRun(null);
  }, [run, sendMessage]);

  // Combined "can't submit right now" signal: someone's run is active per the
  // shared ai-status-feed, or this client's own submission is in flight.
  const isBusy = isGenerating || isSubmitting || Boolean(activeRun);

  const handleSend = React.useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isBusy || isSending) return;

    const sent = await sendMessage(trimmed);
    if (!sent) return;

    setInput("");
    setIsSubmitting(true);

    try {
      const designResponse = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId: roomId }),
      });

      if (!designResponse.ok) {
        throw new Error("Couldn't start design generation.");
      }

      const { runId } = (await designResponse.json()) as { runId: string };

      const tokenResponse = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Couldn't authorize the design run.");
      }

      const { token } = (await tokenResponse.json()) as { token: string };

      handledRunIdRef.current = null;
      setActiveRun({ runId, token });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn't start design generation.";
      void sendMessage(message, { role: "assistant", sender: AI_SENDER_NAME });
    } finally {
      setIsSubmitting(false);
    }
  }, [input, isBusy, isSending, sendMessage, roomId]);

  return (
    <aside
      className={cn(
        "fixed right-0 top-14 bottom-0 z-40 flex w-80 flex-col border-l border-surface-border bg-base/95 backdrop-blur transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <div className="flex items-center gap-2.5">
          <Bot className="h-4 w-4 text-accent-ai-text" />
          <div className="flex flex-col leading-tight">
            <h2 className="text-sm font-semibold text-copy-primary">AI Workspace</h2>
            <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0 text-copy-muted hover:text-copy-primary hover:bg-subtle"
            aria-label="Close AI sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0 overflow-hidden">
        <TabsList className="mx-3 mt-3 w-auto shrink-0 justify-start gap-1 rounded-full bg-subtle p-1">
          <TabsTrigger
            value="architect"
            className="rounded-full px-3 text-copy-muted data-[state=active]:bg-elevated data-[state=active]:text-accent-ai-text data-[state=active]:shadow-none"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-full px-3 text-copy-muted data-[state=active]:bg-elevated data-[state=active]:text-accent-ai-text data-[state=active]:shadow-none"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="architect" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AiArchitectTab
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            isBusy={isBusy || isSending}
            isRunActive={isGenerating}
            statusText={latestMessage?.text}
            /* isRunActive here is the shared ai-status-feed signal specifically —
               drives the status strip, distinct from isBusy which also covers
               this client's own in-flight submission. */
            sendError={sendError}
          />
        </TabsContent>
        <TabsContent value="specs" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AiSpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
