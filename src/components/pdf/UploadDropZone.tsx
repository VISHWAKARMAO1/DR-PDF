import React, { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileCheck2, AlertCircle } from "lucide-react";

interface UploadDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  /** Accepted MIME types for validation (e.g. ["application/pdf"]) */
  acceptedTypes?: string[];
  /** Accepted file extensions for validation (e.g. [".pdf"]) */
  acceptedExtensions?: string[];
  /** Show file name after upload */
  currentFileName?: string | null;
}

export function UploadDropZone({
  onFiles,
  accept = "application/pdf",
  multiple = false,
  disabled = false,
  label = "Drop your PDF here",
  sublabel = "or click to browse",
  className,
  acceptedTypes = ["application/pdf"],
  acceptedExtensions = [".pdf"],
  currentFileName,
}: UploadDropZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validate = (files: File[]): File[] => {
    return files.filter((f) => {
      const typeOk = acceptedTypes.some((t) => f.type === t);
      const extOk = acceptedExtensions.some((e) => f.name.toLowerCase().endsWith(e));
      return typeOk || extOk;
    });
  };

  const handleFiles = useCallback(
    (raw: FileList | null) => {
      if (!raw || !raw.length) return;
      const arr = Array.from(raw);
      const valid = validate(arr);
      if (!valid.length) {
        setDragError(`Unsupported file type. Expected: ${acceptedExtensions.join(", ")}`);
        setTimeout(() => setDragError(null), 3000);
        return;
      }
      setDragError(null);
      onFiles(valid);
    },
    [onFiles, acceptedExtensions, acceptedTypes] // eslint-disable-line
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload file"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 select-none outline-none",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        dragError && "border-destructive bg-destructive/5",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      {dragError ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{dragError}</p>
        </>
      ) : currentFileName ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
            <FileCheck2 className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{currentFileName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Click or drop to replace</p>
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background/70 transition-colors duration-200",
              "group-hover:border-primary/50 group-hover:bg-primary/10"
            )}
          >
            <Upload className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
          </div>
        </>
      )}
    </div>
  );
}
