"use client";

import { Loader2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAchievementAction,
  deleteAchievementAction,
  updateAchievementAction,
} from "@/lib/admin/actions";
import type { AdminAchievementItem } from "@/lib/admin/types";

type AchievementType = "COLLECTIVE" | "INDIVIDUAL";

const TYPE_OPTIONS: { value: AchievementType; label: string }[] = [
  { value: "COLLECTIVE", label: "Coletiva (com o time)" },
  { value: "INDIVIDUAL", label: "Individual (prêmio pessoal)" },
];

interface FormState {
  name: string;
  category: string;
  year: string;
  type: AchievementType;
}

const CURRENT_YEAR = new Date().getFullYear();

function emptyState(): FormState {
  return {
    name: "",
    category: "",
    year: String(CURRENT_YEAR),
    type: "COLLECTIVE",
  };
}

function fromAchievement(item: AdminAchievementItem): FormState {
  return {
    name: item.name,
    category: item.category,
    year: String(item.year),
    type: item.type,
  };
}

function parsePayload(state: FormState):
  | { ok: true; data: { name: string; category: string; year: number; type: AchievementType } }
  | { ok: false; error: string } {
  const name = state.name.trim();
  const category = state.category.trim();
  if (!name) return { ok: false, error: "Informe o nome da conquista." };
  if (!category) return { ok: false, error: "Informe a categoria." };
  const year = Number(state.year);
  if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR + 1) {
    return {
      ok: false,
      error: `Ano deve ser entre 1900 e ${CURRENT_YEAR + 1}.`,
    };
  }
  return { ok: true, data: { name, category, year, type: state.type } };
}

export function AddAchievementButton({ athleteId }: { athleteId: string }) {
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
    const parsed = parsePayload(state);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await createAchievementAction(athleteId, parsed.data);
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
        Adicionar conquista
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conquista</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <AchievementFormFields
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

export function AchievementRowActions({
  achievement,
  athleteId,
}: {
  achievement: AdminAchievementItem;
  athleteId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ações da conquista"
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

      <EditAchievementDialog
        achievement={achievement}
        athleteId={athleteId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteAchievementAlert
        achievement={achievement}
        athleteId={athleteId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}

function EditAchievementDialog({
  achievement,
  athleteId,
  open,
  onOpenChange,
}: {
  achievement: AdminAchievementItem;
  athleteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(() =>
    fromAchievement(achievement)
  );

  function reset() {
    setState(fromAchievement(achievement));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = parsePayload(state);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    startTransition(async () => {
      const result = await updateAchievementAction(
        achievement.id,
        athleteId,
        parsed.data
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
          <DialogTitle>Editar conquista</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <AchievementFormFields
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

function DeleteAchievementAlert({
  achievement,
  athleteId,
  open,
  onOpenChange,
}: {
  achievement: AdminAchievementItem;
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
      const result = await deleteAchievementAction(achievement.id, athleteId);
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
          <AlertDialogTitle>Excluir esta conquista?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{achievement.name}</strong> ({achievement.year}) será
            removida do histórico do atleta. Essa ação não pode ser desfeita.
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

function AchievementFormFields({
  state,
  onChange,
}: {
  state: FormState;
  onChange: (next: Partial<FormState>) => void;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label
          htmlFor="ach-name"
          className="text-xs text-muted-foreground font-medium"
        >
          Nome
        </Label>
        <Input
          id="ach-name"
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Campeonato Estadual"
          maxLength={120}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="ach-category"
            className="text-xs text-muted-foreground font-medium"
          >
            Categoria
          </Label>
          <Input
            id="ach-category"
            value={state.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="U17"
            maxLength={60}
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="ach-year"
            className="text-xs text-muted-foreground font-medium"
          >
            Ano
          </Label>
          <Input
            id="ach-year"
            type="number"
            min="1900"
            max={CURRENT_YEAR + 1}
            value={state.year}
            onChange={(e) => onChange({ year: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground font-medium">
          Tipo
        </Label>
        <Select
          value={state.type}
          onValueChange={(v) => onChange({ type: v as AchievementType })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
