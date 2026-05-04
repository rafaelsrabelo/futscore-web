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
import { updateUserAction } from "@/lib/admin/actions";
import type { UpdateUserInput } from "@/lib/admin/schemas";
import type { AdminUserDetail, AdminUserRole } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: ReadonlyArray<{ value: AdminUserRole; label: string }> = [
  { value: "ATHLETE", label: "Atleta" },
  { value: "OBSERVER", label: "Olheiro" },
];

type FormState = {
  name: string;
  email: string;
  cpf: string;
  role: AdminUserRole | "";
  isActive: boolean;
  emailVerified: boolean;
  isImported: boolean;
};

function buildInitialState(user: AdminUserDetail["user"]): FormState {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    cpf: user.cpf ?? "",
    role: user.role ?? "",
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    isImported: user.isImported,
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

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function buildPayload(state: FormState): UpdateUserInput {
  return {
    name: trimOrUndefined(state.name),
    email: trimOrUndefined(state.email),
    cpf: trimOrNull(state.cpf),
    role: state.role === "" ? undefined : state.role,
    isActive: state.isActive,
    emailVerified: state.emailVerified,
    isImported: state.isImported,
  };
}

export function EditUserDialog({
  userId,
  initial,
}: {
  userId: string;
  initial: AdminUserDetail;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<"email" | "cpf" | null>(null);
  const [state, setState] = useState<FormState>(() =>
    buildInitialState(initial.user)
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    if (fieldError && (key === "email" || key === "cpf")) {
      if (key === fieldError) setFieldError(null);
    }
  }

  function reset() {
    setState(buildInitialState(initial.user));
    setError(null);
    setFieldError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    const initialCpfDigits = digitsOnly(initial.user.cpf ?? "");
    const nextCpfDigits = digitsOnly(state.cpf);
    if (
      initialCpfDigits !== nextCpfDigits &&
      !window.confirm(
        "Trocar o CPF de uma conta é uma operação sensível. Confirma a alteração?"
      )
    ) {
      return;
    }

    const payload = buildPayload(state);

    startTransition(async () => {
      const result = await updateUserAction(userId, payload);
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
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Section title="Identificação">
            <Grid>
              <Field label="Nome" htmlFor="name">
                <Input
                  id="name"
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>
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
                hint="Backend normaliza máscara — pode digitar com pontos ou só números."
                error={fieldError === "cpf" ? (error ?? undefined) : undefined}
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={state.cpf}
                  onChange={(e) => update("cpf", e.target.value)}
                  aria-invalid={fieldError === "cpf"}
                />
              </Field>
              <Field label="Role">
                <Select
                  value={state.role || undefined}
                  onValueChange={(v) => update("role", v as AdminUserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Grid>
          </Section>

          <Section title="Flags operacionais">
            <div className="space-y-2">
              <CheckboxRow
                checked={state.isActive}
                onChange={(v) => update("isActive", v)}
                label="Conta ativa"
                hint="Desligar impede o login. Tokens já emitidos seguem válidos pelo TTL — combine com Redefinir senha para forçar logout."
              />
              <CheckboxRow
                checked={state.emailVerified}
                onChange={(v) => update("emailVerified", v)}
                label="E-mail verificado"
                hint="Atalho operacional para marcar como verificado sem o fluxo de e-mail."
              />
              <CheckboxRow
                checked={state.isImported}
                onChange={(v) => update("isImported", v)}
                label="Conta importada"
                hint="Geralmente vira false quando o usuário reivindica a conta."
              />
            </div>
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
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
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
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
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
