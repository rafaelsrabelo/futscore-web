"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  previewNotificationAction,
  sendNotificationAction,
} from "@/lib/admin/actions";
import {
  AUDIENCE_TYPE_LABELS,
  DEEP_LINK_OPTIONS,
  describeAudience,
} from "@/lib/admin/notifications-format";
import type {
  NotificationAthleteFilters,
  NotificationAudience,
  NotificationAudienceType,
  NotificationPreviewResponse,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { BannerPreview } from "../notification-row";

const TITLE_MAX = 120;
const BODY_MAX = 240;
const PREVIEW_TTL_MS = 30_000;

type FilterFormValues = {
  gender: string;
  primaryPosition: string;
  dominantFoot: string;
  classification: string;
  currentClub: string;
  minAge: string;
  maxAge: string;
  minHeight: string;
  maxHeight: string;
  minWeight: string;
  maxWeight: string;
};

const EMPTY_FILTERS: FilterFormValues = {
  gender: "",
  primaryPosition: "",
  dominantFoot: "",
  classification: "",
  currentClub: "",
  minAge: "",
  maxAge: "",
  minHeight: "",
  maxHeight: "",
  minWeight: "",
  maxWeight: "",
};

function parseUuids(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildFilters(
  v: FilterFormValues,
): NotificationAthleteFilters {
  const f: NotificationAthleteFilters = {};
  if (v.gender) f.gender = v.gender as NotificationAthleteFilters["gender"];
  if (v.primaryPosition)
    f.primaryPosition =
      v.primaryPosition as NotificationAthleteFilters["primaryPosition"];
  if (v.dominantFoot)
    f.dominantFoot =
      v.dominantFoot as NotificationAthleteFilters["dominantFoot"];
  if (v.classification)
    f.classification =
      v.classification as NotificationAthleteFilters["classification"];
  if (v.currentClub.trim()) f.currentClub = v.currentClub.trim();
  const numeric = (s: string) => {
    const n = Number(s);
    return s.trim() && Number.isFinite(n) ? n : undefined;
  };
  const minAge = numeric(v.minAge);
  if (minAge !== undefined) f.minAge = Math.trunc(minAge);
  const maxAge = numeric(v.maxAge);
  if (maxAge !== undefined) f.maxAge = Math.trunc(maxAge);
  const minHeight = numeric(v.minHeight);
  if (minHeight !== undefined) f.minHeight = minHeight;
  const maxHeight = numeric(v.maxHeight);
  if (maxHeight !== undefined) f.maxHeight = maxHeight;
  const minWeight = numeric(v.minWeight);
  if (minWeight !== undefined) f.minWeight = minWeight;
  const maxWeight = numeric(v.maxWeight);
  if (maxWeight !== undefined) f.maxWeight = maxWeight;
  return f;
}

function buildAudience(
  type: NotificationAudienceType,
  filters: FilterFormValues,
  userIdsRaw: string,
): { ok: true; value: NotificationAudience } | { ok: false; error: string } {
  if (type === "ALL") return { ok: true, value: { type: "ALL" } };
  if (type === "ATHLETE_FILTER") {
    return {
      ok: true,
      value: { type: "ATHLETE_FILTER", filters: buildFilters(filters) },
    };
  }
  const ids = parseUuids(userIdsRaw);
  if (ids.length === 0) {
    return { ok: false, error: "Cole ao menos um UUID de usuário." };
  }
  const invalid = ids.find((id) => !isUuid(id));
  if (invalid) {
    return { ok: false, error: `UUID inválido: ${invalid}` };
  }
  return { ok: true, value: { type: "USER_IDS", userIds: ids } };
}

export function NotificationForm() {
  const router = useRouter();
  const [pendingPreview, startPreview] = useTransition();
  const [pendingSend, startSend] = useTransition();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] =
    useState<NotificationAudienceType>("ALL");
  const [filters, setFilters] = useState<FilterFormValues>(EMPTY_FILTERS);
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [deepLink, setDeepLink] = useState<string>("none");
  const [formError, setFormError] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] =
    useState<NotificationPreviewResponse | null>(null);
  const [previewedAudience, setPreviewedAudience] =
    useState<NotificationAudience | null>(null);
  const [previewedAt, setPreviewedAt] = useState<number>(0);
  const [previewError, setPreviewError] = useState<string | null>(null);

  function setFilter<K extends keyof FilterFormValues>(
    key: K,
    value: FilterFormValues[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function validateBeforePreview():
    | { ok: true; audience: NotificationAudience }
    | { ok: false; error: string } {
    if (!title.trim()) return { ok: false, error: "Informe o título." };
    if (title.length > TITLE_MAX) {
      return {
        ok: false,
        error: `Título deve ter no máximo ${TITLE_MAX} caracteres.`,
      };
    }
    if (!body.trim()) return { ok: false, error: "Informe a mensagem." };
    if (body.length > BODY_MAX) {
      return {
        ok: false,
        error: `Mensagem deve ter no máximo ${BODY_MAX} caracteres.`,
      };
    }
    const audienceResult = buildAudience(audienceType, filters, userIdsRaw);
    if (!audienceResult.ok) return audienceResult;
    return { ok: true, audience: audienceResult.value };
  }

  function handlePreview() {
    setFormError(null);
    setPreviewError(null);

    const validation = validateBeforePreview();
    if (!validation.ok) {
      setFormError(validation.error);
      return;
    }

    const { audience } = validation;
    startPreview(async () => {
      const result = await previewNotificationAction({ audience });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setPreviewData(result.data);
      setPreviewedAudience(audience);
      setPreviewedAt(Date.now());
      setPreviewOpen(true);
    });
  }

  function handleSend() {
    if (!previewedAudience) return;
    setPreviewError(null);

    const dataPayload = DEEP_LINK_OPTIONS.find((o) => o.value === deepLink)
      ?.data;

    const doSend = (audience: NotificationAudience) => {
      startSend(async () => {
        const result = await sendNotificationAction({
          title: title.trim(),
          body: body.trim(),
          audience,
          ...(dataPayload && Object.keys(dataPayload).length > 0
            ? { data: dataPayload }
            : {}),
        });
        if (!result.ok) {
          setPreviewError(result.error);
          return;
        }
        setPreviewOpen(false);
        router.push("/admin/notificacoes");
        router.refresh();
      });
    };

    const stale = Date.now() - previewedAt > PREVIEW_TTL_MS;
    if (stale) {
      startPreview(async () => {
        const result = await previewNotificationAction({
          audience: previewedAudience,
        });
        if (!result.ok) {
          setPreviewError(result.error);
          return;
        }
        setPreviewData(result.data);
        setPreviewedAt(Date.now());
        doSend(previewedAudience);
      });
      return;
    }

    doSend(previewedAudience);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Section title="Conteúdo">
        <FieldRow>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="notif-title">Título *</Label>
            <CharCount value={title.length} max={TITLE_MAX} />
          </div>
          <Input
            id="notif-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="Novo torneio disponível!"
          />
        </FieldRow>

        <FieldRow>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="notif-body">Mensagem *</Label>
            <CharCount value={body.length} max={BODY_MAX} />
          </div>
          <textarea
            id="notif-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            rows={3}
            placeholder="Texto secundário do banner."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </FieldRow>
      </Section>

      <Section title="Audiência">
        <div className="space-y-2 mb-4">
          {(
            ["ALL", "ATHLETE_FILTER", "USER_IDS"] as NotificationAudienceType[]
          ).map((value) => (
            <label
              key={value}
              className={cn(
                "flex items-start gap-2.5 rounded-md border p-3 cursor-pointer transition-colors",
                audienceType === value
                  ? "border-primary/60 bg-primary/5"
                  : "border-border/60 hover:bg-accent/30",
              )}
            >
              <input
                type="radio"
                name="audience-type"
                value={value}
                checked={audienceType === value}
                onChange={() => setAudienceType(value)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <div className="text-sm leading-tight">
                <div className="font-medium">
                  {AUDIENCE_TYPE_LABELS[value]}
                </div>
                <div className="text-xs text-muted-foreground">
                  {value === "ALL" &&
                    "Broadcast geral para todos os usuários com app instalado."}
                  {value === "ATHLETE_FILTER" &&
                    "Atletas que casam com os filtros abaixo (mesmos da lista)."}
                  {value === "USER_IDS" &&
                    "Lista específica de IDs (UUID) de usuários."}
                </div>
              </div>
            </label>
          ))}
        </div>

        {audienceType === "ATHLETE_FILTER" && (
          <FilterFields values={filters} onChange={setFilter} />
        )}

        {audienceType === "USER_IDS" && (
          <FieldRow>
            <Label htmlFor="notif-user-ids" className="mb-1.5 block">
              IDs de usuários (um por linha ou separados por vírgula)
            </Label>
            <textarea
              id="notif-user-ids"
              value={userIdsRaw}
              onChange={(e) => setUserIdsRaw(e.target.value)}
              rows={4}
              placeholder="9b1c4f6a-...&#10;2e8a9d1b-..."
              className="font-mono flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              {parseUuids(userIdsRaw).length} ID
              {parseUuids(userIdsRaw).length === 1 ? "" : "s"} colado
              {parseUuids(userIdsRaw).length === 1 ? "" : "s"}.
            </p>
          </FieldRow>
        )}
      </Section>

      <Section title="Avançado (opcional)">
        <FieldRow>
          <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
            Tela ao tocar (deep link)
          </Label>
          <Select value={deepLink} onValueChange={setDeepLink}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEEP_LINK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      </Section>

      {formError && (
        <p className="text-sm text-destructive flex items-center gap-2" role="alert">
          <AlertTriangle className="w-4 h-4" />
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/notificacoes")}
        >
          Cancelar
        </Button>
        <Button type="button" onClick={handlePreview} disabled={pendingPreview}>
          {pendingPreview ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          Pré-visualizar destinatários
        </Button>
      </div>

      <Dialog
        open={previewOpen}
        onOpenChange={(o) => {
          if (!pendingSend) setPreviewOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Confirmar envio
            </DialogTitle>
            <DialogDescription>
              Revise antes de disparar. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {previewData && previewedAudience && (
            <div className="space-y-4 pt-1">
              <div className="rounded-md border border-border/60 bg-card/40 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Destinatários
                </p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {previewData.totalWithPushToken}
                  <span className="text-sm font-normal text-muted-foreground">
                    receberão
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewData.totalRecipients} atendem ao filtro ·{" "}
                  {previewData.totalRecipients - previewData.totalWithPushToken}{" "}
                  ainda não instalaram o app
                </p>
              </div>

              <BannerPreview title={title} body={body} />

              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Audiência:</span>{" "}
                {describeAudience(previewedAudience)}
              </p>

              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Notificações enviadas não podem ser canceladas. Confirme que o
                  conteúdo e o público estão corretos.
                </p>
              </div>

              {previewError && (
                <p
                  className="text-sm text-destructive flex items-center gap-2"
                  role="alert"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {previewError}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewOpen(false)}
              disabled={pendingSend || pendingPreview}
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={pendingSend || pendingPreview || !previewData}
            >
              {pendingSend ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {pendingSend ? "Enviando..." : "Enviar agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-4 md:p-5">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 last:mb-0">{children}</div>;
}

function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={cn(
        "text-[11px]",
        value > max ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {value} / {max}
    </span>
  );
}

const CLEAR_VALUE = "__clear__";

function FilterFields({
  values,
  onChange,
}: {
  values: FilterFormValues;
  onChange: <K extends keyof FilterFormValues>(
    key: K,
    value: FilterFormValues[K],
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-border/60 pt-4">
      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Posição
        </Label>
        <EnumSelect
          value={values.primaryPosition}
          onChange={(v) => onChange("primaryPosition", v)}
          options={[
            { value: "GOALKEEPER", label: "Goleiros" },
            { value: "DEFENDER", label: "Defensores" },
            { value: "MIDFIELDER", label: "Meio-campo" },
            { value: "FORWARD", label: "Atacantes" },
          ]}
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Classificação
        </Label>
        <EnumSelect
          value={values.classification}
          onChange={(v) => onChange("classification", v)}
          options={[
            { value: "DESENVOLVIMENTO", label: "Desenvolvimento" },
            { value: "PERFORMANCE", label: "Performance" },
            { value: "UNCLASSIFIED", label: "Não classificadas" },
          ]}
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Gênero
        </Label>
        <EnumSelect
          value={values.gender}
          onChange={(v) => onChange("gender", v)}
          options={[
            { value: "MALE", label: "Masculino" },
            { value: "FEMALE", label: "Feminino" },
            { value: "OTHER", label: "Outro" },
          ]}
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Pé dominante
        </Label>
        <EnumSelect
          value={values.dominantFoot}
          onChange={(v) => onChange("dominantFoot", v)}
          options={[
            { value: "RIGHT", label: "Destro" },
            { value: "LEFT", label: "Canhoto" },
          ]}
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Clube atual (contém)
        </Label>
        <Input
          value={values.currentClub}
          onChange={(e) => onChange("currentClub", e.target.value)}
          placeholder="ex.: Flamengo"
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Idade (anos)
        </Label>
        <RangeInputs
          min={values.minAge}
          max={values.maxAge}
          onMin={(v) => onChange("minAge", v)}
          onMax={(v) => onChange("maxAge", v)}
          step={1}
          minPlaceholder="0"
          maxPlaceholder="50"
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Altura (m)
        </Label>
        <RangeInputs
          min={values.minHeight}
          max={values.maxHeight}
          onMin={(v) => onChange("minHeight", v)}
          onMax={(v) => onChange("maxHeight", v)}
          step={0.01}
          minPlaceholder="1.40"
          maxPlaceholder="2.20"
        />
      </FieldRow>

      <FieldRow>
        <Label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          Peso (kg)
        </Label>
        <RangeInputs
          min={values.minWeight}
          max={values.maxWeight}
          onMin={(v) => onChange("minWeight", v)}
          onMax={(v) => onChange("maxWeight", v)}
          step={0.1}
          minPlaceholder="40"
          maxPlaceholder="120"
        />
      </FieldRow>
    </div>
  );
}

function EnumSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select
      value={value || CLEAR_VALUE}
      onValueChange={(v) => onChange(v === CLEAR_VALUE ? "" : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Qualquer" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CLEAR_VALUE}>Qualquer</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RangeInputs({
  min,
  max,
  onMin,
  onMax,
  step,
  minPlaceholder,
  maxPlaceholder,
}: {
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
  step: number;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        value={min}
        onChange={(e) => onMin(e.target.value)}
        placeholder={minPlaceholder}
      />
      <span className="text-xs text-muted-foreground">até</span>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        value={max}
        onChange={(e) => onMax(e.target.value)}
        placeholder={maxPlaceholder}
      />
    </div>
  );
}
