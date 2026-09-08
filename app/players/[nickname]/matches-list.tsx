"use client";

import { MatchListItem } from "@/components/matches/match-list-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchGroup } from "@/lib/types";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useState } from "react";

interface MatchesListProps {
  groups: MatchGroup[];
}

const MATCHES_PREVIEW_COUNT = 4;

function MatchGroupCard({ group }: { group: MatchGroup }) {
  const [expanded, setExpanded] = useState(false);

  const label = group.competition?.name || group.type || "Partidas avulsas";
  const wins = group.matches.filter((m) => m.result === "WIN").length;
  const draws = group.matches.filter((m) => m.result === "DRAW").length;
  const losses = group.matches.filter((m) => m.result === "LOSS").length;

  const visibleMatches = expanded
    ? group.matches
    : group.matches.slice(0, MATCHES_PREVIEW_COUNT);
  const hasMore = group.matches.length > MATCHES_PREVIEW_COUNT;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-primary" />
            {label}
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-green-500 font-medium">{wins}V</span>
            <span className="text-yellow-500 font-medium">{draws}E</span>
            <span className="text-red-500 font-medium">{losses}D</span>
            <span>{group.matches.length} jogos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleMatches.map((match) => (
          <MatchListItem key={match.id} match={match} showTimeline={false} />
        ))}

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 text-xs text-muted-foreground"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <>
                Mostrar menos <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Mostrar todas ({group.matches.length}){" "}
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function MatchesList({ groups }: MatchesListProps) {
  const nonEmptyGroups = groups.filter((group) => group.matches.length > 0);

  if (nonEmptyGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {nonEmptyGroups.map((group, index) => (
        <MatchGroupCard key={`${group.competition?.id ?? group.type}-${index}`} group={group} />
      ))}
    </div>
  );
}
