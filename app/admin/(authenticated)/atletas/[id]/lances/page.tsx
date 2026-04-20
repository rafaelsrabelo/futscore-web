import { Activity } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState } from "@/components/admin/page-header";
import {
  getAdminAthleteMatches,
  getAdminAthletePlays,
} from "@/lib/admin/athletes";
import { cn } from "@/lib/utils";
import { Pagination } from "../../pagination";
import { AddPlayDialog, type MatchOption } from "./add-play-dialog";
import { PlayCard } from "./play-card";

const PAGE_SIZE = 24;

interface SearchParams {
  page?: string;
  hasVideo?: string;
  playType?: string;
}

function buildQuery(sp: SearchParams): { apiQuery: string; base: URLSearchParams } {
  const api = new URLSearchParams();
  const base = new URLSearchParams();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  api.set("page", String(page));
  api.set("pageSize", String(PAGE_SIZE));
  if (sp.hasVideo === "true" || sp.hasVideo === "false") {
    api.set("hasVideo", sp.hasVideo);
    base.set("hasVideo", sp.hasVideo);
  }
  if (sp.playType) {
    api.set("playType", sp.playType);
    base.set("playType", sp.playType);
  }
  return { apiQuery: api.toString(), base };
}

async function fetchMatchOptions(athleteId: string): Promise<MatchOption[]> {
  const res = await getAdminAthleteMatches(
    athleteId,
    new URLSearchParams({ page: "1", pageSize: "50" }).toString()
  );
  if (res.kind !== "ok") return [];
  return res.data.items.map((m) => ({
    id: m.id,
    date: m.date,
    adversaryTeam: m.adversaryTeam,
  }));
}

export default async function AtletaLancesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { apiQuery, base } = buildQuery(sp);

  const [result, matches] = await Promise.all([
    getAdminAthletePlays(id, apiQuery),
    fetchMatchOptions(id),
  ]);

  if (result.kind === "auth-error") redirect("/admin/login");

  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Lances"
        notFoundHint="Endpoint GET /admin/athletes/:id/plays ainda não deployado (BE-24) ou atleta não encontrado."
      />
    );
  }

  const { data } = result;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <LancesFilters current={sp} pathname={`/admin/atletas/${id}/lances`} />
        <AddPlayDialog matches={matches} />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" />}
          title="Nenhum lance encontrado"
          description={
            sp.hasVideo === "false"
              ? "Todos os lances deste atleta já têm vídeo anexado."
              : "Quando o atleta tiver lances registrados, eles aparecem aqui."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((play) => (
              <PlayCard key={play.id} play={play} />
            ))}
          </div>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            hasMore={data.hasMore}
            baseSearch={base}
            pathname={`/admin/atletas/${id}/lances`}
          />
        </>
      )}
    </>
  );
}

function LancesFilters({
  current,
  pathname,
}: {
  current: SearchParams;
  pathname: string;
}) {
  const items: { value: string; label: string }[] = [
    { value: "", label: "Todos" },
    { value: "true", label: "Com vídeo" },
    { value: "false", label: "Sem vídeo" },
  ];
  const active = current.hasVideo ?? "";

  function hrefFor(value: string): string {
    const next = new URLSearchParams();
    if (value) next.set("hasVideo", value);
    if (current.playType) next.set("playType", current.playType);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/40 p-1 w-fit">
      {items.map((item) => {
        const isActive = item.value === active;
        return (
          <Link
            key={item.value || "all"}
            href={hrefFor(item.value)}
            scroll={false}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

