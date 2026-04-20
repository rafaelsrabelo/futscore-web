import { Activity, Eye, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";

const METRICS = [
  { label: "Atletas cadastrados", value: "—", icon: Users, hint: "total ativo" },
  { label: "Olheiros", value: "—", icon: Eye, hint: "contas ativas" },
  { label: "Partidas no mês", value: "—", icon: Activity, hint: "finalizadas" },
  { label: "Engajamento", value: "—", icon: TrendingUp, hint: "últimos 7 dias" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do que está acontecendo na plataforma."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(({ label, value, icon: Icon, hint }) => (
          <Card
            key={label}
            className="relative overflow-hidden border-border/60 bg-card/40"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-sm text-muted-foreground">
        Os gráficos e listas do dashboard serão plugados quando a API de
        métricas estiver disponível.
      </div>
    </>
  );
}
