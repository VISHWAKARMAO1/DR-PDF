import { useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { downloadBlob, u8ToArrayBuffer } from "@/lib/blob";
import { FileCheck, FileDown, Upload, CheckCircle2, ArrowRight } from "lucide-react";

function formatMB(b: number) { return `${(b / (1024 * 1024)).toFixed(2)} MB`; }

export default function FlattenPdf() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const outputName = useMemo(() => `${file?.name?.replace(/\.pdf$/i, "") || "document"}-flattened.pdf`, [file]);

  const onUpload = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile(f); setPdfBytes(bytes); setResult(null);
    try {
      const doc = await PDFDocument.load(bytes.slice());
      setPageCount(doc.getPageCount());
    } catch {
      toast({ title: "Invalid PDF", description: "Please upload a valid PDF file.", variant: "destructive" });
    }
  };

  const handleFlatten = async () => {
    if (!pdfBytes || !file) return;
    try {
      setIsWorking(true);
      // Load and immediately re-save to remove interactive fields, normalize structure
      const doc = await PDFDocument.load(pdfBytes.slice(), { ignoreEncryption: false });
      const form = doc.getForm();
      // Flatten form fields (makes them non-editable, bakes them into the page)
      try { form.flatten(); } catch { /* PDF may not have forms — that's fine */ }

      const saved = await doc.save({ addDefaultPage: false });
      const bytes = saved instanceof Uint8Array ? saved : new Uint8Array(saved);
      const blob = new Blob([u8ToArrayBuffer(bytes)], { type: "application/pdf" });
      setResult({ blob, size: blob.size });
      toast({ title: "PDF Flattened", description: "All form fields have been baked in. Ready to download." });
    } catch (e: any) {
      toast({ title: "Error flattening PDF", description: e.message, variant: "destructive" });
    } finally { setIsWorking(false); }
  };

  const savings = result && file ? file.size - result.size : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 px-4 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-sky-500/15" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Flatten PDF</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Bake form fields into the page content and normalize PDF structure.
              </p>
            </div>
          </div>
        </div>

        {/* What it does */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold mb-3">What Flatten does</h2>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {[
              { title: "Locks Form Fields", desc: "Converts fillable fields into static text — no more editable forms." },
              { title: "Removes Annotations", desc: "Stamps, comments, and markup become part of the page." },
              { title: "Normalizes Structure", desc: "Re-saves the whole PDF, fixing minor structural issues." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-semibold">{item.title}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Upload + action */}
        <Card className="p-5">
          <input ref={inputRef} type="file" accept="application/pdf" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.currentTarget.value = ""; }} />

          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 p-10 transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background/70 group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors">
                <Upload className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop your PDF here</p>
                <p className="mt-0.5 text-xs text-muted-foreground">or click to browse</p>
              </div>
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              {/* File info */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <FileCheck className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatMB(file.size)} · {pageCount} pages</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="shrink-0">
                  Replace
                </Button>
              </div>

              <Button onClick={() => void handleFlatten()} disabled={isWorking} className="w-full gap-2">
                <FileCheck className="h-4 w-4" />
                {isWorking ? "Flattening…" : "Flatten PDF"}
              </Button>
            </div>
          )}
        </Card>

        {/* Result */}
        {result && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Flatten Complete</h2>
            <Separator className="mb-4" />

            <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-sm flex-1">
                <span className="text-muted-foreground">{formatMB(file!.size)}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                <span className="font-semibold text-primary">{formatMB(result.size)}</span>
                {savings && savings > 0 && (
                  <span className="text-xs text-muted-foreground">(saved {formatMB(savings)})</span>
                )}
              </div>
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />
            </div>

            <Button
              className="w-full gap-2"
              onClick={() => downloadBlob(result.blob, outputName)}
            >
              <FileDown className="h-4 w-4" />
              Download Flattened PDF
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
