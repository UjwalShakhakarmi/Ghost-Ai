import type { Metadata } from "next";
import { EditorWorkspace } from "@/components/editor/editor-workspace";

export const metadata: Metadata = {
  title: "Ghost AI - Editor",
};

export default function EditorPage() {
  return <EditorWorkspace />;
}
