import { AlertTriangle } from "lucide-react";

interface Result {
  kind: "not-found" | "http-error" | "network-error";
  status?: number;
  url?: string;
}

/**
 * Card padrão para falhas de fetch admin: 404, 5xx, rede, ou endpoint ainda
 * não deployado. Mostra título, dica contextual e a URL tentada.
 */
export function BackendErrorCard({
  result,
  resourceLabel,
  notFoundHint,
}: {
  result: Result;
  resourceLabel: string;
  notFoundHint: string;
}) {
  const status = result.status;
  const is404 = result.kind === "not-found" || status === 404;

  const title =
    result.kind === "network-error"
      ? "Falha ao conectar com a API"
      : is404
        ? `${resourceLabel}: não encontrado${status ? ` (HTTP ${status})` : ""}`
        : `Falha ao carregar ${resourceLabel.toLowerCase()} (HTTP ${status ?? "?"})`;

  const hint = is404
    ? notFoundHint
    : result.kind === "network-error"
      ? "Verifique a variável API_URL e se o backend está acessível."
      : status && status >= 500
        ? "Erro interno da API. Pode ser cold start do Render — tente novamente em alguns segundos."
        : "A API retornou erro. Tente novamente em instantes.";

  return (
    <div className="border-2 border-dashed border-destructive/40 rounded-xl bg-destructive/5 py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3 text-destructive">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
      {result.url && (
        <code className="mt-3 text-[11px] text-muted-foreground bg-card/60 border border-border/60 rounded px-2 py-1 break-all max-w-full">
          {result.url}
        </code>
      )}
    </div>
  );
}
