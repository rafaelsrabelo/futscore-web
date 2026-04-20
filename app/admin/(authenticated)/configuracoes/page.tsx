import { Settings } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/admin/page-header";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Preferências da conta e da organização."
      />
      <EmptyState
        icon={<Settings className="w-6 h-6" />}
        title="Em breve"
        description="Aqui ficarão dados da conta, integrações, branding e controles por workspace."
      />
    </>
  );
}
