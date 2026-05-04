import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type {
  AdminActivePlan,
  AdminUserListItem,
  AdminUserRole,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<AdminUserRole, string> = {
  ATHLETE: "Atleta",
  OBSERVER: "Olheiro",
};

const GRID_TEMPLATE =
  "grid grid-cols-[2.5rem_minmax(0,2fr)_minmax(0,1fr)_5.5rem_5rem_4.5rem_7rem_1rem] items-center gap-x-3 px-4";

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

function formatDate(iso: string | null): string {
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

export function UsersTableHeader() {
  return (
    <div
      className={cn(
        GRID_TEMPLATE,
        "py-2 border-b border-border/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      )}
    >
      <span />
      <span>Nome</span>
      <span>CPF</span>
      <span>Role</span>
      <span>Plano</span>
      <span>Status</span>
      <span>Último login</span>
      <span />
    </div>
  );
}

export function UserRow({ user }: { user: AdminUserListItem }) {
  return (
    <Link
      href={`/admin/usuarios/${user.id}`}
      className={cn(
        GRID_TEMPLATE,
        "py-3 border-b border-border/40 last:border-b-0 hover:bg-accent/30 transition-colors"
      )}
    >
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
        {initialsOf(user.name)}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{user.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {user.email}
        </div>
      </div>
      <div className="text-xs text-muted-foreground truncate">
        {formatCpf(user.cpf)}
      </div>
      <RoleChip role={user.role} />
      <PlanChip plan={user.activePlan} />
      <StatusChip isActive={user.isActive} />
      <div className="text-xs text-muted-foreground">
        {formatDate(user.lastLoginAt)}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

function RoleChip({ role }: { role: AdminUserRole | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider w-fit">
        Sem role
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider w-fit">
      {ROLE_LABELS[role]}
    </span>
  );
}

function PlanChip({ plan }: { plan: AdminActivePlan }) {
  if (plan === "PREMIUM") {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider w-fit">
        Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider w-fit">
      Free
    </span>
  );
}

function StatusChip({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider w-fit",
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
