import { TopNav } from "@/components/layout/TopNav";
import { Card } from "@/components/ui/card";

export default function Unlock() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Unlock</h1>
          <p className="mt-1 text-sm text-muted-foreground">Remove password protection from a PDF.</p>
        </div>
        <Card className="p-5">
          <div className="rounded-md border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
            Coming soon: unlocking/encrypted PDF handling isn’t supported client-side in the current setup.
          </div>
        </Card>
      </main>
    </div>
  );
}
