import { useMemo, useRef, useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

import { TopNav } from "@/components/layout/TopNav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { PdfExportPreview } from "@/components/pdf/PdfExportPreview";
import { downloadBlob, u8ToArrayBuffer } from "@/lib/blob";
import { FileDown, Upload } from "lucide-react";

export default function Watermark() {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const [textEnabled, setTextEnabled] = useState(true);
  const [wmText, setWmText] = useState("CONFIDENTIAL");
  const [textOpacity, setTextOpacity] = useState(0.18);
  const [textRotationDeg, setTextRotationDeg] = useState(-35);
  const [textSize, setTextSize] = useState(52);

  const [imageEnabled, setImageEnabled] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBytes, setImageBytes] = useState<Uint8Array | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.15);
  const [imageScalePct, setImageScalePct] = useState(35);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBytes, setPreviewBytes] = useState<Uint8Array | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  const outputName = useMemo(() => {
    const base = file?.name?.replace(/\.pdf$/i, "") || "document";
    return `${base}-watermarked.pdf`;
  }, [file]);

  const onUploadPdf = async (f: File) => {
    const bytes = new Uint8Array(await f.arrayBuffer());
    setFile(f);
    setPdfBytes(bytes);
    setPreviewOpen(false);
    setPreviewBytes(null);
    setPreviewBlob(null);
  };

  const onUploadImage = async (f: File) => {
    const ok = /image\/(png|jpeg)/i.test(f.type);
    if (!ok) {
      toast({ title: "Unsupported image", description: "Upload PNG or JPG.", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImageBytes(new Uint8Array(await f.arrayBuffer()));
    setImageEnabled(true);
  };

  const buildWatermarked = async (): Promise<Uint8Array> => {
    if (!pdfBytes) throw new Error("No PDF loaded");
    if (!textEnabled && !imageEnabled) throw new Error("Enable text or image watermark");

    const doc = await PDFDocument.load(pdfBytes.slice());
    const pages = doc.getPages();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    const embeddedImage =
      imageEnabled && imageBytes && imageFile
        ? /png$/i.test(imageFile.type)
          ? await doc.embedPng(imageBytes)
          : await doc.embedJpg(imageBytes)
        : null;

    for (const page of pages) {
      const { width, height } = page.getSize();
      const cx = width / 2;
      const cy = height / 2;

      if (textEnabled && wmText.trim()) {
        const clampedOpacity = clamp01(textOpacity);
        page.drawText(wmText, {
          x: cx,
          y: cy,
          size: Math.max(8, Math.min(220, textSize)),
          font,
          color: rgb(0, 0, 0),
          opacity: clampedOpacity,
          rotate: degrees(textRotationDeg),
          xSkew: undefined,
          ySkew: undefined,
          // center-ish anchor: estimate width using font
          // (pdf-lib doesn't provide true anchor; we adjust with approximate width)
        });
      }

      if (embeddedImage && imageEnabled) {
        const clampedOpacity = clamp01(imageOpacity);
        const targetW = (width * Math.max(5, Math.min(95, imageScalePct))) / 100;
        const scaled = embeddedImage.scale(targetW / embeddedImage.width);
        page.drawImage(embeddedImage, {
          x: cx - scaled.width / 2,
          y: cy - scaled.height / 2,
          width: scaled.width,
          height: scaled.height,
          opacity: clampedOpacity,
        });
      }
    }

    const saved = await doc.save();
    return saved instanceof Uint8Array ? saved : new Uint8Array(saved);
  };

  const preview = async () => {
    if (!pdfBytes) return;
    try {
      setIsWorking(true);
      const bytes = await buildWatermarked();
      const blob = new Blob([u8ToArrayBuffer(bytes)], { type: "application/pdf" });
      setPreviewBytes(bytes);
      setPreviewBlob(blob);
      setPreviewOpen(true);
    } catch (e) {
      toast({ title: "Watermark failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav variant="editor" />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Watermark</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add a text and/or image watermark to all pages.</p>
        </div>

        <Card className="p-5">
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onUploadPdf(f);
              e.currentTarget.value = "";
            }}
          />
          <input
            ref={imgInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onUploadImage(f);
              e.currentTarget.value = "";
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button className="gap-2" onClick={() => pdfInputRef.current?.click()} disabled={isWorking}>
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
              <Button
                variant="secondary"
                onClick={() => imgInputRef.current?.click()}
                disabled={!pdfBytes || isWorking}
              >
                Upload watermark image
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setPdfBytes(null);
                  setPreviewOpen(false);
                  setPreviewBytes(null);
                  setPreviewBlob(null);
                }}
                disabled={!pdfBytes || isWorking}
              >
                Clear
              </Button>
              <Button onClick={() => void preview()} disabled={!pdfBytes || isWorking} className="gap-2">
                <FileDown className="h-4 w-4" />
                {isWorking ? "Working…" : "Preview & Download"}
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {!pdfBytes ? (
            <div className="rounded-md border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              Upload a PDF to add a watermark.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={textEnabled} onChange={(e) => setTextEnabled(e.target.checked)} />
                  Enable text watermark
                </label>

                <div className="grid gap-2">
                  <Label htmlFor="wmText">Text</Label>
                  <Input id="wmText" value={wmText} onChange={(e) => setWmText(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="wmSize">Size</Label>
                    <Input
                      id="wmSize"
                      type="number"
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wmRot">Rotation (deg)</Label>
                    <Input
                      id="wmRot"
                      type="number"
                      value={textRotationDeg}
                      onChange={(e) => setTextRotationDeg(Number(e.target.value || 0))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wmOpacity">Opacity (0-1)</Label>
                    <Input
                      id="wmOpacity"
                      type="number"
                      step={0.05}
                      min={0}
                      max={1}
                      value={textOpacity}
                      onChange={(e) => setTextOpacity(Number(e.target.value || 0))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={imageEnabled}
                    onChange={(e) => setImageEnabled(e.target.checked)}
                    disabled={!imageBytes}
                  />
                  Enable image watermark
                </label>
                <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Image: {imageFile ? imageFile.name : "(none)"}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="imgScale">Scale (% page width)</Label>
                    <Input
                      id="imgScale"
                      type="number"
                      min={5}
                      max={95}
                      value={imageScalePct}
                      onChange={(e) => setImageScalePct(Number(e.target.value || 0))}
                      disabled={!imageBytes}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imgOpacity">Opacity (0-1)</Label>
                    <Input
                      id="imgOpacity"
                      type="number"
                      step={0.05}
                      min={0}
                      max={1}
                      value={imageOpacity}
                      onChange={(e) => setImageOpacity(Number(e.target.value || 0))}
                      disabled={!imageBytes}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewBytes(null);
            setPreviewBlob(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Preview watermarked PDF</DialogTitle>
            <DialogDescription>Confirm the result, then download.</DialogDescription>
          </DialogHeader>

          <div className="h-[70vh] w-full overflow-hidden rounded-md border border-border">
            {previewBytes ? <PdfExportPreview bytes={previewBytes} scale={1.1} /> : null}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (!previewBlob) return;
                downloadBlob(previewBlob, outputName);
                toast({ title: "Downloaded", description: outputName });
                setPreviewOpen(false);
              }}
              disabled={!previewBlob}
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
