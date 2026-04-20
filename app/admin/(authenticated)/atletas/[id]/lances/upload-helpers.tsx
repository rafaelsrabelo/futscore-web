"use client";

import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresignedResponse {
  uploadUrl: string;
  publicUrl: string;
  instructions?: { headers?: { "Content-Type"?: string } };
}

export async function getPresignedUploadUrl(
  file: File
): Promise<PresignedResponse> {
  const res = await fetch(
    `/admin/api/upload-url?filename=${encodeURIComponent(file.name)}`
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      data?.message ?? `Falha ao gerar URL de upload (HTTP ${res.status}).`
    );
  }
  return (await res.json()) as PresignedResponse;
}

export function uploadToR2(
  url: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload falhou (HTTP ${xhr.status}).`));
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Erro de rede durante o upload."))
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Upload cancelado."))
    );
    xhr.send(file);
  });
}

export function VideoPicker({
  file,
  onPick,
  disabled,
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  disabled?: boolean;
}) {
  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-md border border-border/60 bg-card/40">
        <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPick(null)}
          disabled={disabled}
          aria-label="Remover vídeo"
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
  return (
    <label
      className={cn(
        "flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-border bg-card/30 px-3 py-4 text-sm text-muted-foreground",
        "hover:border-primary/40 hover:text-foreground transition-colors",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <Upload className="w-4 h-4" />
      Selecionar vídeo (.mp4, .mov...)
      <input
        type="file"
        accept="video/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) onPick(f);
        }}
      />
    </label>
  );
}

export function UploadProgress({ pct }: { pct: number }) {
  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Enviando para o R2... {pct}%
      </p>
    </div>
  );
}
