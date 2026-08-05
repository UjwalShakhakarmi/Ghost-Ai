import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Sparkles, Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base p-6 text-copy-primary">
      <main className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-brand" />
            <h1 className="text-2xl font-bold tracking-tight text-copy-primary">
              ghost Al
            </h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl border-surface-border">
                Open Dialog
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-surface-border bg-surface text-copy-primary">
              <DialogHeader>
                <DialogTitle className="text-brand">Design System Initialized</DialogTitle>
                <DialogDescription className="text-copy-muted">
                  All UI primitive components and tokens are configured for dark theme.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input placeholder="Enter prompt..." className="rounded-xl border-surface-border bg-subtle" />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="rounded-2xl border-surface-border bg-surface text-copy-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-accent-ai-text" />
              <span>Workspace Primitives</span>
            </CardTitle>
            <CardDescription className="text-copy-muted">
              Standardized dark theme surface and components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="tab-input" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-subtle">
                <TabsTrigger value="tab-input">Inputs</TabsTrigger>
                <TabsTrigger value="tab-scroll">Scroll Area</TabsTrigger>
              </TabsList>
              <TabsContent value="tab-input" className="space-y-3 pt-3">
                <Input placeholder="Component search..." className="rounded-xl border-surface-border bg-subtle" />
                <Textarea placeholder="System instructions..." className="rounded-xl border-surface-border bg-subtle" />
              </TabsContent>
              <TabsContent value="tab-scroll" className="pt-3">
                <ScrollArea className="h-32 rounded-xl border border-surface-border bg-subtle p-3">
                  <div className="space-y-2 text-sm text-copy-secondary">
                    <p className={cn("font-mono text-xs text-brand")}>[SYSTEM] Design system online.</p>
                    <p>[INFO] Base UI / Radix primitives loaded.</p>
                    <p>[INFO] Geist Sans & Mono fonts active.</p>
                    <p>[INFO] 01-design-system spec implemented.</p>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="secondary" className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl bg-brand text-base hover:bg-brand/90">
              Confirm
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
