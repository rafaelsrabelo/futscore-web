import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MailCheck, MailWarning } from "lucide-react";
import type { AdminAthleteListItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const POSITION_LABELS: Record<string, string> = {
  GOALKEEPER: "GOLEIRO",
  DEFENDER: "DEFENSOR",
  MIDFIELDER: "MEIO-CAMPO",
  FORWARD: "ATACANTE",
};

const FOOT_LABELS: Record<string, string> = {
  LEFT: "Canhoto",
  RIGHT: "Destro",
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

/**
 * Admin API manda altura em metros (1.78). Alguns endpoints antigos mandam em cm.
 * Heurística simples: valores < 3 tratamos como metros.
 */
function heightInCm(height: number): number {
  if (!Number.isFinite(height) || height <= 0) return 0;
  return height < 3 ? Math.round(height * 100) : Math.round(height);
}

export function AthleteCard({ athlete }: { athlete: AdminAthleteListItem }) {
  const href = `/admin/atletas/${athlete.id}`;
  const displayName = athlete.nickname || athlete.user.name;
  const heightCm = heightInCm(athlete.height);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/50",
        "transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
              {POSITION_LABELS[athlete.primaryPosition] ??
                athlete.primaryPosition}
              {athlete.age != null && ` · ${athlete.age} ANOS`}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {athlete.currentClub || "Sem clube"}
            </span>
          </div>
          {athlete.age != null && (
            <span className="text-3xl font-bold leading-none bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
              {athlete.age}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted ring-2 ring-primary/20 shrink-0">
            {athlete.profilePhoto ? (
              <Image
                src={athlete.profilePhoto}
                alt={athlete.user.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground text-xs font-semibold">
                {initialsOf(athlete.user.name)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <StatusDot active={athlete.user.isActive} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {athlete.user.emailVerified ? (
                <MailCheck className="w-3 h-3 text-primary shrink-0" />
              ) : (
                <MailWarning className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span className="truncate">{athlete.user.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border/60 divide-x divide-border/60">
        <Stat label="ALT" value={heightCm ? String(heightCm) : "—"} unit={heightCm ? "cm" : undefined} />
        <Stat label="PESO" value={athlete.weight ? String(athlete.weight) : "—"} unit={athlete.weight ? "kg" : undefined} />
        <Stat
          label="PÉ"
          value={FOOT_LABELS[athlete.dominantFoot] ?? "—"}
        />
      </div>

      <Link
        href={href}
        className="flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-wider text-primary border-t border-border/60 hover:bg-primary/5 transition-colors"
      >
        Abrir detalhes
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      title={active ? "Ativo" : "Inativo"}
      className={cn(
        "inline-block w-2 h-2 rounded-full shrink-0",
        active ? "bg-primary" : "bg-muted-foreground/40"
      )}
    />
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="py-3 px-2 flex flex-col items-center text-center">
      <span className="text-[9px] text-muted-foreground font-medium tracking-wider">
        {label}
      </span>
      <span className="text-sm font-bold mt-1">
        {value}
        {unit && (
          <span className="text-[10px] text-muted-foreground ml-0.5 font-normal">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
