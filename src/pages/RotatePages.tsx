import { useMemo, useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PdfExportPreview } from "@/components/pdf/PdfExportPreview";
import { downloadBlob, u8ToArrayBuffer } from "@/lib/blob";
import { FileDown, RotateCcw, RotateCw, Upload } from "lucide-react";

const ROTATIONS = [90, 180, 270, -90] as const;
type Rotation = (typeof ROTATIONS)[number];

function formatMB(bytes: number) { return `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }

export default function RotatePages() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [allRotation, setAllRotation] = useState<Rotation>(90);
  const [pageRotations, setPageRotations] = useState<Record<number, Rotation>>({});
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [isWorking, setIsWorking] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBytes, setPreviewBytes] = useState<Uint8Array | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const outputName = useMemo(() => `${file?.name?.replace(/\.pdf$/i, "") || "document"}-rotated.pdf`, [file]);

  const onUpload = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile(f);
    setPdfBytes(bytes);
    setPageRotations({});
    setPreviewOpen(false);
    setPreviewBytes(null);
    setPreviewBlob(null);
    try {
      const doc = await PDFDocument.load(bytes.slice());
      setPageCount(doc.getPageCount());
    } catch {
      toast({ title: "Invalid PDF", variant: "destructive" });
    }
  };

  const buildRotated = async (): Promise<Uint8Array> => {
    if (!pdfBytes) throw new Error("No PDF loaded");
    const doc = await PDFDocument.load(pdfBytes.slice());
    const pages = doc.getPages();
    pages.forEach((page, idx) => {
      const rot = mode === "all" ? allRotation : (pageRotations[idx + 1] ?? 0);
      if (rot !== 0) {
        page.setRotation(degrees((page.getRotation().angle + rot + 360) % 360));
      }
    });
    const saved = await doc.save();
    return saved instanceof Uint8Array ? saved : new Uint8Array(saved);
  };

  const handlePreview = async () => {
    if (!pdfBytes) return;
    try {
      setIsWorking(true);
      const bytes = await buildRotated();
      setPreviewBytes(bytes);
      setPreviewBlob(new Blob([u8ToArrayBuffer(bytes)], { type: "application/pdf" }));
      setPreviewOpen(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setIsWorking(false); }
  };

  const setPageRot = (page: number, rot: Rotation) =>
    setPageRotations((prev) => ({ ...prev, [page]: rot }));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-6 px-4 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-sky-500/15" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <RotateCw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Rotate Pages</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Rotate all or individual PDF pages by any angle.</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <Card className="p-5">
          <input ref={inputRef} type="file" accept="application/pdf" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.currentTarget.value = ""; }} />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <Button className="gap-2" onClick={() => inputRef.current?.click()} disabled={isWorking}>
                <Upload className="h-4 w-4" /> Upload PDF
              </Button>
              {file && <p className="mt-1.5 text-xs text-muted-foreground">{file.name} · {formatMB(file.size)} · {pageCount} pages</p>}
            </div>
            {pdfBytes && (
              <Button onClick={() => void handlePreview()} disabled={isWorking} className="gap-2">
                <FileDown className="h-4 w-4" />
                {isWorking ? "Processing…" : "Preview & Export"}
              </Button>
            )}
          </div>
        </Card>

        {/* Controls */}
        {pdfBytes && (
          <Card className="p-5">
            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-4">
              {(["all", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    mode === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "all" ? "Rotate All Pages" : "Per-Page Rotation"}
                </button>
              ))}
            </div>

            <Separator className="mb-4" />

            {mode === "all" ? (
              <div className="flex flex-wrap gap-3">
                {([90, 180, 270, -90] as Rotation[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAllRotation(r)}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-5 py-3 text-xs transition-all ${
                      allRotation === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r === 90 || r === -90 ? (
                      r === 90 ? <RotateCw className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />
                    ) : (
                      <RotateCw className="h-5 w-5 rotate-180" />
                    )}
                    {r > 0 ? `+${r}°` : `${r}°`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <div key={p} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/10 px-4 py-2">
                    <span className="w-16 text-xs text-muted-foreground">Page {p}</span>
                    <div className="flex gap-1.5">
                      {([0, 90, 180, 270, -90] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setPageRot(p, r as Rotation)}
                          className={`rounded-lg border px-2 py-1 text-[10px] transition-colors ${
                            (pageRotations[p] ?? 0) === r
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {r === 0 ? "0°" : r > 0 ? `+${r}°` : `${r}°`}
                        </button>
                      ))}
                    </div>
                    {pageRotations[p] && pageRotations[p] !== 0 && (
                      <Badge variant="outline" className="ml-auto text-[10px] text-primary border-primary/30">{pageRotations[p]}°</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={(o) => { setPreviewOpen(o); if (!o) { setPreviewBytes(null); setPreviewBlob(null); } }}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Preview rotated PDF</DialogTitle>
              <DialogDescription>Confirm the result, then download.</DialogDescription>
            </DialogHeader>
            <div className="h-[70vh] w-full overflow-hidden rounded-md border border-border">
              {previewBytes ? <PdfExportPreview bytes={previewBytes} scale={1.1} /> : null}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Close</Button>
              <Button onClick={() => { if (!previewBlob) return; downloadBlob(previewBlob, outputName); toast({ title: "Downloaded", description: outputName }); setPreviewOpen(false); }} disabled={!previewBlob}>
                <FileDown className="mr-2 h-4 w-4" /> Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
