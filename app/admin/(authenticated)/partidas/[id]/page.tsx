import {
  Activity,
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState } from "@/components/admin/page-header";
import { PlayCard } from "@/app/admin/(authenticated)/atletas/[id]/lances/play-card";
import {
  getAdminMatchDetail,
  getAdminMatchPlays,
} from "@/lib/admin/matches";
import type { AdminMatchDetail } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { MatchActions } from "./match-actions";

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

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

const MODALITY_LABELS: Record<string, string> = {
  FUT_11: "Futebol 11",
  FUT_7: "Futebol 7",
  FUTSAL: "Futsal",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export default async function PartidaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, plays] = await Promise.all([
    getAdminMatchDetail(id),
    getAdminMatchPlays(id),
  ]);

  if (detail.kind === "auth-error" || plays.kind === "auth-error") {
    redirect("/admin/login");
  }
  if (detail.kind === "not-found") notFound();

  return (
    <>
      <Link
        href="/admin/partidas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para partidas
      </Link>

      {detail.kind !== "ok" ? (
        <BackendErrorCard
          result={detail}
          resourceLabel="Partida"
          notFoundHint="Endpoint GET /admin/matches/:id ainda não deployado (BE-11)."
        />
      ) : (
        <>
          <MatchHeader match={detail.data} />

          <div className="mt-4">
            <MatchActions match={detail.data} />
          </div>

          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lances da partida
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clique em um card para ver o vídeo ou anexar mídia.
                </p>
              </div>
            </div>
            <PlaysSection result={plays} />
          </section>
        </>
      )}
    </>
  );
}

function MatchHeader({ match }: { match: AdminMatchDetail }) {
  const score =
    match.myTeamScore != null && match.adversaryScore != null
      ? `${match.myTeamScore} × ${match.adversaryScore}`
      : "—";
  const athleteName = match.athleteProfile.nickname || match.athleteProfile.name;

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <StatusChip status={match.status} />
          <ResultChip result={match.result} />
          {match.isFriendly && (
            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
              Amistoso
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {match.playsCount} {match.playsCount === 1 ? "lance" : "lances"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href={`/admin/atletas/${match.athleteProfile.id}`}
            className="relative w-14 h-14 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 shrink-0 hover:ring-primary/50 transition-colors"
          >
            {match.athleteProfile.profilePhoto ? (
              <Image
                src={match.athleteProfile.profilePhoto}
                alt={match.athleteProfile.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs font-semibold text-muted-foreground">
                {initialsOf(match.athleteProfile.name)}
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <Link
              href={`/admin/atletas/${match.athleteProfile.id}`}
              className="text-lg font-semibold truncate hover:underline"
            >
              {athleteName}
            </Link>
            <div className="text-xs text-muted-foreground">
              {POSITION_LABELS[match.athleteProfile.primaryPosition] ??
                match.athleteProfile.primaryPosition}
              {match.myTeam && (
                <> · {match.myTeam.acronym || match.myTeam.name}</>
              )}
            </div>
          </div>
        </div>

        <div className="text-center shrink-0">
          <div className="text-4xl font-bold tabular-nums bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            vs{" "}
            <span className="font-medium text-foreground">
              {match.adversaryTeam}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/60">
        <InfoTile icon={<Calendar className="w-3.5 h-3.5" />} label="Data">
          {formatDate(match.date)}
        </InfoTile>
        {match.location && (
          <InfoTile icon={<MapPin className="w-3.5 h-3.5" />} label="Local">
            {match.location}
          </InfoTile>
        )}
        {match.competition && (
          <InfoTile icon={<Trophy className="w-3.5 h-3.5" />} label="Competição">
            {match.competition.name}
          </InfoTile>
        )}
        {match.modality && (
          <InfoTile icon={<Activity className="w-3.5 h-3.5" />} label="Modalidade">
            {MODALITY_LABELS[match.modality] ?? match.modality}
            {match.category && <> · {match.category}</>}
          </InfoTile>
        )}
      </div>

      {match.observations && (
        <div className="pt-3 border-t border-border/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Observações
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {match.observations}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium break-words">{children}</div>
    </div>
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        color
      )}
    >
      {RESULT_LABELS[result] ?? result}
    </span>
  );
}

function PlaysSection({
  result,
}: {
  result: Awaited<ReturnType<typeof getAdminMatchPlays>>;
}) {
  if (result.kind === "auth-error") return null;
  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Lances da partida"
        notFoundHint="Endpoint GET /admin/matches/:id/plays ainda não deployado (BE-12)."
      />
    );
  }
  if (result.data.items.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-6 h-6" />}
        title="Sem lances registrados"
        description="Quando houver lances nesta partida, eles aparecem aqui."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {result.data.items.map((play) => (
        <PlayCard key={play.id} play={play} />
      ))}
    </div>
  );
}
