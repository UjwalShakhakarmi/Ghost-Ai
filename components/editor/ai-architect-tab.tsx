"use client";

import * as React from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

interface AiArchitectTabProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function AiArchitectTab({ messages, input, onInputChange, onSend }: AiArchitectTabProps) {
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Bot className="h-8 w-8 text-copy-faint" />
              <p className="max-w-[220px] text-sm text-copy-muted">
                Describe the system you want to build and Ghost AI will help you sketch it
                out.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onInputChange(prompt)}
                    className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-accent-ai-text transition-colors hover:bg-elevated"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "self-end border-2 border-brand/50 bg-accent-dim text-copy-primary"
                    : "self-start border border-surface-border bg-elevated text-accent-ai-text"
                )}
              >
                {message.content}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t border-surface-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ghost AI to design your architecture..."
            className="min-h-[72px] max-h-[160px] resize-none border-surface-border bg-subtle text-sm text-copy-primary placeholder:text-copy-muted"
          />
          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={!input.trim()}
            className="h-9 w-9 shrink-0 bg-accent-ai text-white hover:bg-accent-ai/90"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-copy-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
