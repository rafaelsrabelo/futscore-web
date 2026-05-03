"use client";

import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { updateAthleteAction } from "@/lib/admin/actions";
import type { UpdateAthleteInput } from "@/lib/admin/schemas";
import type {
  AdminAthleteDetail,
  AdminAthleteDetailAddress,
  AdminAthleteDetailProfile,
  AdminAthleteDetailUser,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const POSITION_OPTIONS = [
  { value: "GOALKEEPER", label: "Goleiro" },
  { value: "DEFENDER", label: "Defensor" },
  { value: "MIDFIELDER", label: "Meio-campo" },
  { value: "FORWARD", label: "Atacante" },
] as const;

const GENDER_OPTIONS = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
] as const;

const FOOT_OPTIONS = [
  { value: "RIGHT", label: "Destro" },
  { value: "LEFT", label: "Canhoto" },
] as const;

type FormState = {
  // User
  name: string;
  email: string;
  cpf: string;
  isActive: boolean;
  // Profile
  nickname: string;
  profilePhoto: string;
  birthDate: string;
  gender: AdminAthleteDetailProfile["gender"] | "";
  height: string;
  weight: string;
  dominantFoot: AdminAthleteDetailProfile["dominantFoot"] | "";
  primaryPosition: AdminAthleteDetailProfile["primaryPosition"] | "";
  secondaryPosition: AdminAthleteDetailProfile["primaryPosition"] | "";
  currentClub: string;
  biography: string;
  hasManager: boolean;
  managerName: string;
  managerCompany: string;
  managerContact: string;
  hasNutritionist: boolean;
  hasPsychologist: boolean;
  hasPersonalTrainer: boolean;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  // Address
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
};

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const idx = iso.indexOf("T");
  return idx > 0 ? iso.slice(0, idx) : iso;
}

function buildInitialState(
  profile: AdminAthleteDetailProfile,
  user: AdminAthleteDetailUser,
  address: AdminAthleteDetailAddress | null
): FormState {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    cpf: profile.cpf ?? "",
    isActive: user.isActive,
    nickname: profile.nickname ?? "",
    profilePhoto: profile.profilePhoto ?? "",
    birthDate: isoToDateInput(profile.birthDate),
    gender: profile.gender,
    height: profile.height != null ? String(profile.height) : "",
    weight: profile.weight != null ? String(profile.weight) : "",
    dominantFoot: profile.dominantFoot,
    primaryPosition: profile.primaryPosition,
    secondaryPosition: profile.secondaryPosition ?? "",
    currentClub: profile.currentClub ?? "",
    biography: profile.biography ?? "",
    hasManager: profile.hasManager,
    managerName: profile.managerName ?? "",
    managerCompany: profile.managerCompany ?? "",
    managerContact: profile.managerContact ?? "",
    hasNutritionist: profile.hasNutritionist ?? false,
    hasPsychologist: profile.hasPsychologist ?? false,
    hasPersonalTrainer: profile.hasPersonalTrainer ?? false,
    instagramUrl: profile.instagramUrl ?? "",
    twitterUrl: profile.twitterUrl ?? "",
    youtubeUrl: profile.youtubeUrl ?? "",
    zipCode: address?.zipCode ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    complement: address?.complement ?? "",
    district: address?.district ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    country: address?.country ?? "",
  };
}

function trimOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function trimOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function buildPayload(
  state: FormState,
  hadAddress: boolean
): UpdateAthleteInput {
  const heightNum = state.height === "" ? undefined : Number(state.height);
  const weightNum = state.weight === "" ? undefined : Number(state.weight);

  const payload: UpdateAthleteInput = {
    name: trimOrUndefined(state.name),
    email: trimOrUndefined(state.email),
    cpf: trimOrNull(state.cpf),
    isActive: state.isActive,
    nickname: trimOrUndefined(state.nickname),
    profilePhoto: trimOrUndefined(state.profilePhoto),
    birthDate: trimOrUndefined(state.birthDate),
    gender: state.gender === "" ? undefined : state.gender,
    height: Number.isFinite(heightNum) ? heightNum : undefined,
    weight: Number.isFinite(weightNum) ? weightNum : undefined,
    dominantFoot: state.dominantFoot === "" ? undefined : state.dominantFoot,
    primaryPosition:
      state.primaryPosition === "" ? undefined : state.primaryPosition,
    secondaryPosition:
      state.secondaryPosition === "" ? null : state.secondaryPosition,
    currentClub: trimOrNull(state.currentClub),
    biography: trimOrUndefined(state.biography),
    hasManager: state.hasManager,
    managerName: state.hasManager ? trimOrNull(state.managerName) : null,
    managerCompany: state.hasManager ? trimOrNull(state.managerCompany) : null,
    managerContact: state.hasManager ? trimOrNull(state.managerContact) : null,
    hasNutritionist: state.hasNutritionist,
    hasPsychologist: state.hasPsychologist,
    hasPersonalTrainer: state.hasPersonalTrainer,
    instagramUrl: trimOrUndefined(state.instagramUrl),
    twitterUrl: trimOrUndefined(state.twitterUrl),
    youtubeUrl: trimOrUndefined(state.youtubeUrl),
  };

  const addressFields = {
    zipCode: trimOrUndefined(state.zipCode),
    street: trimOrUndefined(state.street),
    number: trimOrUndefined(state.number),
    complement: trimOrNull(state.complement),
    district: trimOrUndefined(state.district),
    city: trimOrUndefined(state.city),
    state: trimOrUndefined(state.state),
    country: trimOrUndefined(state.country),
  };
  const hasAddressContent = Object.entries(addressFields).some(([key, v]) =>
    key === "complement" ? v !== null : v !== undefined
  );

  if (hadAddress || hasAddressContent) {
    payload.address = addressFields;
  }

  return payload;
}

export function EditAthleteDialog({
  athleteId,
  initial,
}: {
  athleteId: string;
  initial: AdminAthleteDetail;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<
    "nickname" | "email" | "cpf" | null
  >(null);
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(initial.profile, initial.user, initial.address)
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    if (fieldError && (key === fieldError || (key === "email" && fieldError === "email"))) {
      setFieldError(null);
    }
  }

  function reset() {
    setState(buildInitialState(initial.profile, initial.user, initial.address));
    setError(null);
    setFieldError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    const payload = buildPayload(state, initial.address !== null);

    startTransition(async () => {
      const result = await updateAthleteAction(athleteId, payload);
      if (!result.ok) {
        setError(result.error);
        if (result.field) setFieldError(result.field);
        return;
      }
      setOpen(false);
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
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Editar atleta
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar atleta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Section title="Perfil">
            <Grid>
              <Field label="Nome" htmlFor="name">
                <Input
                  id="name"
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>
              <Field
                label="Nickname"
                htmlFor="nickname"
                error={fieldError === "nickname" ? (error ?? undefined) : undefined}
              >
                <Input
                  id="nickname"
                  value={state.nickname}
                  onChange={(e) => update("nickname", e.target.value)}
                  aria-invalid={fieldError === "nickname"}
                />
              </Field>
              <Field label="Foto (URL)" htmlFor="profilePhoto">
                <Input
                  id="profilePhoto"
                  type="url"
                  placeholder="https://..."
                  value={state.profilePhoto}
                  onChange={(e) => update("profilePhoto", e.target.value)}
                />
              </Field>
              <Field label="Data de nascimento" htmlFor="birthDate">
                <Input
                  id="birthDate"
                  type="date"
                  value={state.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                />
              </Field>
              <Field label="Gênero">
                <EnumSelect
                  value={state.gender}
                  onChange={(v) =>
                    update("gender", v as FormState["gender"])
                  }
                  options={GENDER_OPTIONS}
                  placeholder="Selecione"
                />
              </Field>
              <Field label="Perna dominante">
                <EnumSelect
                  value={state.dominantFoot}
                  onChange={(v) =>
                    update("dominantFoot", v as FormState["dominantFoot"])
                  }
                  options={FOOT_OPTIONS}
                  placeholder="Selecione"
                />
              </Field>
              <Field label="Posição principal">
                <EnumSelect
                  value={state.primaryPosition}
                  onChange={(v) =>
                    update("primaryPosition", v as FormState["primaryPosition"])
                  }
                  options={POSITION_OPTIONS}
                  placeholder="Selecione"
                />
              </Field>
              <Field label="Posição secundária">
                <EnumSelect
                  value={state.secondaryPosition}
                  onChange={(v) =>
                    update(
                      "secondaryPosition",
                      v as FormState["secondaryPosition"]
                    )
                  }
                  options={POSITION_OPTIONS}
                  placeholder="Nenhuma"
                  clearable
                />
              </Field>
              <Field label="Altura (m)" htmlFor="height">
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1.78"
                  value={state.height}
                  onChange={(e) => update("height", e.target.value)}
                />
              </Field>
              <Field label="Peso (kg)" htmlFor="weight">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="72"
                  value={state.weight}
                  onChange={(e) => update("weight", e.target.value)}
                />
              </Field>
              <Field label="Clube atual" htmlFor="currentClub">
                <Input
                  id="currentClub"
                  value={state.currentClub}
                  onChange={(e) => update("currentClub", e.target.value)}
                />
              </Field>
            </Grid>
            <Field label="Biografia" htmlFor="biography" className="mt-3">
              <textarea
                id="biography"
                rows={3}
                value={state.biography}
                onChange={(e) => update("biography", e.target.value)}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </Field>
          </Section>

          <Section title="Conta">
            <Grid>
              <Field
                label="E-mail"
                htmlFor="email"
                error={fieldError === "email" ? (error ?? undefined) : undefined}
              >
                <Input
                  id="email"
                  type="email"
                  value={state.email}
                  onChange={(e) => update("email", e.target.value)}
                  aria-invalid={fieldError === "email"}
                />
              </Field>
              <Field
                label="CPF"
                htmlFor="cpf"
                error={fieldError === "cpf" ? (error ?? undefined) : undefined}
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="Somente números"
                  value={state.cpf}
                  onChange={(e) => update("cpf", e.target.value)}
                  aria-invalid={fieldError === "cpf"}
                />
              </Field>
            </Grid>
            <CheckboxRow
              checked={state.isActive}
              onChange={(v) => update("isActive", v)}
              label="Conta ativa"
              hint="Desligue para bloquear o login deste atleta."
            />
          </Section>

          <Section title="Empresário">
            <CheckboxRow
              checked={state.hasManager}
              onChange={(v) => update("hasManager", v)}
              label="Possui empresário"
            />
            {state.hasManager && (
              <Grid className="mt-3">
                <Field label="Nome" htmlFor="managerName">
                  <Input
                    id="managerName"
                    value={state.managerName}
                    onChange={(e) => update("managerName", e.target.value)}
                  />
                </Field>
                <Field label="Empresa" htmlFor="managerCompany">
                  <Input
                    id="managerCompany"
                    value={state.managerCompany}
                    onChange={(e) =>
                      update("managerCompany", e.target.value)
                    }
                  />
                </Field>
                <Field label="Contato" htmlFor="managerContact">
                  <Input
                    id="managerContact"
                    value={state.managerContact}
                    onChange={(e) =>
                      update("managerContact", e.target.value)
                    }
                  />
                </Field>
              </Grid>
            )}
          </Section>

          <Section title="Equipe de apoio">
            <div className="space-y-2">
              <CheckboxRow
                checked={state.hasNutritionist}
                onChange={(v) => update("hasNutritionist", v)}
                label="Tem nutricionista"
              />
              <CheckboxRow
                checked={state.hasPsychologist}
                onChange={(v) => update("hasPsychologist", v)}
                label="Tem psicólogo"
              />
              <CheckboxRow
                checked={state.hasPersonalTrainer}
                onChange={(v) => update("hasPersonalTrainer", v)}
                label="Tem personal"
              />
            </div>
          </Section>

          <Section title="Redes sociais">
            <Grid>
              <Field label="Instagram" htmlFor="instagramUrl">
                <Input
                  id="instagramUrl"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={state.instagramUrl}
                  onChange={(e) => update("instagramUrl", e.target.value)}
                />
              </Field>
              <Field label="Twitter" htmlFor="twitterUrl">
                <Input
                  id="twitterUrl"
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={state.twitterUrl}
                  onChange={(e) => update("twitterUrl", e.target.value)}
                />
              </Field>
              <Field label="YouTube" htmlFor="youtubeUrl">
                <Input
                  id="youtubeUrl"
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={state.youtubeUrl}
                  onChange={(e) => update("youtubeUrl", e.target.value)}
                />
              </Field>
            </Grid>
          </Section>

          <Section title="Endereço">
            <Grid>
              <Field label="CEP" htmlFor="zipCode">
                <Input
                  id="zipCode"
                  value={state.zipCode}
                  onChange={(e) => update("zipCode", e.target.value)}
                />
              </Field>
              <Field label="Rua" htmlFor="street">
                <Input
                  id="street"
                  value={state.street}
                  onChange={(e) => update("street", e.target.value)}
                />
              </Field>
              <Field label="Número" htmlFor="number">
                <Input
                  id="number"
                  value={state.number}
                  onChange={(e) => update("number", e.target.value)}
                />
              </Field>
              <Field label="Complemento" htmlFor="complement">
                <Input
                  id="complement"
                  value={state.complement}
                  onChange={(e) => update("complement", e.target.value)}
                />
              </Field>
              <Field label="Bairro" htmlFor="district">
                <Input
                  id="district"
                  value={state.district}
                  onChange={(e) => update("district", e.target.value)}
                />
              </Field>
              <Field label="Cidade" htmlFor="city">
                <Input
                  id="city"
                  value={state.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </Field>
              <Field label="UF" htmlFor="state">
                <Input
                  id="state"
                  maxLength={2}
                  placeholder="CE"
                  value={state.state}
                  onChange={(e) =>
                    update("state", e.target.value.toUpperCase())
                  }
                />
              </Field>
              <Field label="País" htmlFor="country">
                <Input
                  id="country"
                  placeholder="Brasil"
                  value={state.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </Field>
            </Grid>
          </Section>

          {error && !fieldError && (
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
              {pending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <fieldset className="rounded-lg border border-border/60 p-4">
      <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Grid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs text-muted-foreground font-medium"
      >
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function EnumSelect({
  value,
  onChange,
  options,
  placeholder,
  clearable,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  clearable?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={value || undefined}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          Limpar
        </button>
      )}
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring accent-primary"
      />
      <div className="text-sm leading-tight">
        <div className="font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    </label>
  );
}
