"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/lib/admin/actions";
import { loginSchema } from "@/lib/admin/schemas";

const initialState: LoginState = {};

export function LoginForm() {
  const [serverState, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const displayError = clientError ?? serverState.error;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const parsed = loginSchema.safeParse({
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
      password: (form.elements.namedItem("password") as HTMLInputElement)?.value,
    });
    if (!parsed.success) {
      event.preventDefault();
      setClientError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setClientError(null);
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 shadow-xl"
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@futscore.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      {displayError && (
        <p className="text-sm text-destructive" role="alert">
          {displayError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}
