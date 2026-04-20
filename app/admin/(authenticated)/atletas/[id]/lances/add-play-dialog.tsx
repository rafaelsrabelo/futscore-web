"use client";

import { Loader2, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPlayAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import {
  UploadProgress,
  VideoPicker,
  getPresignedUploadUrl,
  uploadToR2,
} from "./upload-helpers";

export interface MatchOption {
  id: string;
  date: string;
  adversaryTeam: string;
}

const PLAY_TYPES: { value: string; label: string }[] = [
  { value: "GOAL", label: "Gol" },
  { value: "ASSIST", label: "Assistência" },
  { value: "SHOT_ON_TARGET", label: "Finalização no alvo" },
  { value: "SHOT_OFF_TARGET", label: "Finalização fora" },
  { value: "DIFFICULT_SAVE", label: "Defesa difícil" },
  { value: "EASY_SAVE", label: "Defesa fácil" },
  { value: "PENALTY_SAVE", label: "Defesa de pênalti" },
  { value: "DRIBBLE", label: "Drible" },
  { value: "TACKLE", label: "Desarme" },
  { value: "INTERCEPTION", label: "Interceptação" },
  { value: "ANTICIPATION", label: "Antecipação" },
  { value: "BALL_RECOVERY", label: "Recuperação de bola" },
  { value: "KEY_PASS", label: "Passe decisivo" },
  { value: "LONG_PASS", label: "Lançamento" },
  { value: "THROUGH_PASS", label: "Passe em profundidade" },
  { value: "CROSS", label: "Cruzamento" },
  { value: "PASS", label: "Passe" },
  { value: "HEADER", label: "Cabeceio" },
  { value: "FREE_KICK", label: "Falta direta" },
  { value: "CORNER_KICK", label: "Escanteio" },
  { value: "PENALTY", label: "Pênalti" },
  { value: "BICYCLE_KICK", label: "Bicicleta" },
  { value: "VOLLLEY", label: "Voleio" },
  { value: "BACKHEEL", label: "Calcanhar" },
  { value: "FOUL_COMMITTED", label: "Falta cometida" },
  { value: "FOUL_RECEIVED", label: "Falta sofrida" },
  { value: "YELLOW_CARD", label: "Cartão amarelo" },
  { value: "RED_CARD", label: "Cartão vermelho" },
  { value: "BEST_MOMENTS", label: "Melhores momentos" },
];

const CLASSIFICATIONS: { value: string; label: string }[] = [
  { value: "PHYSICAL", label: "Físico" },
  { value: "TACTICAL", label: "Tático" },
  { value: "TECHNICAL", label: "Técnico" },
  { value: "MENTAL", label: "Mental" },
];

function formatMatchLabel(iso: string, adversary: string): string {
  try {
    const d = new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${d} · vs ${adversary}`;
  } catch {
    return adversary;
  }
}

export function AddPlayDialog({ matches }: { matches: MatchOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [matchId, setMatchId] = useState("");
  const [playType, setPlayType] = useState("");
  const [rating, setRating] = useState(0);
  const [observations, setObservations] = useState("");
  const [classifications, setClassifications] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  function reset() {
    setMatchId("");
    setPlayType("");
    setRating(0);
    setObservations("");
    setClassifications([]);
    setVideoFile(null);
    setError(null);
    setStage("idle");
    setUploadPct(0);
  }

  function toggleClassification(value: string) {
    setClassifications((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!matchId || !playType) {
      setError("Selecione a partida e o tipo de lance.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      let videoUrl: string | undefined;
      if (videoFile) {
        setStage("uploading");
        setUploadPct(0);
        const presigned = await getPresignedUploadUrl(videoFile);
        const contentType =
          presigned.instructions?.headers?.["Content-Type"] ??
          videoFile.type ??
          "video/mp4";
        await uploadToR2(
          presigned.uploadUrl,
          videoFile,
          contentType,
          setUploadPct
        );
        videoUrl = presigned.publicUrl;
      }

      setStage("saving");
      const result = await createPlayAction({
        matchId,
        playType,
        rating: rating || undefined,
        observations: observations.trim() || undefined,
        classifications: classifications.length ? classifications : undefined,
        videoUrl,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha inesperada.");
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  }

  const noMatches = matches.length === 0;

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        size="sm"
        className="gap-1.5"
        disabled={noMatches}
        title={noMatches ? "Atleta não tem partidas cadastradas" : undefined}
      >
        <Plus className="w-4 h-4" />
        Adicionar lance
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar lance</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Field label="Partida">
              <Select value={matchId} onValueChange={setMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a partida" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {formatMatchLabel(m.date, m.adversaryTeam)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo de lance">
              <Select value={playType} onValueChange={setPlayType}>
                <SelectTrigger>
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
                    const active = classifications.includes(c.value);
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => toggleClassification(c.value)}
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

            <Field label="Vídeo (opcional)">
              <VideoPicker
                file={videoFile}
                onPick={setVideoFile}
                disabled={submitting}
              />
              {stage === "uploading" && <UploadProgress pct={uploadPct} />}
            </Field>

            <Field label="Observações (opcional)">
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                placeholder="Contexto do lance, referência temporal, detalhes técnicos..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
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
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !matchId || !playType}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {stage === "uploading"
                  ? "Enviando vídeo..."
                  : stage === "saving"
                    ? "Salvando..."
                    : "Salvar lance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
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

