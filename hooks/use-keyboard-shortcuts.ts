"use client";

import * as React from "react";
import type { ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions {
  reactFlowInstance?: ReactFlowInstance | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return false;
}

export function useKeyboardShortcuts({
  reactFlowInstance,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
}: UseKeyboardShortcutsOptions) {
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableElement(event.target)) {
        return;
      }

      const isCmdOrCtrl = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key;

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y => Redo
      if (
        (isCmdOrCtrl && isShift && (key === "z" || key === "Z")) ||
        (isCmdOrCtrl && (key === "y" || key === "Y"))
      ) {
        if (canRedo && onRedo) {
          event.preventDefault();
          onRedo();
          return;
        }
      }

      // Cmd/Ctrl + Z => Undo
      if (isCmdOrCtrl && (key === "z" || key === "Z")) {
        if (canUndo && onUndo) {
          event.preventDefault();
          onUndo();
          return;
        }
      }

      // Intercept bare '+', '=', and '-' keys only when not modified by Ctrl/Cmd
      if (!isCmdOrCtrl) {
        if (key === "+" || key === "=") {
          if (reactFlowInstance) {
            event.preventDefault();
            reactFlowInstance.zoomIn({ duration: 300 });
            return;
          }
        }

        if (key === "-") {
          if (reactFlowInstance) {
            event.preventDefault();
            reactFlowInstance.zoomOut({ duration: 300 });
            return;
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlowInstance, onUndo, onRedo, canUndo, canRedo]);
}
