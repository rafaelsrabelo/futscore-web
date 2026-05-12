import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { getAdminNotifications } from "@/lib/admin/notifications";
import { NotificationRow } from "./notification-row";
import { Pagination } from "./pagination";

const PAGE_SIZE = 20;

interface SearchParams {
  page?: string;
}

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const apiQuery = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  }).toString();

  const result = await getAdminNotifications(apiQuery);

  if (result.kind === "auth-error") {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHeader
        title="Notificações"
        description="Histórico de envios e composer de novas notificações push."
        action={
          <Button asChild>
            <Link href="/admin/notificacoes/nova">
              <Plus className="w-4 h-4" />
              Nova notificação
            </Link>
          </Button>
        }
      />

      {result.kind !== "ok" ? (
        <BackendError result={result} />
      ) : result.data.items.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="Nenhuma notificação enviada ainda"
          description="Crie a primeira notificação push para o app."
        />
      ) : (
        <div className="border border-border/60 rounded-lg overflow-hidden bg-card/30">
          <div className="grid grid-cols-12 gap-3 items-center px-4 py-2 border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="col-span-2">Quando</span>
            <span className="col-span-5">Título / mensagem</span>
            <span className="col-span-3">Audiência</span>
            <span className="col-span-1 text-right">Recebem</span>
            <span className="col-span-1 text-right">Resultado</span>
          </div>
          {result.data.items.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {result.kind === "ok" && result.data.items.length > 0 && (
        <Pagination
          page={result.data.page}
          pageSize={result.data.pageSize}
          total={result.data.total}
          hasMore={result.data.hasMore}
          baseSearch={new URLSearchParams()}
          pathname="/admin/notificacoes"
        />
      )}
    </>
  );
}

function BackendError({
  result,
}: {
  result:
    | { kind: "http-error"; status: number; url: string }
    | { kind: "network-error"; url: string };
}) {
  const isHttp = result.kind === "http-error";
  const title = isHttp
    ? `Falha ao carregar histórico (HTTP ${result.status})`
    : "Falha ao conectar com a API";
  const hint =
    isHttp && result.status === 404
      ? "A rota GET /admin/notifications respondeu 404. Confirme se o backend de push está em produção."
      : isHttp && result.status >= 500
        ? "A API retornou erro interno. Tente novamente em alguns segundos."
        : "Verifique a variável de ambiente API_URL e se o backend está acessível.";

  return (
    <div className="border-2 border-dashed border-destructive/40 rounded-xl bg-destructive/5 py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3 text-destructive">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
      <code className="mt-3 text-[11px] text-muted-foreground bg-card/60 border border-border/60 rounded px-2 py-1 break-all max-w-full">
        {result.url}
      </code>
    </div>
  );
}
