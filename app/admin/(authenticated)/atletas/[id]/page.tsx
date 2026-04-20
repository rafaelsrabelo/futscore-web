import {
  Activity,
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
import { getAdminAthleteDetail } from "@/lib/admin/athletes";
import type {
  AdminAthleteDetail,
  AdminAthleteDetailProfile,
  AdminAthleteDetailUser,
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

export default async function AtletaOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminAthleteDetail(id);

  // Layout já trata auth-error, not-found e http-error. Se chegou aqui sem ok
  // (edge), renderiza nada pra não duplicar erro.
  if (result.kind !== "ok") return null;

  const { profile, address, user, counts, playsByType, subscription } =
    result.data;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
  user: AdminAthleteDetailUser;
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
        {profile.nickname && (
          <Row label="Nickname" value={`@${profile.nickname}`} />
        )}
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
          value={
            POSITION_LABELS[profile.primaryPosition] ?? profile.primaryPosition
          }
        />
        <Row
          label="Posição secundária"
          value={
            profile.secondaryPosition
              ? POSITION_LABELS[profile.secondaryPosition] ??
                profile.secondaryPosition
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

function AccountSection({ user }: { user: AdminAthleteDetailUser }) {
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
