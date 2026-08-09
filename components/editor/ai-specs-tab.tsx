"use client";

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AiSpecsTab() {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <Button type="button" className="w-full bg-accent-ai text-white hover:bg-accent-ai/90">
          Generate Spec
        </Button>

        <Card className="gap-3 rounded-2xl border-surface-border bg-elevated p-4 shadow-none">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-accent-ai-text">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-copy-primary">Architecture Spec</p>
              <p className="text-xs leading-relaxed text-copy-muted">
                A structured breakdown of services, data flow, and infrastructure
                components based on your canvas.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="w-full gap-1.5 border-surface-border bg-subtle text-copy-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </Card>
      </div>
    </ScrollArea>
  );
}
