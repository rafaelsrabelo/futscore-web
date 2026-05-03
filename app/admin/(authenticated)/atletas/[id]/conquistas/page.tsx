import { Trophy } from "lucide-react";
import { redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState } from "@/components/admin/page-header";
import { getAdminAthleteAchievements } from "@/lib/admin/athletes";
import type { AdminAchievementItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { Pagination } from "../../pagination";
import {
  AchievementRowActions,
  AddAchievementButton,
} from "./achievement-actions";

const PAGE_SIZE = 30;

const TYPE_LABELS: Record<string, string> = {
  COLLECTIVE: "Coletivo",
  INDIVIDUAL: "Individual",
};

interface SearchParams {
  page?: string;
}

export default async function AtletaConquistasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const apiQuery = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();

  const result = await getAdminAthleteAchievements(id, apiQuery);

  if (result.kind === "auth-error") redirect("/admin/login");

  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Conquistas"
        notFoundHint="Endpoint GET /admin/athletes/:id/achievements ainda não deployado (BE-25) ou atleta não encontrado."
      />
    );
  }

  const { data } = result;

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <AddAchievementButton athleteId={id} />
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-6 h-6" />}
          title="Nenhuma conquista registrada"
          description="Títulos coletivos e individuais do atleta aparecem aqui."
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.items.map((item) => (
              <AchievementRow
                key={item.id}
                item={item}
                athleteId={id}
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            pageSize={data.pageSize}
            total={data.total}
            hasMore={data.hasMore}
            baseSearch={new URLSearchParams()}
            pathname={`/admin/atletas/${id}/conquistas`}
          />
        </>
      )}
    </>
  );
}

function AchievementRow({
  item,
  athleteId,
}: {
  item: AdminAchievementItem;
  athleteId: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-card/40">
      <div className="flex flex-col items-center justify-center w-16 shrink-0">
        <Trophy className="w-4 h-4 text-muted-foreground mb-1" />
        <span className="text-lg font-bold leading-none bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
          {item.year}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{item.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {item.category}
        </div>
      </div>

      <TypeChip type={item.type} />
      <AchievementRowActions achievement={item} athleteId={athleteId} />
    </div>
  );
}

function TypeChip({ type }: { type: string }) {
  const color =
    type === "INDIVIDUAL"
      ? "bg-primary/15 text-primary"
      : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0",
        color
      )}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}
