import { AlertTriangle, History, Pencil, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeClassification } from "@/lib/admin/classification";
import { getAdminAthleteClassificationHistory } from "@/lib/admin/athletes";
import type {
  AthleteClassification,
  ClassificationLog,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { ClassifyAthleteDialog } from "../classify-athlete-dialog";

const HISTORY_PAGE_SIZE = 10;

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function ClassificationSection({
  athleteId,
  athleteName,
  current,
}: {
  athleteId: string;
  athleteName: string;
  current: AthleteClassification | null;
}) {
  const display = describeClassification(current);
  const result = await getAdminAthleteClassificationHistory(
    athleteId,
    `pageSize=${HISTORY_PAGE_SIZE}`,
  );

  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Tags className="w-3.5 h-3.5" />
            Classificação
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                display.badgeClass,
              )}
            >
              {display.label}
            </span>
          </div>
        </div>
        <ClassifyAthleteDialog
          athleteId={athleteId}
          athleteName={athleteName}
          current={current}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              {current ? "Alterar classificação" : "Classificar"}
            </Button>
          }
        />
      </div>

      <div className="mt-5 pt-4 border-t border-border/40">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
          <History className="w-3 h-3" />
          Histórico
        </h3>
        <HistoryBody result={result} />
      </div>
    </section>
  );
}

function HistoryBody({
  result,
}: {
  result: Awaited<ReturnType<typeof getAdminAthleteClassificationHistory>>;
}) {
  if (result.kind === "ok") {
    if (result.data.items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          Nenhuma classificação registrada ainda.
        </p>
      );
    }
    return (
      <ol className="space-y-3">
        {result.data.items.map((item) => (
          <HistoryItem key={item.id} log={item} />
        ))}
        {result.data.hasMore && (
          <li className="text-[11px] text-muted-foreground pt-1">
            Mostrando os {result.data.items.length} mais recentes de{" "}
            {result.data.total}.
          </li>
        )}
      </ol>
    );
  }

  if (result.kind === "not-found") {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma classificação registrada ainda.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Não foi possível carregar o histórico de classificação. Tente recarregar
        a página.
      </span>
    </div>
  );
}

function HistoryItem({ log }: { log: ClassificationLog }) {
  const display = describeClassification(log.classification);
  return (
    <li className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            display.badgeClass,
          )}
        >
          {log.classification ? display.label : "Removida"}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {formatDateTime(log.createdAt)}
        </span>
      </div>
      {log.comment && (
        <p className="text-sm text-foreground/90 mt-2 leading-relaxed">
          {log.comment}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground mt-2">
        Por <span className="font-medium">{log.classifiedBy.name}</span>
      </p>
    </li>
  );
}
