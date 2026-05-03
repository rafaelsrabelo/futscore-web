"use client";

import { Check, Copy, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
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
import { resetAthletePasswordAction } from "@/lib/admin/actions";

export function ResetPasswordButton({
  athleteId,
  athleteName,
}: {
  athleteId: string;
  athleteName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setPassword("");
    setConfirm("");
    setShow(false);
    setError(null);
    setSavedPassword(null);
    setCopied(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    startTransition(async () => {
      const result = await resetAthletePasswordAction(athleteId, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedPassword(password);
      setPassword("");
      setConfirm("");
    });
  }

  async function handleCopy() {
    if (!savedPassword) return;
    try {
      await navigator.clipboard.writeText(savedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback silently
    }
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
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setOpen(true)}
      >
        <KeyRound className="w-3.5 h-3.5" />
        Redefinir senha
      </Button>

      <DialogContent className="sm:max-w-md">
        {savedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Senha alterada</DialogTitle>
              <DialogDescription>
                Sessões em outros dispositivos foram invalidadas. O atleta
                vai precisar logar de novo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <Label className="text-xs text-muted-foreground font-medium">
                Nova senha de {athleteName}
              </Label>
              <div className="flex items-stretch gap-2">
                <code className="flex-1 rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm font-mono break-all">
                  {savedPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copiar senha"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-amber-500">
                Você não verá mais essa senha. Copie agora e envie pelo canal
                seguro combinado com o atleta.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Redefinir senha</DialogTitle>
              <DialogDescription>
                Define uma nova senha para <strong>{athleteName}</strong>.
                Não há e-mail automático — você precisa avisar o atleta.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="rp-password"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    id="rp-password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Esconder senha" : "Mostrar senha"}
                  >
                    {show ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="rp-confirm"
                  className="text-xs text-muted-foreground font-medium"
                >
                  Confirmar senha
                </Label>
                <Input
                  id="rp-confirm"
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                A senha precisa ter entre 8 e 128 caracteres. Os refresh
                tokens do atleta serão invalidados.
              </p>

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
                  {pending ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
