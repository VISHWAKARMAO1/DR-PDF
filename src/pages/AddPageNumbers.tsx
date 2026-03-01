import { useMemo, useRef, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PdfExportPreview } from "@/components/pdf/PdfExportPreview";
import { downloadBlob, u8ToArrayBuffer } from "@/lib/blob";
import { FileDown, Hash, Upload } from "lucide-react";

type HAlign = "left" | "center" | "right";
type VAlign = "top" | "bottom";

function formatMB(b: number) { return `${(b / (1024 * 1024)).toFixed(2)} MB`; }

export default function AddPageNumbers() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isWorking, setIsWorking] = useState(false);

  // Config
  const [vAlign, setVAlign] = useState<VAlign>("bottom");
  const [hAlign, setHAlign] = useState<HAlign>("center");
  const [fontSize, setFontSize] = useState(11);
  const [startNumber, setStartNumber] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [margin, setMargin] = useState(24);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBytes, setPreviewBytes] = useState<Uint8Array | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const outputName = useMemo(() => `${file?.name?.replace(/\.pdf$/i, "") || "document"}-numbered.pdf`, [file]);

  const onUpload = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile(f);
    setPdfBytes(bytes);
    setPreviewOpen(false); setPreviewBytes(null); setPreviewBlob(null);
    try { const doc = await PDFDocument.load(bytes.slice()); setPageCount(doc.getPageCount()); }
    catch { toast({ title: "Invalid PDF", variant: "destructive" }); }
  };

  const buildNumbered = async (): Promise<Uint8Array> => {
    if (!pdfBytes) throw new Error("No PDF loaded");
    const doc = await PDFDocument.load(pdfBytes.slice());
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();

    pages.forEach((page, idx) => {
      const { width, height } = page.getSize();
      const num = idx + startNumber;
      const label = `${prefix}${num}${suffix}`;
      const textWidth = font.widthOfTextAtSize(label, fontSize);

      let x: number;
      if (hAlign === "left") x = margin;
      else if (hAlign === "right") x = width - margin - textWidth;
      else x = (width - textWidth) / 2;

      const y = vAlign === "bottom" ? margin : height - margin - fontSize;

      page.drawText(label, {
        x, y,
        size: fontSize,
        font,
        color: rgb(0.25, 0.25, 0.25),
        opacity: 0.8,
      });
    });

    const saved = await doc.save();
    return saved instanceof Uint8Array ? saved : new Uint8Array(saved);
  };

  const handlePreview = async () => {
    if (!pdfBytes) return;
    try {
      setIsWorking(true);
      const bytes = await buildNumbered();
      setPreviewBytes(bytes);
      setPreviewBlob(new Blob([u8ToArrayBuffer(bytes)], { type: "application/pdf" }));
      setPreviewOpen(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setIsWorking(false); }
  };

  const AlignButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-6 px-4 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-sky-500/15" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Add Page Numbers</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Stamp sequential page numbers on every page of a PDF.</p>
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

        {/* Config */}
        {pdfBytes && (
          <Card className="p-5 space-y-5">
            {/* Position */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vertical Position</Label>
              <div className="mt-2 flex gap-2">
                <AlignButton label="Top" active={vAlign === "top"} onClick={() => setVAlign("top")} />
                <AlignButton label="Bottom" active={vAlign === "bottom"} onClick={() => setVAlign("bottom")} />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Horizontal Alignment</Label>
              <div className="mt-2 flex gap-2">
                <AlignButton label="Left" active={hAlign === "left"} onClick={() => setHAlign("left")} />
                <AlignButton label="Center" active={hAlign === "center"} onClick={() => setHAlign("center")} />
                <AlignButton label="Right" active={hAlign === "right"} onClick={() => setHAlign("right")} />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Start Number</Label>
                <Input
                  type="number" min={0} max={999} value={startNumber}
                  onChange={(e) => setStartNumber(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Preview: {prefix}{startNumber}{suffix}</Label>
                <div className="flex gap-2">
                  <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Prefix" className="text-sm" />
                  <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="Suffix" className="text-sm" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Font Size: {fontSize}px</Label>
              <Slider min={7} max={24} step={1} value={[fontSize]} onValueChange={([v]) => setFontSize(v)} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Margin: {margin}px</Label>
              <Slider min={8} max={80} step={2} value={[margin]} onValueChange={([v]) => setMargin(v)} />
            </div>
          </Card>
        )}

        <Dialog open={previewOpen} onOpenChange={(o) => { setPreviewOpen(o); if (!o) { setPreviewBytes(null); setPreviewBlob(null); } }}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Preview numbered PDF</DialogTitle>
              <DialogDescription>Confirm page numbers look correct, then download.</DialogDescription>
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
