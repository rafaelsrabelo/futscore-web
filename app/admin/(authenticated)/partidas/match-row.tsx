import { Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AdminMatchesGlobalItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Agendada",
  LIVE: "Ao vivo",
  FINISHED: "Finalizada",
  CANCELLED: "Cancelada",
};

const RESULT_LABELS: Record<string, string> = {
  WIN: "Vitória",
  DRAW: "Empate",
  LOSS: "Derrota",
};

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

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MatchRow({ match }: { match: AdminMatchesGlobalItem }) {
  const score =
    match.myTeamScore != null && match.adversaryScore != null
      ? `${match.myTeamScore} × ${match.adversaryScore}`
      : "—";
  const athleteName = match.athleteProfile.nickname || match.athleteProfile.name;

  return (
    <Link
      href={`/admin/partidas/${match.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/60 transition-colors"
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted ring-1 ring-border shrink-0">
        {match.athleteProfile.profilePhoto ? (
          <Image
            src={match.athleteProfile.profilePhoto}
            alt={match.athleteProfile.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[10px] font-semibold text-muted-foreground">
            {initialsOf(match.athleteProfile.name)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold truncate">{athleteName}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            {POSITION_LABELS[match.athleteProfile.primaryPosition] ??
              match.athleteProfile.primaryPosition}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          vs {match.adversaryTeam} ·{" "}
          {match.competition?.name ?? "Amistoso"} · {match.playsCount}{" "}
          {match.playsCount === 1 ? "lance" : "lances"}
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-center w-20 shrink-0">
        <Calendar className="w-3 h-3 text-muted-foreground mb-0.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
          {formatDate(match.date)}
        </span>
      </div>

      <div className="text-lg font-bold tabular-nums shrink-0 min-w-[4ch] text-right">
        {score}
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 w-20">
        <StatusChip status={match.status} />
        <ResultChip result={match.result} />
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-60" />
    </Link>
  );
}

function StatusChip({ status }: { status: string }) {
  const color =
    status === "LIVE"
      ? "bg-red-500/15 text-red-500"
      : status === "FINISHED"
        ? "bg-muted text-muted-foreground"
        : status === "SCHEDULED"
          ? "bg-blue-500/15 text-blue-500"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        color
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ResultChip({ result }: { result: string }) {
  if (result === "NOT_FINISHED") return null;
  const color =
    result === "WIN"
      ? "bg-primary/15 text-primary"
      : result === "DRAW"
        ? "bg-amber-500/15 text-amber-500"
        : "bg-destructive/15 text-destructive";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
        color
      )}
    >
      {RESULT_LABELS[result] ?? result}
    </span>
  );
}
