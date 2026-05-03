"use client";

import { Calendar, Play, Star, Upload, VideoOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { AdminPlayItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { AttachVideoDialog } from "./attach-video-dialog";
import { PlayActionsMenu } from "./play-actions-menu";
import { VideoPlayerDialog } from "./video-player-dialog";

const PLAY_TYPE_LABELS: Record<string, string> = {
  GOAL: "Gol",
  ASSIST: "Assistência",
  DIFFICULT_SAVE: "Defesa difícil",
  EASY_SAVE: "Defesa fácil",
  PASS: "Passe",
  KEY_PASS: "Passe decisivo",
  DRIBBLE: "Drible",
  TACKLE: "Desarme",
  INTERCEPTION: "Interceptação",
  FOUL_COMMITTED: "Falta cometida",
  FOUL_RECEIVED: "Falta sofrida",
  YELLOW_CARD: "Cartão amarelo",
  RED_CARD: "Cartão vermelho",
  HEADER: "Cabeceio",
  SHOT_ON_TARGET: "Finalização no alvo",
  SHOT_OFF_TARGET: "Finalização fora",
  BEST_MOMENTS: "Melhores momentos",
  ANTICIPATION: "Antecipação",
  LONG_PASS: "Lançamento",
  FREE_KICK: "Falta direta",
  CROSS: "Cruzamento",
  CORNER_KICK: "Escanteio",
  PENALTY: "Pênalti",
  PENALTY_SAVE: "Defesa de pênalti",
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  PHYSICAL: "Físico",
  TACTICAL: "Tático",
  TECHNICAL: "Técnico",
  MENTAL: "Mental",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export function PlayCard({ play }: { play: AdminPlayItem }) {
  const [attachOpen, setAttachOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const media = play.thumbnailUrl ?? play.photoUrl;
  const hasVideo = Boolean(play.videoUrl);
  const label = PLAY_TYPE_LABELS[play.playType] ?? play.playType;
  const canAttach = !hasVideo;
  const canPlay = hasVideo;

  const playLabelForMenu = [label, play.match?.adversaryTeam]
    .filter(Boolean)
    .join(" · ");

  const cardContent = (
    <>
      <div className="relative aspect-video bg-muted/60">
        {media ? (
          <Image
            src={media}
            alt={label}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <VideoOff className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Sem vídeo</span>
            {canAttach && (
              <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 rounded-full px-2 py-0.5">
                <Upload className="w-3 h-3" />
                Clique para anexar
              </span>
            )}
          </div>
        )}
        {hasVideo && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-black ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="rounded-md bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 backdrop-blur-sm">
            {label}
          </span>
        </div>
      </div>

      <div className="p-3">
        {play.match ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {formatDate(play.match.date)} · vs {play.match.adversaryTeam}
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Sem partida vinculada
          </div>
        )}

        {play.classifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {play.classifications.map((c) => (
              <span
                key={c.id}
                className="text-[9px] font-medium uppercase tracking-wider rounded bg-muted text-muted-foreground px-1.5 py-0.5"
              >
                {CLASSIFICATION_LABELS[c.classification] ?? c.classification}
              </span>
            ))}
          </div>
        )}

        {play.observations && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {play.observations}
          </p>
        )}
      </div>
    </>
  );

  const cardClass = cn(
    "relative overflow-hidden rounded-xl border border-border/60 bg-card/50 transition-colors text-left w-full",
    "cursor-pointer hover:border-primary/60 hover:bg-card/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
  );

  function handleClick() {
    if (canPlay) setVideoOpen(true);
    else if (canAttach) setAttachOpen(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }

  return (
    <div className="group relative">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cardClass}
      >
        {cardContent}
      </div>

      <div
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {play.rating != null && (
          <div className="flex items-center gap-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 backdrop-blur-sm pointer-events-none">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {play.rating}
          </div>
        )}
        <PlayActionsMenu play={play} playLabel={playLabelForMenu} />
      </div>

      {canPlay && (
        <VideoPlayerDialog
          play={play}
          label={label}
          open={videoOpen}
          onOpenChange={setVideoOpen}
        />
      )}

      {canAttach && (
        <AttachVideoDialog
          playId={play.id}
          open={attachOpen}
          onOpenChange={setAttachOpen}
          playLabel={[label, play.match?.adversaryTeam]
            .filter(Boolean)
            .join(" · ")}
        />
      )}
    </div>
  );
}
