import { Shield, Users } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState } from "@/components/admin/page-header";
import { getAdminAthleteTeamHistory } from "@/lib/admin/athletes";
import type { AdminTeamHistoryItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null): string {
  if (!iso) return "hoje";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function AtletaTimesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminAthleteTeamHistory(id);

  if (result.kind === "auth-error") redirect("/admin/login");

  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Histórico de times"
        notFoundHint="Endpoint GET /admin/athletes/:id/team-history ainda não deployado (BE-26) ou atleta não encontrado."
      />
    );
  }

  const { items, currentTeam } = result.data;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-6 h-6" />}
        title="Sem histórico de times"
        description="Quando o atleta passar por clubes ou seleções, aparece aqui."
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <TeamRow
          key={item.id}
          item={item}
          isCurrent={currentTeam?.id === item.id}
        />
      ))}
    </div>
  );
}

function TeamRow({
  item,
  isCurrent,
}: {
  item: AdminTeamHistoryItem;
  isCurrent: boolean;
}) {
  const { team } = item;
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border transition-colors",
        isCurrent
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card/40"
      )}
    >
      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted ring-1 ring-border shrink-0">
        {team.shieldPhoto ? (
          <Image
            src={team.shieldPhoto}
            alt={team.name}
            fill
            sizes="48px"
            className="object-contain"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            <Shield className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{team.name}</span>
          {team.acronym && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {team.acronym}
            </span>
          )}
          {isCurrent && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 rounded px-1.5 py-0.5">
              Atual
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatDate(item.startDate)} — {formatDate(item.endDate)}
        </div>
      </div>
    </div>
  );
}
