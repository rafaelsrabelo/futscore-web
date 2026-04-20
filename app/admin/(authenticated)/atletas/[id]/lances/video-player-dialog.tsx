"use client";

import { Calendar, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminPlayItem } from "@/lib/admin/types";

interface Props {
  play: AdminPlayItem;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function VideoPlayerDialog({ play, label, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{label}</DialogTitle>

        <div className="relative bg-black">
          {play.videoUrl ? (
            <video
              src={play.videoUrl}
              controls
              autoPlay
              playsInline
              poster={play.thumbnailUrl ?? undefined}
              className="w-full aspect-video"
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-muted-foreground text-sm">
              Vídeo indisponível.
            </div>
          )}
        </div>

        <div className="p-4 space-y-2 bg-background">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 rounded-full px-2 py-0.5">
                {label}
              </span>
              {play.rating != null && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {play.rating}
                </span>
              )}
            </div>
            {play.match && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(play.match.date)} · vs {play.match.adversaryTeam}
              </span>
            )}
          </div>

          {play.classifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {play.classifications.map((c) => (
                <span
                  key={c.id}
                  className="text-[9px] font-medium uppercase tracking-wider rounded bg-muted text-muted-foreground px-1.5 py-0.5"
                >
                  {c.classification}
                </span>
              ))}
            </div>
          )}

          {play.observations && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              {play.observations}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
