import { AlertTriangle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminAthleteDetail } from "@/lib/admin/athletes";
import type {
  AdminAthleteDetailProfile,
  AdminAthleteDetailUser,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { AthleteTabs } from "./tabs";

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
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

function ageFromBirth(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const age = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );
  return Number.isFinite(age) && age > 0 ? age : null;
}

export default async function AthleteDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminAthleteDetail(id);

  if (result.kind === "auth-error") redirect("/admin/login");
  if (result.kind === "not-found") notFound();

  if (result.kind !== "ok") {
    return (
      <>
        <BackLink />
        <BackendError result={result} />
      </>
    );
  }

  const { profile, user, counts } = result.data;

  return (
    <>
      <BackLink />
      <AthleteHeader profile={profile} user={user} />
      <AthleteTabs
        tabs={[
          { href: `/admin/atletas/${id}`, label: "Visão geral" },
          {
            href: `/admin/atletas/${id}/partidas`,
            label: "Partidas",
            badge: counts.matches,
          },
          {
            href: `/admin/atletas/${id}/lances`,
            label: "Lances",
            badge: counts.plays,
          },
          {
            href: `/admin/atletas/${id}/conquistas`,
            label: "Conquistas",
            badge: counts.achievements,
          },
          {
            href: `/admin/atletas/${id}/times`,
            label: "Times",
            badge: counts.teamHistory,
          },
        ]}
      />
      <div className="mt-6">{children}</div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/atletas"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar para atletas
    </Link>
  );
}

function AthleteHeader({
  profile,
  user,
}: {
  profile: AdminAthleteDetailProfile;
  user: AdminAthleteDetailUser;
}) {
  const age = profile.age ?? ageFromBirth(profile.birthDate);
  const displayName = profile.nickname || user.name;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-border/60 bg-card/50">
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 shrink-0">
        {profile.profilePhoto ? (
          <Image
            src={profile.profilePhoto}
            alt={user.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-lg font-semibold text-muted-foreground">
            {initialsOf(user.name)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <StatusBadge isActive={user.isActive} />
        </div>
        {profile.nickname && profile.nickname !== user.name && (
          <p className="text-sm text-muted-foreground">{user.name}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          <Pill>
            {POSITION_LABELS[profile.primaryPosition] ?? profile.primaryPosition}
          </Pill>
          {profile.secondaryPosition && (
            <Pill muted>
              {POSITION_LABELS[profile.secondaryPosition] ??
                profile.secondaryPosition}
            </Pill>
          )}
          {profile.currentClub && <Pill muted>{profile.currentClub}</Pill>}
          {age != null && <Pill muted>{age} anos</Pill>}
        </div>
      </div>
    </div>
  );
}

function Pill({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-medium",
        muted
          ? "bg-muted text-muted-foreground"
          : "bg-primary/15 text-primary"
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
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

function BackendError({
  result,
}: {
  result: {
    kind: "http-error" | "network-error";
    status?: number;
    url: string;
  };
}) {
  const isHttp = result.kind === "http-error";
  const title = isHttp
    ? `Falha ao carregar atleta (HTTP ${result.status})`
    : "Falha ao conectar com a API";
  const hint =
    isHttp && result.status === 404
      ? "Endpoint GET /admin/athletes/:id não encontrado. Confirme se BE-08 subiu em produção."
      : isHttp && (result.status ?? 0) >= 500
        ? "A API retornou erro interno. Pode ser cold start do Render — tente novamente em alguns segundos."
        : "Verifique a variável API_URL e se o backend está acessível.";

  return (
    <div className="border-2 border-dashed border-destructive/40 rounded-xl bg-destructive/5 py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-3 text-destructive">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{hint}</p>
      <code className="mt-3 text-[11px] text-muted-foreground bg-card/60 border border-border/60 rounded px-2 py-1 break-all max-w-full">
        {result.url}
      </code>
    </div>
  );
}
