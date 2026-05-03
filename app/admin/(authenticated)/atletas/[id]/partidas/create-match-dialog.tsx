"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  TeamPicker,
  type TeamPickerOption,
} from "@/components/admin/team-picker";
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
import { createMatchAction } from "@/lib/admin/actions";
import type { CreateMatchInput } from "@/lib/admin/schemas";

type Modality = "FUT_11" | "FUT_7" | "FUTSAL";
type Category =
  | "U5"
  | "U6"
  | "U7"
  | "U8"
  | "U9"
  | "U10"
  | "U11"
  | "U12"
  | "U13"
  | "U14"
  | "U15"
  | "U16"
  | "U17"
  | "U18"
  | "U19"
  | "U20"
  | "AMATEUR"
  | "PROFESSIONAL";
type Status = "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED";
type PlayerPosition = "STARTER" | "SUBSTITUTE";

const MODALITY_OPTIONS: { value: Modality; label: string }[] = [
  { value: "FUT_11", label: "Futebol 11" },
  { value: "FUT_7", label: "Futebol 7" },
  { value: "FUTSAL", label: "Futsal" },
];

const CATEGORY_OPTIONS: Category[] = [
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
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "SCHEDULED", label: "Agendada" },
  { value: "LIVE", label: "Ao vivo" },
  { value: "FINISHED", label: "Finalizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const POSITION_OPTIONS: { value: PlayerPosition; label: string }[] = [
  { value: "STARTER", label: "Titular" },
  { value: "SUBSTITUTE", label: "Reserva" },
];

interface FormState {
  myTeam: TeamPickerOption | null;
  adversaryTeam: string;
  date: string; // datetime-local
  location: string;
  modality: Modality | "";
  category: Category | "";
  status: Status;
  myTeamScore: string;
  adversaryScore: string;
  playerPosition: PlayerPosition | "";
  observations: string;
  performanceRating: string;
}

function emptyState(): FormState {
  return {
    myTeam: null,
    adversaryTeam: "",
    date: "",
    location: "",
    modality: "",
    category: "",
    status: "SCHEDULED",
    myTeamScore: "",
    adversaryScore: "",
    playerPosition: "",
    observations: "",
    performanceRating: "",
  };
}

function intOrUndefined(value: string): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && Number.isInteger(n) ? n : undefined;
}

function trimOrUndefined(value: string): string | undefined {
  const t = value.trim();
  return t === "" ? undefined : t;
}

export function CreateMatchDialog({ athleteId }: { athleteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(emptyState);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setState(emptyState());
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!state.myTeam) {
      setError("Selecione o time do atleta.");
      return;
    }
    if (!state.adversaryTeam.trim()) {
      setError("Informe o adversário.");
      return;
    }
    if (!state.date) {
      setError("Informe a data e hora.");
      return;
    }
    const dateIso = (() => {
      const d = new Date(state.date);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    })();
    if (!dateIso) {
      setError("Data inválida.");
      return;
    }

    const payload: CreateMatchInput = {
      athleteProfileId: athleteId,
      myTeamId: state.myTeam.id,
      adversaryTeam: state.adversaryTeam.trim(),
      date: dateIso,
      modality: state.modality === "" ? undefined : state.modality,
      category: state.category === "" ? undefined : state.category,
      location: trimOrUndefined(state.location),
      status: state.status,
      myTeamScore: intOrUndefined(state.myTeamScore),
      adversaryScore: intOrUndefined(state.adversaryScore),
      playerPosition:
        state.playerPosition === "" ? undefined : state.playerPosition,
      observations: trimOrUndefined(state.observations),
      performanceRating: intOrUndefined(state.performanceRating),
    };

    startTransition(async () => {
      const result = await createMatchAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      if (result.id) router.push(`/admin/partidas/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <Button
        type="button"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Adicionar partida
      </Button>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova partida</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Time do atleta">
            <TeamPicker
              athleteId={athleteId}
              selected={state.myTeam}
              onChange={(t) => update("myTeam", t)}
              placeholder="Buscar time deste atleta"
            />
          </Field>

          <Grid>
            <Field label="Adversário" htmlFor="cm-adv">
              <Input
                id="cm-adv"
                value={state.adversaryTeam}
                onChange={(e) => update("adversaryTeam", e.target.value)}
                placeholder="Rival FC"
              />
            </Field>
            <Field label="Data e hora" htmlFor="cm-date">
              <Input
                id="cm-date"
                type="datetime-local"
                value={state.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </Field>
            <Field label="Local" htmlFor="cm-loc">
              <Input
                id="cm-loc"
                value={state.location}
                onChange={(e) => update("location", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <Select
                value={state.status}
                onValueChange={(v) => update("status", v as Status)}
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
            <Field label="Modalidade">
              <Select
                value={state.modality || undefined}
                onValueChange={(v) => update("modality", v as Modality)}
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
                onValueChange={(v) => update("category", v as Category)}
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
            <Field label="Posição na partida">
              <Select
                value={state.playerPosition || undefined}
                onValueChange={(v) =>
                  update("playerPosition", v as PlayerPosition)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Nota (1-5)" htmlFor="cm-rating">
              <Input
                id="cm-rating"
                type="number"
                min="1"
                max="5"
                value={state.performanceRating}
                onChange={(e) =>
                  update("performanceRating", e.target.value)
                }
              />
            </Field>
            <Field label="Placar do meu time" htmlFor="cm-mts">
              <Input
                id="cm-mts"
                type="number"
                min="0"
                value={state.myTeamScore}
                onChange={(e) => update("myTeamScore", e.target.value)}
              />
            </Field>
            <Field label="Placar adversário" htmlFor="cm-as">
              <Input
                id="cm-as"
                type="number"
                min="0"
                value={state.adversaryScore}
                onChange={(e) => update("adversaryScore", e.target.value)}
              />
            </Field>
          </Grid>

          <Field label="Observações" htmlFor="cm-obs">
            <textarea
              id="cm-obs"
              rows={3}
              value={state.observations}
              onChange={(e) => update("observations", e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </Field>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Criando..." : "Criar partida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
