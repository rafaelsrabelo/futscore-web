import { Info } from "lucide-react";
import type { VideoPlay } from "@/lib/types";

interface PlayerVideoStatsProps {
  videoFeed: VideoPlay[];
}

export function PlayerVideoStats({ videoFeed }: PlayerVideoStatsProps) {
  const goals = videoFeed.filter((v) => v.type === "GOAL").length;
  const assists = videoFeed.filter((v) => v.type === "ASSIST").length;
  const saves = videoFeed.filter((v) =>
    [
      "DIFFICULT_SAVE",
      "EASY_SAVE",
      "PENALTY_SAVE",
      "ONE_ON_ONE_SAVE",
      "REFLEX_SAVE",
      "DIVING_SAVE",
    ].includes(v.type)
  ).length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">{goals}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Gols</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{assists}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Assistências</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">{saves}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Defesas</p>
        </div>
      </div>
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Estimativa baseada nos vídeos cadastrados, não é uma estatística
          oficial.
        </span>
      </div>
    </div>
  );
}
