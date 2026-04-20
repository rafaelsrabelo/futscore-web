import { Eye } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/admin/page-header";

export default function OlheirosPage() {
  return (
    <>
      <PageHeader
        title="Olheiros"
        description="Aprove cadastros e acompanhe a atividade dos observadores."
      />
      <EmptyState
        icon={<Eye className="w-6 h-6" />}
        title="Listagem em construção"
        description="Cards e filtros dos olheiros serão conectados assim que o endpoint admin estiver disponível."
      />
    </>
  );
}
