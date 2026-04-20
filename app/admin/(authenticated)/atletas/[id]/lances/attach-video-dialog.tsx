"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { attachPlayVideoAction } from "@/lib/admin/actions";
import {
  UploadProgress,
  VideoPicker,
  getPresignedUploadUrl,
  uploadToR2,
} from "./upload-helpers";

export function AttachVideoDialog({
  playId,
  open,
  onOpenChange,
  playLabel,
}: {
  playId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playLabel?: string;
}) {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setVideoFile(null);
    setSubmitting(false);
    setStage("idle");
    setUploadPct(0);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!videoFile) {
      setError("Selecione um vídeo.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      setStage("uploading");
      setUploadPct(0);
      const presigned = await getPresignedUploadUrl(videoFile);
      const contentType =
        presigned.instructions?.headers?.["Content-Type"] ??
        videoFile.type ??
        "video/mp4";
      await uploadToR2(
        presigned.uploadUrl,
        videoFile,
        contentType,
        setUploadPct
      );

      setStage("saving");
      const result = await attachPlayVideoAction({
        playId,
        videoUrl: presigned.publicUrl,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      reset();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha inesperada.");
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Anexar vídeo ao lance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {playLabel && (
            <p className="text-sm text-muted-foreground">
              Lance: <span className="font-medium text-foreground">{playLabel}</span>
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground font-medium">
              Vídeo
            </Label>
            <VideoPicker
              file={videoFile}
              onPick={setVideoFile}
              disabled={submitting}
            />
            {stage === "uploading" && <UploadProgress pct={uploadPct} />}
          </div>

          <p className="text-xs text-muted-foreground">
            O upload vai direto para o R2. A miniatura é gerada automaticamente
            alguns segundos depois.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !videoFile}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {stage === "uploading"
                ? "Enviando..."
                : stage === "saving"
                  ? "Salvando..."
                  : "Anexar vídeo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
