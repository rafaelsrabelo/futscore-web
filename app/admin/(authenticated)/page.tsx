import {
  Activity,
  AlertCircle,
  Eye,
  Trophy,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { InactivityChart } from "@/components/admin/charts/inactivity-chart";
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart";
import { PageHeader } from "@/components/admin/page-header";
import { PeriodToggle } from "@/components/admin/period-toggle";
import {
  getDashboardInactivityBuckets,
  getDashboardOverview,
  getDashboardUserActivity,
  getDashboardUserGrowth,
} from "@/lib/admin/dashboard";
import type {
  DashboardGrowthPeriod,
  DashboardOverview,
  DashboardUserActivity,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

interface SearchParams {
  periodDays?: string;
  growthPeriod?: string;
}

const PERIOD_OPTIONS = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
];

const GROWTH_OPTIONS = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

function parsePeriodDays(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "30", 10);
  return Number.isFinite(n) && n > 0 && n <= 365 ? n : 30;
}

function parseGrowthPeriod(raw: string | undefined): DashboardGrowthPeriod {
  if (raw === "weekly" || raw === "monthly") return raw;
  return "daily";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const periodDays = parsePeriodDays(sp.periodDays);
  const growthPeriod = parseGrowthPeriod(sp.growthPeriod);

  const [overview, growth, activity, inactivity] = await Promise.all([
    getDashboardOverview(periodDays),
    getDashboardUserGrowth(growthPeriod),
    getDashboardUserActivity(),
    getDashboardInactivityBuckets(),
  ]);

  if (
    overview.kind === "auth-error" ||
    growth.kind === "auth-error" ||
    activity.kind === "auth-error" ||
    inactivity.kind === "auth-error"
  ) {
    redirect("/admin/login");
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da plataforma em tempo quase real."
        action={
          <PeriodToggle
            paramName="periodDays"
            activeValue={String(periodDays)}
            options={PERIOD_OPTIONS}
            ariaLabel="Período"
          />
        }
      />

      <OverviewSection result={overview} periodDays={periodDays} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card/50 p-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Crescimento de usuários
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Novos cadastros por período.
              </p>
            </div>
            <PeriodToggle
              paramName="growthPeriod"
              activeValue={growthPeriod}
              options={GROWTH_OPTIONS}
              ariaLabel="Agregação"
            />
          </div>
          <GrowthSection result={growth} period={growthPeriod} />
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Atividade de usuários
          </h2>
          <ActivitySection result={activity} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Retenção
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distribuição de usuários por tempo desde o último login.
            </p>
          </div>
        </div>
        <InactivitySection result={inactivity} />
      </div>
    </>
  );
}

function OverviewSection({
  result,
  periodDays,
}: {
  result: Awaited<ReturnType<typeof getDashboardOverview>>;
  periodDays: number;
}) {
  if (result.kind === "auth-error") return null;
  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Visão geral"
        notFoundHint="Endpoint GET /admin/dashboard/overview ainda não deployado (BE-17)."
      />
    );
  }
  return <OverviewCards data={result.data} periodDays={periodDays} />;
}

function OverviewCards({
  data,
  periodDays,
}: {
  data: DashboardOverview;
  periodDays: number;
}) {
  const { totals, period } = data;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={<Users className="w-4 h-4" />}
        label="Atletas"
        value={formatNumber(totals.athletes)}
        delta={period.newAthletes}
        periodDays={periodDays}
      />
      <MetricCard
        icon={<Eye className="w-4 h-4" />}
        label="Olheiros"
        value={formatNumber(totals.observers)}
        delta={period.newObservers}
        periodDays={periodDays}
      />
      <MetricCard
        icon={<Activity className="w-4 h-4" />}
        label="Partidas"
        value={formatNumber(totals.matches)}
        delta={period.newMatches}
        periodDays={periodDays}
      />
      <MetricCard
        icon={<TrendingUp className="w-4 h-4" />}
        label="Lances"
        value={formatNumber(totals.plays)}
        delta={period.newPlays}
        periodDays={periodDays}
      />
      {totals.achievements != null && (
        <MetricCard
          icon={<Trophy className="w-4 h-4" />}
          label="Conquistas"
          value={formatNumber(totals.achievements)}
        />
      )}
      <MetricCard
        icon={<UserPlus className="w-4 h-4" />}
        label="Assinaturas ativas"
        value={formatNumber(totals.activeSubscriptions)}
        accent
      />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  periodDays,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  delta?: number;
  periodDays?: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-2xl font-bold mt-1.5">{value}</div>
      {delta != null && periodDays != null && (
        <div
          className={cn(
            "text-xs mt-1",
            delta > 0 ? "text-primary" : "text-muted-foreground"
          )}
        >
          {delta > 0 ? "+" : ""}
          {formatNumber(delta)} nos últimos {periodDays}d
        </div>
      )}
    </div>
  );
}

function GrowthSection({
  result,
  period,
}: {
  result: Awaited<ReturnType<typeof getDashboardUserGrowth>>;
  period: DashboardGrowthPeriod;
}) {
  if (result.kind === "auth-error") return null;
  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Crescimento"
        notFoundHint="Endpoint GET /admin/dashboard/user-growth ainda não deployado (BE-18)."
      />
    );
  }
  return <UserGrowthChart series={result.data.series} period={period} />;
}

function ActivitySection({
  result,
}: {
  result: Awaited<ReturnType<typeof getDashboardUserActivity>>;
}) {
  if (result.kind === "auth-error") return null;
  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Atividade"
        notFoundHint="Endpoint GET /admin/dashboard/user-activity ainda não deployado (BE-19)."
      />
    );
  }
  return <ActivityPanel data={result.data} />;
}

function ActivityPanel({ data }: { data: DashboardUserActivity }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-3xl font-bold bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
            {data.activePercent30d.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            ativos nos últimos 30 dias
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{formatNumber(data.total)}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            total
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <ActivityBar
          label="Últimos 7 dias"
          value={data.activeLast7d}
          total={data.total}
        />
        <ActivityBar
          label="Últimos 30 dias"
          value={data.activeLast30d}
          total={data.total}
        />
        <ActivityBar
          label="Últimos 90 dias"
          value={data.activeLast90d}
          total={data.total}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
        <MiniStat
          label="Inativos 30d+"
          value={data.inactiveOver30d}
          tone="warn"
        />
        <MiniStat
          label="Inativos 90d+"
          value={data.inactiveOver90d}
          tone="danger"
        />
      </div>

      {data.neverLoggedIn > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            <strong>{formatNumber(data.neverLoggedIn)}</strong> usuário
            {data.neverLoggedIn === 1 ? "" : "s"} nunca logaram.
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {formatNumber(value)}{" "}
          <span className="text-muted-foreground font-normal">
            ({pct.toFixed(1)}%)
          </span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warn" | "danger";
}) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <div
        className={cn(
          "text-sm font-bold",
          tone === "warn" ? "text-amber-500" : "text-destructive"
        )}
      >
        {formatNumber(value)}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

function InactivitySection({
  result,
}: {
  result: Awaited<ReturnType<typeof getDashboardInactivityBuckets>>;
}) {
  if (result.kind === "auth-error") return null;
  if (result.kind !== "ok") {
    return (
      <BackendErrorCard
        result={result}
        resourceLabel="Retenção"
        notFoundHint="Endpoint GET /admin/dashboard/inactivity-buckets ainda não deployado (BE-20)."
      />
    );
  }
  return <InactivityChart buckets={result.data.buckets} />;
}
