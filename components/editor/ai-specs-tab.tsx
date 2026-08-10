"use client";

import * as React from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRoom, useStorage } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { generateSpecTask } from "@/src/trigger/generate-spec";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAiChatFeed } from "@/hooks/use-ai-chat-feed";
import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";

interface ProjectSpecItem {
  id: string;
  projectId: string;
  title: string | null;
  filePath: string;
  createdAt: string;
}

interface ActiveRun {
  runId: string;
  token: string;
}

function formatInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-copy-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            className="my-3 rounded-xl border border-surface-border bg-subtle p-3 font-mono text-xs text-copy-primary overflow-x-auto"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>,
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={idx}
          className="mt-4 mb-2 text-xl font-bold tracking-tight text-copy-primary border-b border-surface-border pb-2"
        >
          {line.replace("# ", "")}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={idx}
          className="mt-5 mb-2 text-base font-semibold text-accent-ai-text border-b border-surface-border/50 pb-1"
        >
          {line.replace("## ", "")}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={idx}
          className="mt-3 mb-1 text-sm font-semibold text-copy-primary"
        >
          {line.replace("### ", "")}
        </h3>,
      );
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const text = line.trim().substring(2);
      elements.push(
        <div
          key={idx}
          className="ml-4 my-1 flex items-start gap-2 text-sm text-copy-secondary"
        >
          <span className="text-accent-ai-text font-bold">•</span>
          <span>{formatInlineMarkdown(text)}</span>
        </div>,
      );
    } else if (line.trim().length === 0) {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p
          key={idx}
          className="my-1.5 text-sm leading-relaxed text-copy-secondary"
        >
          {formatInlineMarkdown(line)}
        </p>,
      );
    }
  });

  return <div className="space-y-1">{elements}</div>;
}

export function AiSpecsTab() {
  const roomId = useRoom().id;
  const { messages } = useAiChatFeed();
  const { isGenerating } = useAiStatusFeed();

  const nodes = useStorage((root) => {
    const rootObj = root as Record<string, unknown>;
    const flow = rootObj?.flow as
      | { nodes?: Record<string, unknown> }
      | undefined;
    return flow?.nodes ? Object.values(flow.nodes) : [];
  });
  const edges = useStorage((root) => {
    const rootObj = root as Record<string, unknown>;
    const flow = rootObj?.flow as
      | { edges?: Record<string, unknown> }
      | undefined;
    return flow?.edges ? Object.values(flow.edges) : [];
  });

  const [specs, setSpecs] = React.useState<ProjectSpecItem[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = React.useState(true);

  const [activeRun, setActiveRun] = React.useState<ActiveRun | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handledRunIdRef = React.useRef<string | null>(null);

  const [previewSpec, setPreviewSpec] = React.useState<ProjectSpecItem | null>(
    null,
  );
  const [specContent, setSpecContent] = React.useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = React.useState(false);

  const fetchSpecs = React.useCallback(async () => {
    try {
      setIsLoadingSpecs(true);
      const res = await fetch(`/api/projects/${roomId}/specs`);
      if (res.ok) {
        const data = (await res.json()) as { specs: ProjectSpecItem[] };
        setSpecs(data.specs || []);
      }
    } catch {
      // Ignore load error
    } finally {
      setIsLoadingSpecs(false);
    }
  }, [roomId]);

  React.useEffect(() => {
    void fetchSpecs();
  }, [fetchSpecs]);

  const { run } = useRealtimeRun<typeof generateSpecTask>(activeRun?.runId, {
    accessToken: activeRun?.token,
    enabled: Boolean(activeRun),
  });

  React.useEffect(() => {
    if (!run || !run.isCompleted) return;
    if (handledRunIdRef.current === run.id) return;
    handledRunIdRef.current = run.id;

    if (run.isSuccess) {
      void fetchSpecs();
    }
    setActiveRun(null);
  }, [run, fetchSpecs]);

  const isSpecTaskActive = isSubmitting || Boolean(activeRun);

  const handleGenerateSpec = React.useCallback(async () => {
    if (isSpecTaskActive || isGenerating) return;

    setIsSubmitting(true);
    try {
      const specResponse = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: messages,
          nodes,
          edges,
        }),
      });

      if (!specResponse.ok) {
        throw new Error("Couldn't start spec generation.");
      }

      const { runId } = (await specResponse.json()) as { runId: string };

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Couldn't authorize spec generation run.");
      }

      const { token } = (await tokenResponse.json()) as { token: string };

      handledRunIdRef.current = null;
      setActiveRun({ runId, token });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSpecTaskActive, isGenerating, roomId, messages, nodes, edges]);

  const openPreview = React.useCallback(
    async (spec: ProjectSpecItem) => {
      setPreviewSpec(spec);
      setIsLoadingContent(true);
      setSpecContent(null);

      try {
        const res = await fetch(
          `/api/projects/${roomId}/specs/${spec.id}/download`,
        );
        if (res.ok) {
          const text = await res.text();
          setSpecContent(text);
        } else {
          setSpecContent("Failed to load technical spec content.");
        }
      } catch {
        setSpecContent("Error loading technical spec content.");
      } finally {
        setIsLoadingContent(false);
      }
    },
    [roomId],
  );

  const handleDownload = React.useCallback(
    (specId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const link = document.createElement("a");
      link.href = `/api/projects/${roomId}/specs/${specId}/download`;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [roomId],
  );

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
          <Button
            type="button"
            onClick={handleGenerateSpec}
            disabled={isSpecTaskActive || isGenerating}
            className="w-full gap-2 bg-accent-ai text-white hover:bg-accent-ai/90 shadow-md"
          >
            {isSpecTaskActive ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Generating Spec...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Technical Spec</span>
              </>
            )}
          </Button>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-copy-muted">
              Project Technical Specs
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void fetchSpecs()}
              disabled={isLoadingSpecs}
              className="h-6 w-6 text-copy-muted hover:text-copy-primary"
              title="Refresh list"
            >
              <RefreshCw
                className={isLoadingSpecs ? "h-3 w-3 animate-spin" : "h-3 w-3"}
              />
            </Button>
          </div>

          {isLoadingSpecs && specs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-copy-muted">
              <Loader2 className="h-5 w-5 animate-spin text-accent-ai-text" />
              <p className="text-xs">Loading specs list...</p>
            </div>
          ) : specs.length === 0 ? (
            <Card className="gap-3 rounded-2xl border-surface-border bg-elevated p-4 shadow-none text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-subtle text-accent-ai-text">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-copy-primary">
                No Specs Generated Yet
              </p>
              <p className="text-xs leading-relaxed text-copy-muted">
                Click &quot;Generate Technical Spec&quot; above to create a
                complete Markdown specification document from your canvas
                architecture.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {specs.map((spec) => {
                const formattedDate = new Date(
                  spec.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <Card
                    key={spec.id}
                    onClick={() => void openPreview(spec)}
                    className="group relative flex flex-col gap-3 rounded-2xl border-surface-border bg-elevated p-3.5 shadow-none transition-colors hover:border-accent-ai-text/50 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-subtle text-accent-ai-text transition-transform group-hover:scale-105">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-copy-primary">
                          {spec.title || "Technical Specification"}
                        </p>
                        <p className="text-xs text-copy-muted">
                          {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          void openPreview(spec);
                        }}
                        className="flex-1 gap-1.5 border-surface-border bg-subtle text-xs text-copy-primary hover:bg-subtle/80"
                      >
                        <Eye className="h-3.5 w-3.5 text-accent-ai-text" />
                        Preview
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownload(spec.id, e)}
                        className="flex-1 gap-1.5 border-surface-border bg-subtle text-xs text-copy-primary hover:bg-subtle/80"
                      >
                        <Download className="h-3.5 w-3.5 text-accent-ai-text" />
                        Download
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={Boolean(previewSpec)}
        onOpenChange={(open) => !open && setPreviewSpec(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col border-surface-border bg-surface text-copy-primary rounded-3xl p-6 shadow-2xl overflow-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-surface-border pb-4 text-left">
            <div className="flex flex-col gap-1 pr-6">
              <DialogTitle className="text-lg font-semibold text-copy-primary">
                {previewSpec?.title || "Technical Specification"}
              </DialogTitle>
              <DialogDescription className="text-xs text-copy-muted">
                Generated on{" "}
                {previewSpec
                  ? new Date(previewSpec.createdAt).toLocaleString()
                  : ""}
              </DialogDescription>
            </div>
            {previewSpec && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleDownload(previewSpec.id)}
                className="gap-1.5 bg-accent-ai text-white hover:bg-accent-ai/90 rounded-xl shrink-0"
              >
                <Download className="h-4 w-4" />
                Download .md
              </Button>
            )}
          </DialogHeader>

          <ScrollArea className="min-h-0 flex-1 my-2 pr-4">
            {isLoadingContent ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-copy-muted">
                <Loader2 className="h-6 w-6 animate-spin text-accent-ai-text" />
                <p className="text-sm">
                  Loading technical specification content…
                </p>
              </div>
            ) : specContent ? (
              <MarkdownContent content={specContent} />
            ) : (
              <p className="text-sm text-copy-muted py-8 text-center">
                No content available.
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
