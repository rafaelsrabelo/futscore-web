"use client";

import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type {
  GlobalSearchAthlete,
  GlobalSearchMatch,
  GlobalSearchResponse,
} from "@/lib/admin/types";

interface ErrorState {
  status?: number;
  message: string;
}

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMatchDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // ⌘K / Ctrl+K
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Reset state ao fechar
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      setQuery("");
      setResult(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/admin/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            message?: string;
          } | null;
          setError({
            status: res.status,
            message: data?.message ?? `Falha (HTTP ${res.status}).`,
          });
          setResult(null);
        } else {
          const data = (await res.json()) as GlobalSearchResponse;
          setResult(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("[global-search] client error", err);
        setError({ message: "Falha de rede." });
        setResult(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
    };
  }, [query, open]);

  function handleNavigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  const showEmptyPrompt = query.trim().length < 2;
  const totalResults =
    (result?.athletes.length ?? 0) + (result?.matches.length ?? 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/30 text-muted-foreground",
          "hover:bg-accent/40 hover:text-foreground transition-colors",
          "px-3 py-1.5 text-sm",
          "w-full md:w-80"
        )}
        aria-label="Abrir busca global"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="truncate">Buscar atletas ou partidas...</span>
        <kbd className="ml-auto hidden md:inline-flex items-center gap-0.5 rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] font-semibold">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="p-0 gap-0 max-w-2xl overflow-hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Busca global</DialogTitle>

          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por atleta ou partida..."
              className="flex-1 bg-transparent outline-hidden text-sm placeholder:text-muted-foreground"
            />
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {showEmptyPrompt && <EmptyPrompt />}
            {!showEmptyPrompt && error && <ErrorState {...error} />}
            {!showEmptyPrompt && !error && result && totalResults === 0 && (
              <NoResults query={query} />
            )}
            {!showEmptyPrompt && !error && result && totalResults > 0 && (
              <Results
                result={result}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyPrompt() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Digite pelo menos 2 caracteres pra começar.
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Nenhum resultado para <span className="font-medium">&ldquo;{query}&rdquo;</span>.
    </div>
  );
}

function ErrorState({ status, message }: ErrorState) {
  return (
    <div className="p-10 flex flex-col items-center text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <p className="text-sm font-medium">Busca indisponível</p>
      <p className="text-xs text-muted-foreground max-w-sm">
        {message}
        {status != null && ` (HTTP ${status})`}
      </p>
    </div>
  );
}

function Results({
  result,
  onNavigate,
}: {
  result: GlobalSearchResponse;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="py-2">
      {result.athletes.length > 0 && (
        <Group icon={<Users className="w-3.5 h-3.5" />} title="Atletas">
          {result.athletes.map((athlete) => (
            <AthleteRow
              key={athlete.id}
              athlete={athlete}
              onNavigate={onNavigate}
            />
          ))}
        </Group>
      )}
      {result.matches.length > 0 && (
        <Group icon={<Calendar className="w-3.5 h-3.5" />} title="Partidas">
          {result.matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </Group>
      )}
    </div>
  );
}

function Group({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pb-2">
      <div className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function AthleteRow({
  athlete,
  onNavigate,
}: {
  athlete: GlobalSearchAthlete;
  onNavigate: (href: string) => void;
}) {
  const href = `/admin/atletas/${athlete.id}`;
  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-accent/40 transition-colors text-left"
    >
      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted ring-1 ring-border shrink-0">
        {athlete.photoUrl ? (
          <Image
            src={athlete.photoUrl}
            alt={athlete.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[10px] font-semibold text-muted-foreground">
            {initialsOf(athlete.name)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{athlete.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {[
            athlete.position ? POSITION_LABELS[athlete.position] : null,
            athlete.currentClub,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function MatchRow({ match }: { match: GlobalSearchMatch }) {
  const score =
    match.myTeamScore != null && match.adversaryScore != null
      ? `${match.myTeamScore} × ${match.adversaryScore}`
      : "—";
  return (
    <div
      className="w-full flex items-center gap-3 px-4 py-2 opacity-80 cursor-not-allowed text-left"
      title="Detalhe de partida em breve"
    >
      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted ring-1 ring-border shrink-0">
        {match.athlete.photoUrl ? (
          <Image
            src={match.athlete.photoUrl}
            alt={match.athlete.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-[10px] font-semibold text-muted-foreground">
            {initialsOf(match.athlete.name)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {match.athlete.name} vs {match.adversaryTeam}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {formatMatchDate(match.date)} · {score}
        </div>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
        EM BREVE
      </span>
    </div>
  );
}
