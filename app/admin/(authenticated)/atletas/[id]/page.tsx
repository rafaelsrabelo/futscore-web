import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar,
  Footprints,
  MailCheck,
  MailWarning,
  MapPin,
  Ruler,
  Scale,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { API_URL, fetchAuthed } from "@/lib/admin/api";
import type {
  AdminAthleteDetail,
  AdminAthleteDetailProfile,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

const GENDER_LABELS: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

const FOOT_LABELS: Record<string, string> = {
  LEFT: "Canhoto",
  RIGHT: "Destro",
};

const PLAY_TYPE_LABELS: Record<string, string> = {
  GOAL: "Gols",
  ASSIST: "Assistências",
  DIFFICULT_SAVE: "Defesas difíceis",
  EASY_SAVE: "Defesas fáceis",
  PASS: "Passes",
  KEY_PASS: "Passes decisivos",
  DRIBBLE: "Dribles",
  TACKLE: "Desarmes",
  INTERCEPTION: "Interceptações",
  FOUL_COMMITTED: "Faltas cometidas",
  FOUL_RECEIVED: "Faltas sofridas",
  YELLOW_CARD: "Cartões amarelos",
  RED_CARD: "Cartões vermelhos",
  HEADER: "Cabeceios",
  SHOT_ON_TARGET: "Finalizações no alvo",
  SHOT_OFF_TARGET: "Finalizações fora",
  BEST_MOMENTS: "Melhores momentos",
};

function ageFromBirth(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const age = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );
  return Number.isFinite(age) && age > 0 ? age : null;
}

function heightInCm(height: number): number {
  if (!Number.isFinite(height) || height <= 0) return 0;
  return height < 3 ? Math.round(height * 100) : Math.round(height);
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

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type FetchResult =
  | { kind: "ok"; data: AdminAthleteDetail }
  | { kind: "auth-error"; status: 401 | 403 }
  | { kind: "not-found" }
  | { kind: "http-error"; status: number; url: string }
  | { kind: "network-error"; url: string };

async function fetchAthleteDetail(id: string): Promise<FetchResult> {
  const path = `/admin/athletes/${id}`;
  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetchAuthed(path, { cache: "no-store" });
  } catch (err) {
    console.error("[atleta-detail] network error", { url, err });
    return { kind: "network-error", url };
  }
  if (res.status === 401 || res.status === 403) {
    return { kind: "auth-error", status: res.status as 401 | 403 };
  }
  if (res.status === 404) {
    return { kind: "not-found" };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[atleta-detail] GET not ok", {
      status: res.status,
      url,
      body: body.slice(0, 300),
    });
    return { kind: "http-error", status: res.status, url };
  }
  const data = (await res.json()) as AdminAthleteDetail;
  return { kind: "ok", data };
}

export default async function AtletaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchAthleteDetail(id);

  if (result.kind === "auth-error") redirect("/admin/login");
  if (result.kind === "not-found") notFound();

  if (result.kind !== "ok") {
    return <BackendError result={result} />;
  }

  const { profile, address, user, counts, playsByType, subscription } =
    result.data;

  return (
    <>
      <Link
        href="/admin/atletas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para atletas
      </Link>

      <AthleteHeader profile={profile} user={user} />

      <div className="mt-6 border-b border-border/60">
        <nav className="flex gap-6">
          <TabLink href={`/admin/atletas/${id}`} active>
            Visão geral
          </TabLink>
          <TabLink
            href={`/admin/atletas/${id}/partidas`}
            disabled
            badge={counts.matches}
          >
            Partidas
          </TabLink>
          <TabLink href={`/admin/atletas/${id}/lances`} disabled badge={counts.plays}>
            Lances
          </TabLink>
        </nav>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        <CountCard
          icon={<Calendar className="w-4 h-4" />}
          label="Partidas"
          value={counts.matches}
        />
        <CountCard
          icon={<Activity className="w-4 h-4" />}
          label="Lances"
          value={counts.plays}
        />
        <CountCard
          icon={<Trophy className="w-4 h-4" />}
          label="Conquistas"
          value={counts.achievements}
        />
        <CountCard
          icon={<Users className="w-4 h-4" />}
          label="Histórico de times"
          value={counts.teamHistory}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <ProfileSection profile={profile} user={user} />
        <div className="space-y-4">
          <AccountSection user={user} />
          {subscription && <SubscriptionSection subscription={subscription} />}
          {address && <AddressSection address={address} />}
        </div>
      </div>

      {playsByType && Object.keys(playsByType).length > 0 && (
        <PlaysByTypeSection plays={playsByType} />
      )}
    </>
  );
}

function AthleteHeader({
  profile,
  user,
}: {
  profile: AdminAthleteDetailProfile;
  user: AdminAthleteDetail["user"];
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
  children: React.ReactNode;
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

function TabLink({
  href,
  children,
  active,
  disabled,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
}) {
  const className = cn(
    "inline-flex items-center gap-2 px-1 py-2.5 text-sm border-b-2 -mb-px transition-colors",
    active
      ? "border-primary text-foreground font-medium"
      : "border-transparent text-muted-foreground",
    disabled && "opacity-50 pointer-events-none"
  );
  const content = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0.5">
          {badge}
        </span>
      )}
      {disabled && (
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
          em breve
        </span>
      )}
    </>
  );
  if (disabled) return <span className={className}>{content}</span>;
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function CountCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="text-2xl font-bold mt-1.5">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card/50 p-5",
        className
      )}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h2>
      {children}
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

function ProfileSection({
  profile,
  user,
}: {
  profile: AdminAthleteDetailProfile;
  user: AdminAthleteDetail["user"];
}) {
  const age = profile.age ?? ageFromBirth(profile.birthDate);
  const heightCm = heightInCm(profile.height);
  const supportItems = [
    profile.hasNutritionist && "Nutricionista",
    profile.hasPsychologist && "Psicólogo",
    profile.hasPersonalTrainer && "Personal",
  ].filter(Boolean) as string[];

  return (
    <Section title="Perfil do atleta" className="lg:col-span-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Row label="Nome" value={user.name} />
        {profile.nickname && <Row label="Nickname" value={`@${profile.nickname}`} />}
        <Row
          label="Idade"
          value={age != null ? `${age} anos` : "—"}
          icon={<Calendar className="w-3 h-3" />}
        />
        <Row label="Data de nascimento" value={formatDate(profile.birthDate)} />
        <Row
          label="Gênero"
          value={GENDER_LABELS[profile.gender] ?? profile.gender}
        />
        <Row
          label="Posição principal"
          value={POSITION_LABELS[profile.primaryPosition] ?? profile.primaryPosition}
        />
        <Row
          label="Posição secundária"
          value={
            profile.secondaryPosition
              ? POSITION_LABELS[profile.secondaryPosition] ?? profile.secondaryPosition
              : "—"
          }
        />
        <Row
          label="Perna dominante"
          value={FOOT_LABELS[profile.dominantFoot] ?? profile.dominantFoot}
          icon={<Footprints className="w-3 h-3" />}
        />
        <Row
          label="Altura"
          value={heightCm ? `${heightCm} cm` : "—"}
          icon={<Ruler className="w-3 h-3" />}
        />
        <Row
          label="Peso"
          value={profile.weight ? `${profile.weight} kg` : "—"}
          icon={<Scale className="w-3 h-3" />}
        />
        <Row label="Clube atual" value={profile.currentClub || "—"} />
        <Row label="CPF" value={profile.cpf || "—"} />
        <Row
          label="Empresário"
          value={
            profile.hasManager
              ? profile.managerName ||
                profile.managerCompany ||
                profile.managerContact ||
                "Sim"
              : "Não"
          }
        />
        <Row
          label="Equipe de apoio"
          value={supportItems.length ? supportItems.join(" · ") : "—"}
        />
        <Row label="Cadastrado em" value={formatDate(profile.createdAt)} />
      </div>

      {profile.biography && (
        <div className="mt-4 pt-4 border-t border-border/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Biografia
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.biography}
          </p>
        </div>
      )}

      {(profile.instagramUrl || profile.twitterUrl || profile.youtubeUrl) && (
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
          {profile.instagramUrl && (
            <ExternalPill href={profile.instagramUrl} label="Instagram" />
          )}
          {profile.twitterUrl && (
            <ExternalPill href={profile.twitterUrl} label="Twitter" />
          )}
          {profile.youtubeUrl && (
            <ExternalPill href={profile.youtubeUrl} label="YouTube" />
          )}
        </div>
      )}
    </Section>
  );
}

function ExternalPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
    >
      {label}
    </a>
  );
}

function AccountSection({
  user,
}: {
  user: AdminAthleteDetail["user"];
}) {
  return (
    <Section title="Conta">
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
      />
      <Row label="Função" value={user.role} />
      <Row label="Status" value={user.isActive ? "Ativo" : "Inativo"} />
      <Row label="Último login" value={formatDate(user.lastLoginAt)} />
      <Row label="Cadastrado em" value={formatDate(user.createdAt)} />
    </Section>
  );
}

function SubscriptionSection({
  subscription,
}: {
  subscription: NonNullable<AdminAthleteDetail["subscription"]>;
}) {
  return (
    <Section title="Assinatura">
      <Row
        label="Plano"
        value={
          <span className="inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            {subscription.planName}
            {subscription.planIsUnlimited && (
              <span className="text-[9px] uppercase tracking-wider bg-primary/15 text-primary rounded px-1.5 py-0.5">
                Ilimitado
              </span>
            )}
          </span>
        }
      />
      <Row
        label="Valor"
        value={formatMoney(subscription.planPrice, subscription.planCurrency)}
      />
      <Row label="Status" value={subscription.status} />
      <Row
        label="Renovação"
        value={formatDate(subscription.currentPeriodEnd)}
      />
    </Section>
  );
}

function AddressSection({
  address,
}: {
  address: NonNullable<AdminAthleteDetail["address"]>;
}) {
  return (
    <Section title="Endereço">
      <div className="flex items-start gap-2 text-sm">
        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-muted-foreground leading-relaxed">
          <div>
            {address.street}, {address.number}
            {address.complement ? ` — ${address.complement}` : ""}
          </div>
          <div>
            {address.district} · {address.city} / {address.state}
          </div>
          <div>
            CEP {address.zipCode} · {address.country}
          </div>
        </div>
      </div>
    </Section>
  );
}

function PlaysByTypeSection({ plays }: { plays: Record<string, number> }) {
  const sorted = Object.entries(plays)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-border/60 bg-card/50 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Lances por tipo
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {sorted.map(([type, count]) => (
          <div
            key={type}
            className="rounded-lg border border-border/60 bg-background/40 p-3 text-center"
          >
            <div className="text-2xl font-bold bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
              {count}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {PLAY_TYPE_LABELS[type] ?? type}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BackendError({
  result,
}: {
  result: Extract<FetchResult, { kind: "http-error" } | { kind: "network-error" }>;
}) {
  const isHttp = result.kind === "http-error";
  const title = isHttp
    ? `Falha ao carregar atleta (HTTP ${result.status})`
    : "Falha ao conectar com a API";
  const hint =
    isHttp && result.status === 404
      ? "Endpoint GET /admin/athletes/:id não encontrado. Confirme se BE-08 subiu em produção."
      : isHttp && result.status >= 500
        ? "A API retornou erro interno. Pode ser cold start do Render — tente novamente em alguns segundos."
        : "Verifique a variável API_URL e se o backend está acessível.";

  return (
    <>
      <Link
        href="/admin/atletas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para atletas
      </Link>
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
    </>
  );
}
