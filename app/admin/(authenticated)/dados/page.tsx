import { PageHeader } from "@/components/admin/page-header";
import { ExportCard } from "./export-card";
import { ImportCard } from "./import-card";

export default function DadosPage() {
  return (
    <>
      <PageHeader
        title="Dados"
        description="Exporte a base de atletas em planilha ou importe novos atletas em massa via CSV."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <ExportCard />
        <ImportCard />
      </div>
    </>
  );
}
