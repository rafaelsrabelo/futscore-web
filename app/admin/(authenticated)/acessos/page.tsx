import { KeyRound } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/admin/page-header";

export default function AcessosPage() {
  return (
    <>
      <PageHeader
        title="Acessos"
        description="Usuários administrativos, papéis e permissões."
      />
      <EmptyState
        icon={<KeyRound className="w-6 h-6" />}
        title="Controle de acessos em construção"
        description="A gestão de usuários admin e papéis aparece aqui quando o endpoint de RBAC estiver disponível."
      />
    </>
  );
}
