import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChevronRight, Trash2, Type } from "lucide-react";
import type { PdfFontPreset, PdfTextEdit } from "./pdfTypes";

type PdfInspectorProps = {
  isOpen: boolean;
  onClose: () => void;
  activeEdit: PdfTextEdit | null;
  replaceFind: string;
  replaceWith: string;
  replaceAllInSelection: boolean;
  onReplaceFindChange: (v: string) => void;
  onReplaceWithChange: (v: string) => void;
  onReplaceAllChange: (v: boolean) => void;
  onApplyReplace: () => void;
  onUpdateEdit: (key: string, partial: Partial<PdfTextEdit>) => void;
  onDiscardEdit: (key: string) => void;
};

export function PdfInspector(props: PdfInspectorProps) {
  const {
    isOpen,
    onClose,
    activeEdit,
    replaceFind,
    replaceWith,
    replaceAllInSelection,
    onReplaceFindChange,
    onReplaceWithChange,
    onReplaceAllChange,
    onApplyReplace,
    onUpdateEdit,
    onDiscardEdit,
  } = props;

  return (
    <>
      {/* Right inspector */}
      <aside
        className={cn(
          "absolute right-0 top-0 h-full shrink-0 border-l border-border bg-background transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
          "w-[340px] z-20"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Inspector header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
            <div className="text-sm font-medium">Inspector</div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Inspector content */}
          <div className="flex-1 overflow-auto p-3">
            {!activeEdit ? (
              <div className="text-center text-sm text-muted-foreground">
                Click any word to edit
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-text">Text</Label>
                  <Input
                    id="new-text"
                    value={activeEdit.newText}
                    onChange={(e) => onUpdateEdit(activeEdit.key, { newText: e.target.value })}
                  />
                  <div className="text-xs text-muted-foreground">
                    Original: {activeEdit.originalText}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">Replace</div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="replace-find" className="text-xs text-muted-foreground">
                        Find
                      </Label>
                      <Input
                        id="replace-find"
                        value={replaceFind}
                        onChange={(e) => onReplaceFindChange(e.target.value)}
                        placeholder="word"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="replace-with" className="text-xs text-muted-foreground">
                        Replace with
                      </Label>
                      <Input
                        id="replace-with"
                        value={replaceWith}
                        onChange={(e) => onReplaceWithChange(e.target.value)}
                        placeholder="new word"
                      />
                    </div>
                  </div>

                  <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={replaceAllInSelection}
                      onChange={(e) => onReplaceAllChange(e.target.checked)}
                    />
                    Replace all matches in this selection
                  </label>

                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={onApplyReplace}
                    disabled={!replaceFind}
                  >
                    Apply replace
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={activeEdit.fontPreset}
                      onValueChange={(v) => onUpdateEdit(activeEdit.key, { fontPreset: v as PdfFontPreset })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Auto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (match)</SelectItem>
                        <SelectItem value="helvetica">Sans</SelectItem>
                        <SelectItem value="times">Serif</SelectItem>
                        <SelectItem value="courier">Mono</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Detected: {activeEdit.detectedFontFamily ?? "Unknown"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font size</Label>
                    <div className="px-1">
                      <Slider
                        id="font-size"
                        min={8}
                        max={48}
                        step={1}
                        value={[activeEdit.fontSize]}
                        onValueChange={(v) => onUpdateEdit(activeEdit.key, { fontSize: v[0] })}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activeEdit.fontSize}px
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={activeEdit.colorHex}
                      onChange={(e) => onUpdateEdit(activeEdit.key, { colorHex: e.target.value })}
                      className="h-10 p-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="block">Style</Label>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeEdit.bold}
                          onChange={(e) => onUpdateEdit(activeEdit.key, { bold: e.target.checked })}
                        />
                        Bold
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeEdit.italic}
                          onChange={(e) => onUpdateEdit(activeEdit.key, { italic: e.target.checked })}
                        />
                        Italic
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={activeEdit.underline}
                          onChange={(e) => onUpdateEdit(activeEdit.key, { underline: e.target.checked })}
                        />
                        Underline
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDiscardEdit(activeEdit.key)}
                >
                  <Trash2 className="h-4 w-4" />
                  Discard change
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Inspector toggle (when closed) */}
      {!isOpen && (
        <button
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background shadow-sm transition hover:bg-muted"
          onClick={() => {}}
          aria-label="Open inspector"
        >
          <Type className="h-4 w-4" />
        </button>
      )}
    </>
  );
}