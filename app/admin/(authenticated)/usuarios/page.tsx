import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import { BackendErrorCard } from "@/components/admin/backend-error";
import { EmptyState, PageHeader } from "@/components/admin/page-header";
import { getAdminUsersList } from "@/lib/admin/users";
import type { AdminUserRoleFilter } from "@/lib/admin/types";
import { Pagination } from "./pagination";
import { RoleFilter } from "./role-filter";
import { SearchInput } from "./search-input";
import { UserRow, UsersTableHeader } from "./user-row";

const PAGE_SIZE = 20;

interface SearchParams {
  q?: string;
  role?: string;
  page?: string;
}

const ROLE_VALUES = new Set<string>(["ATHLETE", "OBSERVER", "none"]);

function normalizeRole(value: string | undefined): AdminUserRoleFilter | "" {
  const v = (value ?? "").trim();
  if (!ROLE_VALUES.has(v)) return "";
  return v as AdminUserRoleFilter;
}

function buildApiQuery({
  q,
  role,
  page,
}: {
  q: string;
  role: AdminUserRoleFilter | "";
  page: number;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  return params.toString();
}

function buildBaseSearch({
  q,
  role,
}: {
  q: string;
  role: AdminUserRoleFilter | "";
}): URLSearchParams {
  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (role) base.set("role", role);
  return base;
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const role = normalizeRole(sp.role);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const result = await getAdminUsersList(buildApiQuery({ q, role, page }));

  if (result.kind === "auth-error") {
    redirect("/admin/login");
  }

  const baseSearch = buildBaseSearch({ q, role });
  const hasFilter = q !== "" || role !== "";

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Atletas, olheiros e contas sem role. Use a busca e o filtro para navegar."
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <SearchInput defaultValue={q} />
        <RoleFilter active={role} />
      </div>

      {result.kind !== "ok" ? (
        <BackendErrorCard
          result={result}
          resourceLabel="Usuários"
          notFoundHint="Endpoint GET /admin/users não encontrado. Confirme se o deploy do BE-USERS subiu."
        />
      ) : result.data.items.length === 0 ? (
        <EmptyState
          icon={<UserCog className="w-6 h-6" />}
          title={
            hasFilter ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"
          }
          description={
            hasFilter
              ? "Tente ajustar a busca ou limpar o filtro de role."
              : "Volte quando novos usuários forem cadastrados."
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
            <UsersTableHeader />
            <div>
              {result.data.items.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          </div>
          <Pagination
            page={result.data.pagination.page}
            totalPages={result.data.pagination.totalPages}
            total={result.data.pagination.total}
            baseSearch={baseSearch}
            pathname="/admin/usuarios"
          />
        </>
      )}
    </>
  );
}
