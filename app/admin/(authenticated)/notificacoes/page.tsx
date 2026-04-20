import { Bell } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/admin/page-header";

export default function NotificacoesPage() {
  return (
    <>
      <PageHeader
        title="Notificações"
        description="Envie comunicados, campanhas e alertas para o app."
      />
      <EmptyState
        icon={<Bell className="w-6 h-6" />}
        title="Central de notificações em construção"
        description="O composer e histórico de envios serão ligados quando o canal de push estiver exposto pela API."
      />
    </>
  );
}
