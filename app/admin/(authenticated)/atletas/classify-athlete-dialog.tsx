"use client";

import { Loader2, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  CLASSIFICATION_LABELS,
  describeClassification,
} from "@/lib/admin/classification";
import { setAthleteClassificationAction } from "@/lib/admin/actions";
import type { AthleteClassification } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const COMMENT_MAX = 500;

type Choice = AthleteClassification | "NONE";

const CHOICES: { value: Choice; label: string; hint: string }[] = [
  {
    value: "DESENVOLVIMENTO",
    label: CLASSIFICATION_LABELS.DESENVOLVIMENTO,
    hint: "Atleta em fase de desenvolvimento.",
  },
  {
    value: "PERFORMANCE",
    label: CLASSIFICATION_LABELS.PERFORMANCE,
    hint: "Atleta em nível de performance.",
  },
  {
    value: "NONE",
    label: "Remover classificação",
    hint: "Volta a aparecer como “não classificada”.",
  },
];

export function ClassifyAthleteDialog({
  athleteId,
  athleteName,
  current,
  trigger,
}: {
  athleteId: string;
  athleteName: string;
  current: AthleteClassification | null;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState<Choice>(() => current ?? "NONE");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setChoice(current ?? "NONE");
      setComment("");
      setError(null);
    }
  }, [open, current]);

  const currentDisplay = describeClassification(current);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const payload = {
      classification: choice === "NONE" ? null : choice,
      comment: comment.trim() ? comment.trim() : undefined,
    };

    startTransition(async () => {
      const result = await setAthleteClassificationAction(athleteId, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-4 h-4 text-primary" />
            Classificar atleta
          </DialogTitle>
          <DialogDescription>
            Definir classificação interna de <strong>{athleteName}</strong>.
            Cada decisão fica registrada no histórico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div>
            <Label className="text-xs text-muted-foreground font-medium">
              Classificação atual
            </Label>
            <div className="mt-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  currentDisplay.badgeClass,
                )}
              >
                {currentDisplay.label}
              </span>
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs text-muted-foreground font-medium mb-1">
              Nova classificação
            </legend>
            {CHOICES.map((opt) => {
              const checked = choice === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-2.5 rounded-md border p-3 cursor-pointer transition-colors",
                    checked
                      ? "border-primary/60 bg-primary/5"
                      : "border-border/60 hover:bg-accent/30",
                  )}
                >
                  <input
                    type="radio"
                    name="classification"
                    value={opt.value}
                    checked={checked}
                    onChange={() => setChoice(opt.value)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <div className="text-sm leading-tight">
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {opt.hint}
                    </div>
                  </div>
                </label>
              );
            })}
          </fieldset>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="classification-comment"
                className="text-xs text-muted-foreground font-medium"
              >
                Comentário (opcional)
              </Label>
              <span
                className={cn(
                  "text-[11px]",
                  comment.length > COMMENT_MAX
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {comment.length} / {COMMENT_MAX}
              </span>
            </div>
            <textarea
              id="classification-comment"
              rows={3}
              maxLength={COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex.: promovido após avaliação de maio"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
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
