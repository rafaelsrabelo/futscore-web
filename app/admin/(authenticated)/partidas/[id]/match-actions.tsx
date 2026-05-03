"use client";

import {
  Loader2,
  Pencil,
  Search,
  Target,
  Trash2,
  UserCog,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteMatchAction,
  linkMatchAthleteAction,
  updateMatchAction,
  updateMatchResultAction,
} from "@/lib/admin/actions";
import type {
  UpdateMatchInput,
  UpdateMatchResultInput,
} from "@/lib/admin/schemas";
import type { AdminMatchDetail } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const MODALITY_OPTIONS = [
  { value: "FUT_11", label: "Futebol 11" },
  { value: "FUT_7", label: "Futebol 7" },
  { value: "FUTSAL", label: "Futsal" },
] as const;

const CATEGORY_OPTIONS = [
  "U5",
  "U6",
  "U7",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U20",
  "AMATEUR",
  "PROFESSIONAL",
] as const;

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Agendada" },
  { value: "LIVE", label: "Ao vivo" },
  { value: "FINISHED", label: "Finalizada" },
  { value: "CANCELLED", label: "Cancelada" },
] as const;

const RESULT_OPTIONS = [
  { value: "WIN", label: "Vitória" },
  { value: "DRAW", label: "Empate" },
  { value: "LOSS", label: "Derrota" },
  { value: "NOT_FINISHED", label: "Não finalizada" },
] as const;

const PLAYER_POSITION_OPTIONS = [
  { value: "STARTER", label: "Titular" },
  { value: "SUBSTITUTE", label: "Reserva" },
] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function localInputToIso(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function trimOrUndefined(value: string): string | undefined {
  const t = value.trim();
  return t === "" ? undefined : t;
}

function trimOrNull(value: string): string | null {
  const t = value.trim();
  return t === "" ? null : t;
}

function intOrNull(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

type Mode = "edit" | "score" | "relink" | "delete" | null;

export function MatchActions({ match }: { match: AdminMatchDetail }) {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setMode("edit")}
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setMode("score")}
        >
          <Target className="w-3.5 h-3.5" />
          Corrigir placar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setMode("relink")}
        >
          <UserCog className="w-3.5 h-3.5" />
          Reatribuir atleta
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => setMode("delete")}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Excluir
        </Button>
      </div>

      <EditMatchDialog
        match={match}
        open={mode === "edit"}
        onOpenChange={(v) => setMode(v ? "edit" : null)}
      />
      <CorrectScoreDialog
        match={match}
        open={mode === "score"}
        onOpenChange={(v) => setMode(v ? "score" : null)}
      />
      <ReassignAthleteDialog
        matchId={match.id}
        currentAthleteId={match.athleteProfile.id}
        open={mode === "relink"}
        onOpenChange={(v) => setMode(v ? "relink" : null)}
      />
      <DeleteMatchAlert
        matchId={match.id}
        playsCount={match.playsCount}
        open={mode === "delete"}
        onOpenChange={(v) => setMode(v ? "delete" : null)}
      />
    </>
  );
}

// ---------- Edit (full) ----------

type Modality = "FUT_11" | "FUT_7" | "FUTSAL";
type Category = (typeof CATEGORY_OPTIONS)[number];
type MatchStatus = AdminMatchDetail["status"];
type MatchResult = AdminMatchDetail["result"];

type EditFormState = {
  date: string;
  adversaryTeam: string;
  modality: Modality | "";
  category: Category | "";
  location: string;
  status: MatchStatus | "";
  result: MatchResult | "";
  myTeamScore: string;
  adversaryScore: string;
  playerPosition: "STARTER" | "SUBSTITUTE" | "";
  performanceRating: string;
  matchDuration: string;
  approximateTime: string;
  observations: string;
  streamUrl: string;
  photoUrl: string;
  videoUrl: string;
  youtubeUrl: string;
};

function buildEditState(match: AdminMatchDetail): EditFormState {
  return {
    date: isoToLocalInput(match.date),
    adversaryTeam: match.adversaryTeam ?? "",
    modality: (match.modality as Modality | null | undefined) ?? "",
    category: (match.category as Category | null | undefined) ?? "",
    location: match.location ?? "",
    status: match.status,
    result: match.result,
    myTeamScore: match.myTeamScore != null ? String(match.myTeamScore) : "",
    adversaryScore:
      match.adversaryScore != null ? String(match.adversaryScore) : "",
    playerPosition: "",
    performanceRating: "",
    matchDuration: "",
    approximateTime: "",
    observations: match.observations ?? "",
    streamUrl: "",
    photoUrl: "",
    videoUrl: "",
    youtubeUrl: "",
  };
}

function EditMatchDialog({
  match,
  open,
  onOpenChange,
}: {
  match: AdminMatchDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<EditFormState>(() => buildEditState(match));

  function update<K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K]
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setState(buildEditState(match));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: UpdateMatchInput = {
      date: localInputToIso(state.date),
      adversaryTeam: trimOrUndefined(state.adversaryTeam),
      modality: state.modality === "" ? undefined : state.modality,
      category: state.category === "" ? undefined : state.category,
      location: trimOrUndefined(state.location),
      status: state.status === "" ? undefined : state.status,
      result: state.result === "" ? undefined : state.result,
      myTeamScore: intOrNull(state.myTeamScore),
      adversaryScore: intOrNull(state.adversaryScore),
      playerPosition:
        state.playerPosition === "" ? undefined : state.playerPosition,
      performanceRating:
        state.performanceRating === ""
          ? undefined
          : (intOrNull(state.performanceRating) ?? undefined),
      matchDuration:
        state.matchDuration === ""
          ? undefined
          : (intOrNull(state.matchDuration) ?? undefined),
      approximateTime:
        state.approximateTime === ""
          ? undefined
          : (intOrNull(state.approximateTime) ?? undefined),
      observations: trimOrNull(state.observations),
      streamUrl: trimOrNull(state.streamUrl) || undefined,
      photoUrl: trimOrNull(state.photoUrl) || undefined,
      videoUrl: trimOrNull(state.videoUrl) || undefined,
      youtubeUrl: trimOrNull(state.youtubeUrl) || undefined,
    };

    startTransition(async () => {
      const result = await updateMatchAction(match.id, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar partida</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Grid>
            <Field label="Data e hora" htmlFor="date">
              <Input
                id="date"
                type="datetime-local"
                value={state.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </Field>
            <Field label="Adversário" htmlFor="adversaryTeam">
              <Input
                id="adversaryTeam"
                value={state.adversaryTeam}
                onChange={(e) => update("adversaryTeam", e.target.value)}
              />
            </Field>
            <Field label="Modalidade">
              <Select
                value={state.modality || undefined}
                onValueChange={(v) =>
                  update("modality", v as EditFormState["modality"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MODALITY_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Categoria">
              <Select
                value={state.category || undefined}
                onValueChange={(v) =>
                  update("category", v as EditFormState["category"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Local" htmlFor="location">
              <Input
                id="location"
                value={state.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </Field>
            <Field label="Posição na partida">
              <Select
                value={state.playerPosition || undefined}
                onValueChange={(v) =>
                  update(
                    "playerPosition",
                    v as EditFormState["playerPosition"]
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_POSITION_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={state.status || undefined}
                onValueChange={(v) =>
                  update("status", v as EditFormState["status"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Resultado">
              <Select
                value={state.result || undefined}
                onValueChange={(v) =>
                  update("result", v as EditFormState["result"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {RESULT_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Placar do meu time" htmlFor="myTeamScore">
              <Input
                id="myTeamScore"
                type="number"
                min="0"
                value={state.myTeamScore}
                onChange={(e) => update("myTeamScore", e.target.value)}
              />
            </Field>
            <Field label="Placar adversário" htmlFor="adversaryScore">
              <Input
                id="adversaryScore"
                type="number"
                min="0"
                value={state.adversaryScore}
                onChange={(e) => update("adversaryScore", e.target.value)}
              />
            </Field>
            <Field label="Nota de performance (1-5)" htmlFor="performanceRating">
              <Input
                id="performanceRating"
                type="number"
                min="1"
                max="5"
                value={state.performanceRating}
                onChange={(e) =>
                  update("performanceRating", e.target.value)
                }
              />
            </Field>
            <Field label="Duração (min)" htmlFor="matchDuration">
              <Input
                id="matchDuration"
                type="number"
                min="0"
                max="240"
                value={state.matchDuration}
                onChange={(e) => update("matchDuration", e.target.value)}
              />
            </Field>
            <Field label="Tempo do atleta (min)" htmlFor="approximateTime">
              <Input
                id="approximateTime"
                type="number"
                min="0"
                max="240"
                value={state.approximateTime}
                onChange={(e) => update("approximateTime", e.target.value)}
              />
            </Field>
          </Grid>

          <Field label="Observações" htmlFor="observations">
            <textarea
              id="observations"
              rows={3}
              value={state.observations}
              onChange={(e) => update("observations", e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </Field>

          <Grid>
            <Field label="URL stream" htmlFor="streamUrl">
              <Input
                id="streamUrl"
                type="url"
                value={state.streamUrl}
                onChange={(e) => update("streamUrl", e.target.value)}
              />
            </Field>
            <Field label="URL foto" htmlFor="photoUrl">
              <Input
                id="photoUrl"
                type="url"
                value={state.photoUrl}
                onChange={(e) => update("photoUrl", e.target.value)}
              />
            </Field>
            <Field label="URL vídeo" htmlFor="videoUrl">
              <Input
                id="videoUrl"
                type="url"
                value={state.videoUrl}
                onChange={(e) => update("videoUrl", e.target.value)}
              />
            </Field>
            <Field label="URL YouTube" htmlFor="youtubeUrl">
              <Input
                id="youtubeUrl"
                type="url"
                value={state.youtubeUrl}
                onChange={(e) => update("youtubeUrl", e.target.value)}
              />
            </Field>
          </Grid>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Score-only ----------

function CorrectScoreDialog({
  match,
  open,
  onOpenChange,
}: {
  match: AdminMatchDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [myTeamScore, setMyTeamScore] = useState(
    match.myTeamScore != null ? String(match.myTeamScore) : ""
  );
  const [adversaryScore, setAdversaryScore] = useState(
    match.adversaryScore != null ? String(match.adversaryScore) : ""
  );
  const [status, setStatus] = useState<AdminMatchDetail["status"]>(match.status);

  function reset() {
    setMyTeamScore(match.myTeamScore != null ? String(match.myTeamScore) : "");
    setAdversaryScore(
      match.adversaryScore != null ? String(match.adversaryScore) : ""
    );
    setStatus(match.status);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload: UpdateMatchResultInput = {
      myTeamScore: myTeamScore === "" ? undefined : Number(myTeamScore),
      adversaryScore:
        adversaryScore === "" ? undefined : Number(adversaryScore),
      status,
    };

    startTransition(async () => {
      const result = await updateMatchResultAction(match.id, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Corrigir placar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Grid>
            <Field label="Meu time" htmlFor="cs-mts">
              <Input
                id="cs-mts"
                type="number"
                min="0"
                value={myTeamScore}
                onChange={(e) => setMyTeamScore(e.target.value)}
              />
            </Field>
            <Field label="Adversário" htmlFor="cs-as">
              <Input
                id="cs-as"
                type="number"
                min="0"
                value={adversaryScore}
                onChange={(e) => setAdversaryScore(e.target.value)}
              />
            </Field>
          </Grid>
          <Field label="Status">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as AdminMatchDetail["status"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <p className="text-xs text-muted-foreground">
            O resultado (vitória/empate/derrota) é derivado automaticamente
            pelo backend a partir dos placares.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Reassign athlete ----------

interface AthleteSearchHit {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string | null;
  currentClub?: string | null;
}

function ReassignAthleteDialog({
  matchId,
  currentAthleteId,
  open,
  onOpenChange,
}: {
  matchId: string;
  currentAthleteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AthleteSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AthleteSearchHit | null>(null);

  function reset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setError(null);
  }

  async function runSearch(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/admin/api/search?q=${encodeURIComponent(q)}&limit=8`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = (await res.json()) as { athletes?: AthleteSearchHit[] };
      setResults(data.athletes ?? []);
    } finally {
      setSearching(false);
    }
  }

  function handleConfirm() {
    if (!selected) return;
    if (selected.id === currentAthleteId) {
      setError("Esse já é o atleta atual da partida.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await linkMatchAthleteAction(matchId, selected.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reatribuir partida a outro atleta</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Field label="Buscar atleta">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Digite nome, nickname ou e-mail"
                className="pl-9"
              />
            </div>
          </Field>

          <div className="border border-border/60 rounded-lg max-h-72 overflow-y-auto">
            {searching && (
              <div className="p-3 text-xs text-muted-foreground">
                Buscando...
              </div>
            )}
            {!searching && query.trim().length >= 2 && results.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">
                Nenhum atleta encontrado.
              </div>
            )}
            {!searching && query.trim().length < 2 && (
              <div className="p-3 text-xs text-muted-foreground">
                Digite ao menos 2 caracteres para buscar.
              </div>
            )}
            {results.map((a) => {
              const active = selected?.id === a.id;
              const isCurrent = a.id === currentAthleteId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelected(a)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left border-b border-border/40 last:border-b-0 transition-colors",
                    active
                      ? "bg-primary/15"
                      : "hover:bg-accent/40"
                  )}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
                    {a.photoUrl ? (
                      <Image
                        src={a.photoUrl}
                        alt={a.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                        {a.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {a.position ?? "—"}
                      {a.currentClub ? ` · ${a.currentClub}` : ""}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] uppercase tracking-wider bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                      Atual
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={pending || !selected || selected.id === currentAthleteId}
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Reatribuindo..." : "Reatribuir"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Delete ----------

function DeleteMatchAlert({
  matchId,
  playsCount,
  open,
  onOpenChange,
}: {
  matchId: string;
  playsCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMatchAction(matchId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.push("/admin/partidas");
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta partida?</AlertDialogTitle>
          <AlertDialogDescription>
            A partida será removida permanentemente, junto com{" "}
            <strong>
              {playsCount} {playsCount === 1 ? "lance" : "lances"}
            </strong>{" "}
            e o scout vinculado. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Excluir partida
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------- Shared form helpers ----------

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs text-muted-foreground font-medium"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}
