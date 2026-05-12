import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { NotificationForm } from "./notification-form";

export default function NovaNotificacaoPage() {
  return (
    <>
      <Link
        href="/admin/notificacoes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Voltar para histórico
      </Link>

      <PageHeader
        title="Nova notificação"
        description="Componha o conteúdo, escolha o público e visualize antes de disparar."
      />

      <NotificationForm />
    </>
  );
}
