import { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

import { TopNav } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { downloadBlob, u8ToArrayBuffer } from "@/lib/blob";
import { parsePageRange, splitRangeGroups } from "@/lib/pageRange";
import { FileDown, Upload, Plus, Trash2, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatMB(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function SplitPdf() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [groups, setGroups] = useState<string[]>(["1-3", "4-6"]);
  const [isWorking, setIsWorking] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);

  const baseName = useMemo(() => file?.name?.replace(/\.pdf$/i, "") || "split", [file]);

  const onUpload = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile(f);
    setPdfBytes(bytes);
    setResults([]);
    try {
      const doc = await PDFDocument.load(bytes.slice());
      const n = doc.getPageCount();
      setPageCount(n);
      // Auto-suggest two equal halves
      const mid = Math.ceil(n / 2);
      setGroups([`1-${mid}`, `${mid + 1}-${n}`]);
    } catch {
      toast({ title: "Invalid PDF", description: "Please upload a valid PDF.", variant: "destructive" });
    }
  };

  const addGroup = () => setGroups((g) => [...g, ""]);
  const removeGroup = (i: number) => setGroups((g) => g.filter((_, idx) => idx !== i));
  const updateGroup = (i: number, v: string) => setGroups((g) => g.map((x, idx) => idx === i ? v : x));

  const buildSplits = async () => {
    if (!pdfBytes || !pageCount) return;
    const src = await PDFDocument.load(pdfBytes.slice());
    const out: { name: string; bytes: Uint8Array }[] = [];

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i].trim();
      if (!g) continue;
      const parsed = parsePageRange(g, pageCount);
      if (!parsed.ok) throw new Error(`Group ${i + 1}: ${parsed.error}`);
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, parsed.pages.map((p) => p - 1));
      pages.forEach((p) => doc.addPage(p));
      const saved = await doc.save();
      out.push({
        name: `${baseName}-part-${i + 1}.pdf`,
        bytes: saved instanceof Uint8Array ? saved : new Uint8Array(saved),
      });
    }
    return out;
  };

  const handleSplit = async () => {
    if (!pdfBytes) return;
    try {
      setIsWorking(true);
      setResults([]);
      const parts = await buildSplits();
      if (!parts?.length) throw new Error("No valid groups defined.");
      const blobs = parts.map((p) => ({
        name: p.name,
        blob: new Blob([u8ToArrayBuffer(p.bytes)], { type: "application/pdf" }),
      }));
      setResults(blobs);
      toast({ title: `Split into ${blobs.length} PDFs`, description: "Download each part or grab the ZIP." });
    } catch (e: any) {
      toast({ title: "Split failed", description: e.message ?? "Unknown error.", variant: "destructive" });
    } finally {
      setIsWorking(false);
    }
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const r of results) {
      zip.file(r.name, r.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${baseName}-split.zip`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pt-24">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-6 px-4 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-6 sm:px-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-sky-500/15" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Scissors className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Split PDF</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Divide a PDF into multiple files by custom page ranges.
              </p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <Card className="p-5">
          <input ref={inputRef} type="file" accept="application/pdf" className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); e.currentTarget.value = ""; }} />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Button className="gap-2" onClick={() => inputRef.current?.click()} disabled={isWorking}>
                <Upload className="h-4 w-4" /> Upload PDF
              </Button>
              {file && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {file.name} · {formatMB(file.size)} · {pageCount} pages
                </p>
              )}
            </div>
            {pdfBytes && (
              <Button onClick={() => void handleSplit()} disabled={isWorking || !groups.some(g => g.trim())} className="gap-2">
                <Scissors className="h-4 w-4" />
                {isWorking ? "Splitting…" : "Split PDF"}
              </Button>
            )}
          </div>
        </Card>

        {/* Range groups */}
        {pdfBytes && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Split Groups</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Each group becomes a separate PDF. Use ranges like <code className="text-primary">1-5</code> or comma lists like <code className="text-primary">1,3,5</code>.
                </p>
              </div>
              <Badge variant="outline" className="text-xs">{pageCount} pages total</Badge>
            </div>

            <Separator className="mb-4" />

            <div className="space-y-3">
              {groups.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Label className="w-20 text-xs text-muted-foreground shrink-0">Part {i + 1}</Label>
                  <Input
                    value={g}
                    onChange={(e) => updateGroup(i, e.target.value)}
                    placeholder="e.g. 1-3 or 1,3,5"
                    className="flex-1 text-sm"
                    disabled={isWorking}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeGroup(i)} disabled={groups.length <= 1 || isWorking}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={addGroup} disabled={isWorking}>
              <Plus className="h-4 w-4" /> Add Group
            </Button>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Download Parts</h2>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => void downloadZip()}>
                <FileDown className="h-4 w-4" /> Download All (ZIP)
              </Button>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{formatMB(r.blob.size)}</span>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadBlob(r.blob, r.name)}>
                    <FileDown className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
