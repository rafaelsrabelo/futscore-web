"use client";

import { Loader2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  TeamPicker,
  type TeamPickerOption,
} from "@/components/admin/team-picker";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTeamHistoryAction,
  deleteTeamHistoryAction,
  updateTeamHistoryAction,
} from "@/lib/admin/actions";
import type {
  CreateTeamHistoryInput,
  UpdateTeamHistoryInput,
} from "@/lib/admin/schemas";
import type { AdminTeamHistoryItem } from "@/lib/admin/types";

interface FormState {
  team: TeamPickerOption | null;
  startDate: string; // datetime-local
  endDate: string; // datetime-local
  current: boolean; // when true, endDate is null
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function emptyState(): FormState {
  return { team: null, startDate: "", endDate: "", current: true };
}

function fromEntry(entry: AdminTeamHistoryItem): FormState {
  return {
    team: {
      id: entry.team.id,
      name: entry.team.name,
      acronym: entry.team.acronym,
      shieldPhoto: entry.team.shieldPhoto,
      isPrincipal: false,
    },
    startDate: isoToLocalInput(entry.startDate),
    endDate: isoToLocalInput(entry.endDate),
    current: entry.endDate === null,
  };
}

function validate(state: FormState):
  | { ok: true; startDateIso: string; endDateIso: string | null }
  | { ok: false; error: string } {
  if (!state.team) {
    return { ok: false, error: "Selecione um time." };
  }
  const startIso = localInputToIso(state.startDate);
  if (!startIso) {
    return { ok: false, error: "Informe a data de início." };
  }
  let endIso: string | null = null;
  if (!state.current) {
    endIso = localInputToIso(state.endDate);
    if (!endIso) {
      return {
        ok: false,
        error: "Informe a data de término ou marque como time atual.",
      };
    }
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      return {
        ok: false,
        error: "Data de término deve ser posterior à data de início.",
      };
    }
  }
  return { ok: true, startDateIso: startIso, endDateIso: endIso };
}

export function AddTeamHistoryButton({ athleteId }: { athleteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(emptyState);

  function reset() {
    setState(emptyState());
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const v = validate(state);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    const payload: CreateTeamHistoryInput = {
      teamId: state.team!.id,
      startDate: v.startDateIso,
      endDate: v.endDateIso,
    };
    startTransition(async () => {
      const result = await createTeamHistoryAction(athleteId, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
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
        Adicionar passagem
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova passagem por time</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <TeamHistoryFields
            athleteId={athleteId}
            state={state}
            onChange={(next) => setState((prev) => ({ ...prev, ...next }))}
          />

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
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeamHistoryRowActions({
  entry,
  athleteId,
}: {
  entry: AdminTeamHistoryItem;
  athleteId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ações da passagem"
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => setEditOpen(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTeamHistoryDialog
        entry={entry}
        athleteId={athleteId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteTeamHistoryAlert
        entry={entry}
        athleteId={athleteId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function EditTeamHistoryDialog({
  entry,
  athleteId,
  open,
  onOpenChange,
}: {
  entry: AdminTeamHistoryItem;
  athleteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(() => fromEntry(entry));

  function reset() {
    setState(fromEntry(entry));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const v = validate(state);
    if (!v.ok) {
      setError(v.error);
      return;
    }
    const payload: UpdateTeamHistoryInput = {
      teamId: state.team!.id,
      startDate: v.startDateIso,
      endDate: v.endDateIso,
    };
    startTransition(async () => {
      const result = await updateTeamHistoryAction(
        entry.id,
        athleteId,
        payload
      );
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
          <DialogTitle>Editar passagem</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <TeamHistoryFields
            athleteId={athleteId}
            state={state}
            onChange={(next) => setState((prev) => ({ ...prev, ...next }))}
          />

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

function DeleteTeamHistoryAlert({
  entry,
  athleteId,
  open,
  onOpenChange,
}: {
  entry: AdminTeamHistoryItem;
  athleteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTeamHistoryAction(entry.id, athleteId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={pending ? undefined : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta passagem?</AlertDialogTitle>
          <AlertDialogDescription>
            A passagem por <strong>{entry.team.name}</strong> será removida do
            histórico do atleta. Essa ação não pode ser desfeita.
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
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TeamHistoryFields({
  athleteId,
  state,
  onChange,
}: {
  athleteId: string;
  state: FormState;
  onChange: (next: Partial<FormState>) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">
          Time
        </Label>
        <TeamPicker
          athleteId={athleteId}
          selected={state.team}
          onChange={(team) => onChange({ team })}
          placeholder="Buscar time"
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="th-start"
          className="text-xs text-muted-foreground font-medium"
        >
          Início
        </Label>
        <Input
          id="th-start"
          type="datetime-local"
          value={state.startDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
        />
      </div>
      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={state.current}
          onChange={(e) =>
            onChange({
              current: e.target.checked,
              endDate: e.target.checked ? "" : state.endDate,
            })
          }
          className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
        />
        <div className="text-sm leading-tight">
          <div className="font-medium">É o time atual</div>
          <div className="text-xs text-muted-foreground">
            Marque para deixar `endDate` em branco.
          </div>
        </div>
      </label>
      {!state.current && (
        <div className="space-y-1.5">
          <Label
            htmlFor="th-end"
            className="text-xs text-muted-foreground font-medium"
          >
            Término
          </Label>
          <Input
            id="th-end"
            type="datetime-local"
            value={state.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </div>
      )}
    </>
  );
}
