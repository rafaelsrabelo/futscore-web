import { redirect } from "next/navigation";
import { AlertTriangle, SlidersHorizontal, Users } from "lucide-react";
import { API_URL, fetchAuthed } from "@/lib/admin/api";
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

type FetchResult =
  | { kind: "ok"; data: AdminAthletesResponse }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

async function fetchAdminAthletes(query: string): Promise<FetchResult> {
  const path = `/admin/athletes?${query}`;
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[atletas] network error", { url, err });
    return { kind: "network-error", url };
  }

  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[atletas] GET /admin/athletes not ok", {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  const data = (await res.json()) as AdminAthletesResponse;
  return { kind: "ok", data };
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

  if (result.kind === "auth-error") {
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
            {result.kind === "ok" ? result.data.total : 0}
          </span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput defaultValue={q} />
        <PositionFilter active={position} />
      </div>

      {result.kind !== "ok" ? (
        <BackendError result={result} />
      ) : result.data.items.length === 0 ? (
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
            {result.data.items.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
          <Pagination
            page={result.data.page}
            pageSize={result.data.pageSize}
            total={result.data.total}
            hasMore={result.data.hasMore}
            baseSearch={baseSearch}
            pathname="/admin/atletas"
          />
        </>
      )}
    </>
  );
}

function BackendError({
  result,
}: {
  result: Extract<FetchResult, { kind: "http-error" } | { kind: "network-error" }>;
}) {
  const isHttp = result.kind === "http-error";
  const title = isHttp
    ? `Falha ao carregar atletas (HTTP ${result.status})`
    : "Falha ao conectar com a API";
  const hint =
    isHttp && result.status === 404
      ? "A rota GET /admin/athletes respondeu 404. Confirme se o deploy do BE-07 subiu em produção."
      : isHttp && result.status >= 500
        ? "A API retornou erro interno. Pode ser cold start do Render (free tier dorme após 15min) — tente de novo em alguns segundos."
        : "Verifique a variável de ambiente API_URL e se o backend está acessível.";

  return (
    <div className="border-2 border-dashed border-destructive/40 rounded-xl bg-destructive/5 py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3 text-destructive">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
      <code className="mt-3 text-[11px] text-muted-foreground bg-card/60 border border-border/60 rounded px-2 py-1 break-all max-w-full">
        {result.url}
      </code>
    </div>
  );
}
