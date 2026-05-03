"use client";

import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { updatePlayAction } from "@/lib/admin/actions";
import type { UpdatePlayInput } from "@/lib/admin/schemas";
import type {
  AdminPlayClassificationType,
  AdminPlayItem,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { CLASSIFICATIONS, PLAY_TYPES } from "./add-play-dialog";

export function EditPlayDialog({
  play,
  open,
  onOpenChange,
}: {
  play: AdminPlayItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [playType, setPlayType] = useState(play.playType);
  const [rating, setRating] = useState<number>(play.rating ?? 0);
  const [observations, setObservations] = useState(play.observations ?? "");
  const [photoUrl, setPhotoUrl] = useState(play.photoUrl ?? "");
  const [classifications, setClassifications] = useState<
    AdminPlayClassificationType[]
  >(() => play.classifications.map((c) => c.classification));

  function reset() {
    setPlayType(play.playType);
    setRating(play.rating ?? 0);
    setObservations(play.observations ?? "");
    setPhotoUrl(play.photoUrl ?? "");
    setClassifications(play.classifications.map((c) => c.classification));
    setError(null);
  }

  function toggleClassification(value: AdminPlayClassificationType) {
    setClassifications((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedObs = observations.trim();
    const trimmedPhoto = photoUrl.trim();

    const payload: UpdatePlayInput = {
      playType: playType !== play.playType ? playType : undefined,
      rating: rating === 0 ? null : rating,
      observations: trimmedObs === "" ? null : trimmedObs,
      photoUrl: trimmedPhoto === "" ? null : trimmedPhoto,
      classifications,
    };

    startTransition(async () => {
      const result = await updatePlayAction(play.id, payload);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar lance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Tipo de lance">
            <Select value={playType} onValueChange={setPlayType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PLAY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nota (opcional)">
              <StarRating value={rating} onChange={setRating} />
            </Field>
            <Field label="Classificações (opcional)">
              <div className="flex flex-wrap gap-1.5">
                {CLASSIFICATIONS.map((c) => {
                  const value = c.value as AdminPlayClassificationType;
                  const active = classifications.includes(value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleClassification(value)}
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent/60"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <Field label="Foto (URL)">
            <Input
              type="url"
              placeholder="https://..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          </Field>

          <Field label="Observações (opcional)">
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              placeholder="Contexto do lance, referência temporal..."
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            className="p-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
      {value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar
        </button>
      )}
    </div>
  );
}
