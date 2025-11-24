import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { MapPin, Star } from "lucide-react";

interface MatchListItemProps {
  match: Match;
  showTimeline?: boolean;
}

export function MatchListItem({ match, showTimeline = true }: MatchListItemProps) {
  const getResultColor = () => {
    switch (match.result) {
      case "WIN": return "bg-green-500";
      case "DRAW": return "bg-yellow-500";
      case "LOSS": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="relative group hover:bg-muted/50 rounded-lg p-3 transition-colors border border-border/50">
      {/* Timeline Dot */}
      {showTimeline && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
          <div className={`w-2 h-2 rounded-full ${getResultColor()}`} />
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Date and Category */}
        <div className="flex flex-col gap-1 w-16 shrink-0">
          <p className="text-xs font-medium text-muted-foreground">
            {new Date(match.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
          <Badge variant="outline" className="text-[10px] w-fit px-1 py-0 h-4">
            {match.category}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="flex-1 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{match.myTeam.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              vs {match.adversaryTeam}
            </p>
          </div>

          {/* Score */}
          {match.result !== "NOT_FINISHED" && (
            <div className="flex items-center gap-2">
              <div className="text-center">
                <span className="text-base font-bold block">{match.myTeamScore}</span>
                <span className="text-base font-bold text-muted-foreground block">{match.adversaryScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Result Badge */}
        <div className="shrink-0">
          {match.result === "WIN" && (
            <div className="w-7 h-7 rounded bg-green-500/10 flex items-center justify-center">
              <span className="text-green-500 font-bold text-xs">V</span>
            </div>
          )}
          {match.result === "DRAW" && (
            <div className="w-7 h-7 rounded bg-yellow-500/10 flex items-center justify-center">
              <span className="text-yellow-500 font-bold text-xs">E</span>
            </div>
          )}
          {match.result === "LOSS" && (
            <div className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center">
              <span className="text-red-500 font-bold text-xs">D</span>
            </div>
          )}
          {match.result === "NOT_FINISHED" && (
            <Badge variant="outline" className="text-xs h-7 px-2">
              Agendado
            </Badge>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(match.location || match.performanceRating) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-xs ml-18">
          {match.performanceRating && (
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-3 h-3 fill-primary" />
              <span className="font-medium">{match.performanceRating}.0</span>
            </div>
          )}
          {match.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{match.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

