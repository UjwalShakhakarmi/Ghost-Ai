"use client";

import * as React from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AiChatFeedMessage } from "@/hooks/use-ai-chat-feed";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatTimestamp(timestamp: number): string {
  return TIMESTAMP_FORMATTER.format(new Date(timestamp));
}

interface AiArchitectTabProps {
  messages: AiChatFeedMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isBusy?: boolean;
  isRunActive?: boolean;
  statusText?: string | null;
  sendError?: string | null;
}

export function AiArchitectTab({
  messages,
  input,
  onInputChange,
  onSend,
  isBusy = false,
  isRunActive = false,
  statusText = null,
  sendError = null,
}: AiArchitectTabProps) {
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isBusy) {
          onSend();
        }
      }
    },
    [onSend, isBusy]
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
            messages.map((message) => {
              const isUserMessage = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-0.5 rounded-2xl px-3 py-2 text-sm",
                    isUserMessage
                      ? "self-end bg-accent-chat text-bg-base"
                      : "self-start border border-surface-border bg-elevated text-copy-primary"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-baseline gap-1.5 text-[11px] font-medium",
                      isUserMessage ? "text-bg-base/70" : "text-accent-ai-text"
                    )}
                  >
                    <span className="truncate">{message.sender}</span>
                    <span aria-hidden="true" className="opacity-60">
                      ·
                    </span>
                    <time
                      dateTime={new Date(message.timestamp).toISOString()}
                      className="shrink-0 opacity-60"
                    >
                      {formatTimestamp(message.timestamp)}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Compact status strip — shared ai-status-feed state, shown only while a run is active */}
      {isRunActive && (
        <div
          role="status"
          aria-live="polite"
          className="flex shrink-0 items-center gap-1.5 border-t border-surface-border bg-subtle px-4 py-1.5 text-xs text-accent-chat"
        >
          <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
          <span className="truncate">{statusText || "Ghost AI is working…"}</span>
        </div>
      )}

      <div className="shrink-0 border-t border-surface-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isBusy}
            placeholder="Ask Ghost AI to design your architecture..."
            className="min-h-[72px] max-h-[160px] resize-none border-surface-border bg-subtle text-sm text-copy-primary placeholder:text-copy-muted disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={isBusy || !input.trim()}
            className="h-9 w-9 shrink-0 bg-accent-chat text-bg-base hover:bg-accent-chat/90"
            aria-label={isBusy ? "Sending…" : "Send message"}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {sendError ? (
          <p className="mt-1.5 text-[11px] text-state-error">{sendError}</p>
        ) : (
          <p className="mt-1.5 text-[11px] text-copy-faint">
            Enter to send · Shift+Enter for a new line
          </p>
        )}
      </div>
    </div>
  );
}
