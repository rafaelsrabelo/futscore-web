import {
  ArrowLeft,
  Award,
  Eye,
  IdCard,
  Mail,
  MailCheck,
  MailWarning,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { Button } from "@/components/ui/button";
import { getAdminUserDetail } from "@/lib/admin/users";
import type {
  AdminActivePlan,
  AdminUserDetailUser,
  AdminUserRole,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { EditUserDialog } from "./edit-user-dialog";
import { ResetUserPasswordButton } from "./reset-password-button";

const ROLE_LABELS: Record<AdminUserRole, string> = {
  ATHLETE: "Atleta",
  OBSERVER: "Olheiro",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatCpf(cpf: string | null): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default async function UsuarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminUserDetail(id);

  if (result.kind === "auth-error") redirect("/admin/login");
  if (result.kind === "not-found") notFound();

  if (result.kind !== "ok") {
    return (
      <>
        <BackLink />
        <BackendErrorCard
          result={result}
          resourceLabel="Usuário"
          notFoundHint="Endpoint GET /admin/users/:id não encontrado. Confirme se o deploy do BE-USERS subiu."
        />
      </>
    );
  }

  const { user, athleteProfileId, observerProfileId, activePlan } = result.data;

  return (
    <>
      <BackLink />
      <UserHeader
        userId={id}
        user={user}
        athleteProfileId={athleteProfileId}
        observerProfileId={observerProfileId}
        activePlan={activePlan}
        initial={result.data}
      />
      <AccountCard user={user} />
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/usuarios"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar para usuários
    </Link>
  );
}

function UserHeader({
  userId,
  user,
  athleteProfileId,
  observerProfileId,
  activePlan,
  initial,
}: {
  userId: string;
  user: AdminUserDetailUser;
  athleteProfileId: string | null;
  observerProfileId: string | null;
  activePlan: AdminActivePlan;
  initial: Parameters<typeof EditUserDialog>[0]["initial"];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-border/60 bg-card/50 mb-6">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground ring-2 ring-primary/20 shrink-0">
        {initialsOf(user.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold truncate">{user.name}</h1>
          <StatusBadge isActive={user.isActive} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          <RolePill role={user.role} />
          <PlanPill plan={activePlan} />
          {user.isImported && (
            <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-1 font-medium">
              Importado
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center flex flex-wrap gap-2">
        <EditUserDialog userId={userId} initial={initial} />
        <ResetUserPasswordButton userId={userId} userName={user.name} />
        {athleteProfileId ? (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/admin/atletas/${athleteProfileId}`}>
              <UserCog className="w-3.5 h-3.5" />
              Ver perfil de atleta
            </Link>
          </Button>
        ) : null}
        {observerProfileId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled
            title="A tela de detalhe de olheiro ainda não está disponível."
          >
            <Eye className="w-3.5 h-3.5" />
            Ver perfil de olheiro
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        isActive
          ? "bg-primary/15 text-primary"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isActive ? "bg-primary" : "bg-muted-foreground/50"
        )}
      />
      {isActive ? "Ativo" : "Inativo"}
    </span>
  );
}

function RolePill({ role }: { role: AdminUserRole | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-1 font-medium">
        Sem role
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-2.5 py-1 font-medium">
      {ROLE_LABELS[role]}
    </span>
  );
}

function PlanPill({ plan }: { plan: AdminActivePlan }) {
  if (plan === "PREMIUM") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 px-2.5 py-1 font-bold uppercase tracking-wider">
        <Award className="w-3 h-3" />
        Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-1 font-medium uppercase tracking-wider">
      Free
    </span>
  );
}

function AccountCard({ user }: { user: AdminUserDetailUser }) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Conta
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Row label="Nome" value={user.name} />
        <Row
          label="E-mail"
          value={
            <span className="inline-flex items-center gap-1.5">
              {user.emailVerified ? (
                <MailCheck className="w-3.5 h-3.5 text-primary" />
              ) : (
                <MailWarning className="w-3.5 h-3.5 text-amber-500" />
              )}
              {user.email}
            </span>
          }
          icon={<Mail className="w-3 h-3" />}
        />
        <Row
          label="CPF"
          value={formatCpf(user.cpf)}
          icon={<IdCard className="w-3 h-3" />}
        />
        <Row
          label="Role"
          value={user.role ? ROLE_LABELS[user.role] : "Sem role"}
        />
        <Row
          label="Status"
          value={user.isActive ? "Ativo" : "Inativo"}
          icon={<ShieldCheck className="w-3 h-3" />}
        />
        <Row
          label="E-mail verificado"
          value={user.emailVerified ? "Sim" : "Não"}
        />
        <Row label="Importado" value={user.isImported ? "Sim" : "Não"} />
        <Row label="Provider" value={user.provider} />
        <Row label="Último login" value={formatDate(user.lastLoginAt)} />
        <Row label="Cadastrado em" value={formatDate(user.createdAt)} />
        <Row label="Atualizado em" value={formatDate(user.updatedAt)} />
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border/40 last:border-b-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium text-right break-words max-w-[70%]">
        {value}
      </div>
    </div>
  );
}
