"use client";

import { MatchListItem } from "@/components/matches/match-list-item";
import { Button } from "@/components/ui/button";
import { CompactCard } from "@/components/ui/compact-card";
import type { Match } from "@/lib/types";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useState } from "react";

interface MatchesListProps {
  matches: Match[];
}

export function MatchesList({ matches }: MatchesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 3;
  
  const totalPages = Math.ceil(matches.length / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  const currentMatches = matches.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (matches.length === 0) {
    return null;
  }

  return (
    <CompactCard 
      title="Partidas Recentes" 
      icon={<Trophy className="w-4 h-4 text-primary" />}
      headerClassName="flex items-center justify-between"
    >
      <div className="space-y-2">
        {/* Lista de partidas com timeline */}
        <div className="relative space-y-2 pl-3">
          {/* Timeline vertical */}
          {totalPages > 1 && currentMatches.length > 1 && (
            <div className="absolute left-0 top-4 bottom-4 w-px bg-border" />
          )}
          
          {currentMatches.map((match) => (
            <MatchListItem 
              key={match.id} 
              match={match}
              showTimeline={true}
            />
          ))}
        </div>

        {/* Paginação compacta */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </CompactCard>
  );
}

