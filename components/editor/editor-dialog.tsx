"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface EditorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EditorDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel = "Cancel",
  onSecondaryAction,
}: EditorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-copy-primary">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-copy-muted">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && <div className="py-2">{children}</div>}

        <DialogFooter className="flex gap-2 sm:justify-end">
          {secondaryActionLabel && (
            <Button
              variant="outline"
              onClick={() => {
                onSecondaryAction?.();
                onOpenChange(false);
              }}
              className="rounded-xl border-surface-border bg-subtle text-copy-primary hover:bg-elevated"
            >
              {secondaryActionLabel}
            </Button>
          )}
          {primaryActionLabel && (
            <Button
              onClick={() => {
                onPrimaryAction?.();
                onOpenChange(false);
              }}
              className="rounded-xl bg-brand font-medium text-bg-base hover:bg-brand/90"
            >
              {primaryActionLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
