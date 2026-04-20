import { AlertTriangle, Calendar, ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAthleteMatches } from "@/lib/admin/athletes";
import type { AdminMatchListItem } from "@/lib/admin/types";
import { EmptyState } from "@/components/admin/page-header";
import { cn } from "@/lib/utils";
import { Pagination } from "../../pagination";

const PAGE_SIZE = 20;

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
  NOT_FINISHED: "—",
};

interface SearchParams {
  page?: string;
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

export default async function AtletaPartidasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();

  const result = await getAdminAthleteMatches(id, query);

  if (result.kind === "auth-error") redirect("/admin/login");

  if (result.kind === "not-found" || result.kind === "http-error" || result.kind === "network-error") {
    return <MatchesBackendError result={result} />;
  }

  const { data } = result;

  if (data.items.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="w-6 h-6" />}
        title="Nenhuma partida registrada"
        description="Quando o atleta tiver partidas cadastradas, elas aparecem aqui."
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {data.items.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        hasMore={data.hasMore}
        baseSearch={new URLSearchParams()}
        pathname={`/admin/atletas/${id}/partidas`}
      />
    </>
  );
}

function MatchRow({ match }: { match: AdminMatchListItem }) {
  const score =
    match.myTeamScore != null && match.adversaryScore != null
      ? `${match.myTeamScore} × ${match.adversaryScore}`
      : "—";

  return (
    <Link
      href={`/admin/partidas/${match.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/60 transition-colors"
    >
      <div className="flex flex-col items-center justify-center w-14 shrink-0">
        <Calendar className="w-4 h-4 text-muted-foreground mb-1" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
          {formatDate(match.date)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          vs {match.adversaryTeam}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {match.competition?.name ?? "Amistoso"} ·{" "}
          {match.playsCount} {match.playsCount === 1 ? "lance" : "lances"}
        </div>
      </div>

      <div className="text-lg font-bold tabular-nums shrink-0">{score}</div>

      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
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

function MatchesBackendError({
  result,
}: {
  result: {
    kind: "not-found" | "http-error" | "network-error";
    status?: number;
    url?: string;
  };
}) {
  const title =
    result.kind === "network-error"
      ? "Falha ao conectar com a API"
      : `Falha ao carregar partidas${
          result.status ? ` (HTTP ${result.status})` : ""
        }`;
  const hint =
    result.kind === "not-found" || result.status === 404
      ? "Endpoint GET /admin/athletes/:id/matches ainda não deployado (BE-09)."
      : result.status && result.status >= 500
        ? "Erro interno da API. Pode ser cold start — tente novamente."
        : "Verifique a variável API_URL e se o backend está acessível.";

  return (
    <div className="border-2 border-dashed border-destructive/40 rounded-xl bg-destructive/5 py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3 text-destructive">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
      {result.url && (
        <code className="mt-3 text-[11px] text-muted-foreground bg-card/60 border border-border/60 rounded px-2 py-1 break-all max-w-full">
          {result.url}
        </code>
      )}
    </div>
  );
}
