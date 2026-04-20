import { CalendarDays } from "lucide-react";
import { redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { getAdminMatches } from "@/lib/admin/matches";
import type { Position } from "@/lib/types";
import { Pagination } from "../atletas/pagination";
import { MatchRow } from "./match-row";
import { PositionFilter } from "./position-filter";
import { SearchInput } from "./search-input";

type PositionFilterValue = Position | "ALL";

interface SearchParams {
  page?: string;
  q?: string;
  primaryPosition?: string;
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

export default async function PartidasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const position = normalizePosition(sp.primaryPosition);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const apiQuery = buildApiQuery({ q, position, page });
  const result = await getAdminMatches(apiQuery);

  if (result.kind === "auth-error") redirect("/admin/login");

  const baseSearch = new URLSearchParams();
  if (q) baseSearch.set("q", q);
  if (position !== "ALL") baseSearch.set("primaryPosition", position);

  return (
    <>
      <PageHeader
        title="Partidas"
        description="Busca global de partidas. Filtre por atleta, posição ou palavra-chave."
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput defaultValue={q} />
        <PositionFilter active={position} />
      </div>

      {result.kind !== "ok" ? (
        <BackendErrorCard
          result={result}
          resourceLabel="Partidas"
          notFoundHint="Endpoint GET /admin/matches ainda não deployado (BE-10)."
        />
      ) : result.data.items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" />}
          title={q ? "Nenhuma partida encontrada" : "Nenhuma partida cadastrada"}
          description={
            q
              ? `Nenhum resultado para "${q}". Ajuste a busca ou limpe os filtros.`
              : "Quando houver partidas registradas, elas aparecem aqui."
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {result.data.items.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
          <Pagination
            page={result.data.page}
            pageSize={result.data.pageSize}
            total={result.data.total}
            hasMore={result.data.hasMore}
            baseSearch={baseSearch}
            pathname="/admin/partidas"
          />
        </>
      )}
    </>
  );
}
