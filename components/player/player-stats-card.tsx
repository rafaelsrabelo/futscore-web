"use client";

import { CompactCard } from "@/components/ui/compact-card";
import { TrendingUp } from "lucide-react";

interface PlayerStatsCardProps {
  wins: number;
  draws: number;
  losses: number;
  totalMatches: number;
  averageRating?: number;
}

export function PlayerStatsCard({ 
  wins, 
  draws, 
  losses, 
  totalMatches,
  averageRating 
}: PlayerStatsCardProps) {
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <CompactCard 
      title="Estatísticas" 
      icon={<TrendingUp className="w-4 h-4 text-primary" />}
    >
      <div className="flex flex-col justify-center h-full space-y-4">
        {/* V/E/D Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-green-500">{wins}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Vitórias</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-yellow-500">{draws}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Empates</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-500">{losses}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Derrotas</p>
        </div>
        </div>

        {/* Secondary Stats */}
        <div className="pt-3 border-t space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Taxa de Vitória</span>
          <span className="text-sm font-bold text-green-500">{winRate}%</span>
        </div>
        {averageRating && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Média</span>
            <span className="text-sm font-bold text-primary">{averageRating.toFixed(1)} ⭐</span>
          </div>
        )}
        </div>
      </div>
    </CompactCard>
  );
}

