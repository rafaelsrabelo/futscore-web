import { SlidersHorizontal, Users } from "lucide-react";
import { API_URL } from "@/lib/admin/api";
import type { AthletesResponse, Position } from "@/lib/types";
import { EmptyState } from "@/components/admin/page-header";
import { AthleteCard } from "./athlete-card";
import { PositionFilter } from "./position-filter";

type PositionFilterValue = Position | "ALL";

interface SearchParams {
  position?: string;
}

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

async function fetchAthletes(
  position: PositionFilterValue
): Promise<AthletesResponse> {
  const qs = position === "ALL" ? "" : `?position=${position}`;
  const res = await fetch(`${API_URL}/public/athletes${qs}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return { athletes: [], pagination: { page: 1, limit: 0, total: 0 } };
  }
  return res.json();
}

export default async function AtletasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { position: rawPosition } = await searchParams;
  const position = normalizePosition(rawPosition);
  const data = await fetchAthletes(position);

  return (
    <>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mt-3">
            Atletas cadastrados com filtros por posição. Clique em um card pra
            abrir o perfil completo.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
          disabled
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros avançados
          <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5">
            {data.pagination.total}
          </span>
        </button>
      </div>

      <PositionFilter active={position} />

      <div className="mt-6">
        {data.athletes.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="Nenhum atleta encontrado"
            description="Tente trocar o filtro de posição ou volte quando novos atletas forem cadastrados."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.athletes.map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
