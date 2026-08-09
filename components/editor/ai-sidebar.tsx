"use client";

import * as React from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiArchitectTab, type ChatMessage } from "@/components/editor/ai-architect-tab";
import { AiSpecsTab } from "@/components/editor/ai-specs-tab";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

let messageIdCounter = 0;

function generateMessageId(): string {
  messageIdCounter += 1;
  return `msg-${Date.now()}-${messageIdCounter}`;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");

  const handleSend = React.useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: generateMessageId(), role: "user", content: trimmed },
      {
        id: generateMessageId(),
        role: "assistant",
        content: "AI generation isn't wired up yet — this is a placeholder response.",
      },
    ]);
    setInput("");
  }, [input]);

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
          />
        </TabsContent>
        <TabsContent value="specs" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AiSpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
