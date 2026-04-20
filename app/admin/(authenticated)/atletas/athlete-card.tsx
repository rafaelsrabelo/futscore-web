import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import type { Athlete } from "@/lib/types";
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

function ageFromBirth(birthDate: string | undefined | null): number | null {
  if (!birthDate) return null;
  const age = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000)
  );
  return Number.isFinite(age) && age > 0 ? age : null;
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

export function AthleteCard({ athlete }: { athlete: Athlete }) {
  const age = ageFromBirth(athlete.birthDate);
  const href = `/players/${athlete.nickname ?? athlete.id}`;
  const displayName = athlete.nickname || athlete.user.name;

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
              {age != null && ` · ${age} ANOS`}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {athlete.currentClub || "Sem clube"}
            </span>
          </div>
          {age != null && (
            <span className="text-3xl font-bold leading-none bg-linear-to-br from-primary to-green-400 bg-clip-text text-transparent">
              {age}
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
              {athlete.isPremium && (
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            {athlete.nickname && (
              <span className="text-xs text-muted-foreground truncate block">
                @{athlete.nickname}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-border/60 divide-x divide-border/60">
        <Stat label="ALT" value={String(athlete.height)} unit="cm" />
        <Stat label="PESO" value={String(athlete.weight)} unit="kg" />
        <Stat
          label="PÉ"
          value={FOOT_LABELS[athlete.dominantFoot] ?? "—"}
        />
      </div>

      <Link
        href={href}
        className="flex items-center justify-between px-4 py-3 text-[10px] font-bold tracking-wider text-primary border-t border-border/60 hover:bg-primary/5 transition-colors"
      >
        Ver perfil completo
        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
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
