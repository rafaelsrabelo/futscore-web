import { Activity, Calendar, Play, Star, VideoOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState } from "@/components/admin/page-header";
import { getAdminAthletePlays } from "@/lib/admin/athletes";
import type { AdminPlayItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { Pagination } from "../../pagination";

const PAGE_SIZE = 24;

const PLAY_TYPE_LABELS: Record<string, string> = {
  GOAL: "Gol",
  ASSIST: "Assistência",
  DIFFICULT_SAVE: "Defesa difícil",
  EASY_SAVE: "Defesa fácil",
  PASS: "Passe",
  KEY_PASS: "Passe decisivo",
  DRIBBLE: "Drible",
  TACKLE: "Desarme",
  INTERCEPTION: "Interceptação",
  FOUL_COMMITTED: "Falta cometida",
  FOUL_RECEIVED: "Falta sofrida",
  YELLOW_CARD: "Cartão amarelo",
  RED_CARD: "Cartão vermelho",
  HEADER: "Cabeceio",
  SHOT_ON_TARGET: "Finalização no alvo",
  SHOT_OFF_TARGET: "Finalização fora",
  BEST_MOMENTS: "Melhores momentos",
  ANTICIPATION: "Antecipação",
  LONG_PASS: "Lançamento",
  FREE_KICK: "Falta direta",
  CROSS: "Cruzamento",
  CORNER_KICK: "Escanteio",
  PENALTY: "Pênalti",
  PENALTY_SAVE: "Defesa de pênalti",
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  PHYSICAL: "Físico",
  TACTICAL: "Tático",
  TECHNICAL: "Técnico",
  MENTAL: "Mental",
};

interface SearchParams {
  page?: string;
  hasVideo?: string;
  playType?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
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
  const result = await getAdminAthletePlays(id, apiQuery);

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
      <LancesFilters current={sp} pathname={`/admin/atletas/${id}/lances`} />

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
    <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card/40 p-1 w-fit mb-4">
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

function PlayCard({ play }: { play: AdminPlayItem }) {
  const media = play.thumbnailUrl ?? play.photoUrl;
  const label = PLAY_TYPE_LABELS[play.playType] ?? play.playType;

  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/50 hover:border-primary/40 transition-colors">
      <div className="relative aspect-video bg-muted/60">
        {media ? (
          <Image
            src={media}
            alt={label}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <VideoOff className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Sem vídeo</span>
          </div>
        )}
        {play.videoUrl && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-4 h-4 text-black ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="rounded-md bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 backdrop-blur-sm">
            {label}
          </span>
        </div>
        {play.rating != null && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {play.rating}
          </div>
        )}
      </div>

      <div className="p-3">
        {play.match ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {formatDate(play.match.date)} · vs {play.match.adversaryTeam}
            </span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">Sem partida vinculada</div>
        )}

        {play.classifications.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {play.classifications.map((c) => (
              <span
                key={c}
                className="text-[9px] font-medium uppercase tracking-wider rounded bg-muted text-muted-foreground px-1.5 py-0.5"
              >
                {CLASSIFICATION_LABELS[c] ?? c}
              </span>
            ))}
          </div>
        )}

        {play.observations && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {play.observations}
          </p>
        )}
      </div>
    </article>
  );
}
