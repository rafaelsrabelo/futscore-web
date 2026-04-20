import { redirect } from "next/navigation";
import { SlidersHorizontal, Users } from "lucide-react";
import { fetchAuthed } from "@/lib/admin/api";
import type { AdminAthletesResponse } from "@/lib/admin/types";
import type { Position } from "@/lib/types";
import { EmptyState } from "@/components/admin/page-header";
import { AthleteCard } from "./athlete-card";
import { Pagination } from "./pagination";
import { PositionFilter } from "./position-filter";
import { SearchInput } from "./search-input";

type PositionFilterValue = Position | "ALL";

interface SearchParams {
  position?: string;
  primaryPosition?: string;
  q?: string;
  page?: string;
}

const PAGE_SIZE = 20;

function normalizePosition(value: string | undefined): PositionFilterValue {
  const allowed: PositionFilterValue[] = [
    "ALL",
    "GOALKEEPER",
    "DEFENDER",
    "MIDFIELDER",
    "FORWARD",
  ];
  return allowed.includes(value as PositionFilterValue)
    ? (value as PositionFilterValue)
    : "ALL";
}

function buildApiQuery({
  q,
  position,
  page,
}: {
  q: string;
  position: PositionFilterValue;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (position !== "ALL") params.set("primaryPosition", position);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}

async function fetchAdminAthletes(query: string): Promise<AdminAthletesResponse | { error: number }> {
  const res = await fetchAuthed(`/admin/athletes?${query}`, {
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    return { error: res.status };
  }
  if (!res.ok) {
    console.error("[atletas] GET /admin/athletes not ok", res.status);
    return { items: [], page: 1, pageSize: PAGE_SIZE, total: 0, hasMore: false };
  }
  return res.json();
}

export default async function AtletasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // Aceita tanto `?position=` (interno, legado) quanto `?primaryPosition=` (API)
  const position = normalizePosition(sp.primaryPosition ?? sp.position);
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const apiQuery = buildApiQuery({ q, position, page });
  const result = await fetchAdminAthletes(apiQuery);

  if ("error" in result) {
    redirect("/admin/login");
  }

  // Params preservados ao trocar de página / filtrar (exclui `page` pra resetar ao mudar filtro)
  const baseSearch = new URLSearchParams();
  if (q) baseSearch.set("q", q);
  if (position !== "ALL") baseSearch.set("primaryPosition", position);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Atletas cadastrados. Use a busca, os filtros de posição e a
            paginação para navegar.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm hover:bg-accent/40 transition-colors disabled:opacity-60"
          disabled
          title="Painel de filtros avançados em construção"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros avançados
          <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">
            {result.total}
          </span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput defaultValue={q} />
        <PositionFilter active={position} />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={q ? "Nenhum atleta encontrado" : "Nenhum atleta cadastrado"}
          description={
            q
              ? `Nenhum resultado para "${q}". Tente ajustar a busca ou limpar os filtros.`
              : "Volte quando novos atletas forem cadastrados."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {result.items.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            hasMore={result.hasMore}
            baseSearch={baseSearch}
            pathname="/admin/atletas"
          />
        </>
      )}
    </>
  );
}
