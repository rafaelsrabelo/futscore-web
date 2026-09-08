import { PlayerSocialLinks } from "@/components/player/player-social-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { positionLabels } from "@/lib/labels";
import type { Athlete } from "@/lib/types";
import {
  Briefcase,
  Brain,
  Calendar,
  Check,
  Footprints,
  Heart,
  Ruler,
  Shield,
  Stethoscope,
  Dumbbell,
} from "lucide-react";

interface PlayerSidebarProps {
  athlete: Athlete;
  age: number | null;
}

const personalInfoRows = (athlete: Athlete, age: number | null) => [
  age !== null && {
    icon: Calendar,
    label: "Idade",
    value: `${age} anos`,
  },
  {
    icon: Ruler,
    label: "Altura",
    value: `${athlete.height}cm`,
  },
  {
    icon: Footprints,
    label: "Peso",
    value: `${athlete.weight}kg`,
  },
  {
    icon: Footprints,
    label: "Pé dominante",
    value:
      athlete.dominantFoot === "RIGHT"
        ? "Destro"
        : athlete.dominantFoot === "LEFT"
        ? "Canhoto"
        : "Ambidestro",
  },
];

export function PlayerSidebar({ athlete, age }: PlayerSidebarProps) {
  const hasManagerInfo =
    athlete.hasManager &&
    (athlete.managerName || athlete.managerCompany || athlete.managerContact);

  const technicalStaff = [
    athlete.hasNutritionist && { icon: Stethoscope, label: "Nutricionista" },
    athlete.hasPsychologist && { icon: Brain, label: "Psicólogo" },
    athlete.hasPersonalTrainer && { icon: Dumbbell, label: "Personal Trainer" },
  ].filter(Boolean) as { icon: typeof Stethoscope; label: string }[];

  return (
    <div className="space-y-4">
      {/* Identidade */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
          <Avatar className="w-28 h-28 ring-2 ring-primary/20 shadow-xl">
            <AvatarImage
              src={athlete.profilePhoto || undefined}
              alt={athlete.user.name}
            />
            <AvatarFallback className="text-3xl font-semibold bg-linear-to-br from-primary/20 to-primary/5 text-primary">
              {athlete.user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-bold">{athlete.user.name}</h1>
              {athlete.isPremium && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-400 shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {athlete.nickname && (
              <p className="text-muted-foreground text-sm">
                @{athlete.nickname}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="default" className="font-medium">
              {positionLabels[athlete.primaryPosition]}
            </Badge>
            {athlete.secondaryPosition && (
              <Badge variant="secondary">
                {positionLabels[athlete.secondaryPosition]}
              </Badge>
            )}
          </div>

          {athlete.currentClub && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium">{athlete.currentClub}</span>
            </div>
          )}

          {athlete.favorites > 0 && (
            <div className="flex items-center gap-1.5 bg-muted/80 rounded-full px-3 py-1.5">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm font-medium">{athlete.favorites}</span>
            </div>
          )}

          <PlayerSocialLinks athlete={athlete} />
        </CardContent>
      </Card>

      {/* Dados pessoais */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {personalInfoRows(athlete, age)
            .filter(Boolean)
            .map((row) => {
              const { icon: Icon, label, value } = row as {
                icon: typeof Ruler;
                label: string;
                value: string;
              };
              return (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{label}</span>
                  </div>
                  <span className="font-medium">{value}</span>
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Empresário */}
      {hasManagerInfo && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Empresário
            </div>
            {athlete.managerName && (
              <p className="text-sm text-muted-foreground">
                {athlete.managerName}
              </p>
            )}
            {athlete.managerCompany && (
              <p className="text-sm text-muted-foreground">
                {athlete.managerCompany}
              </p>
            )}
            {athlete.managerContact && (
              <p className="text-sm text-muted-foreground">
                {athlete.managerContact}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comissão técnica pessoal */}
      {technicalStaff.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm font-medium mb-2">Comissão técnica</p>
            <div className="flex flex-wrap gap-2">
              {technicalStaff.map(({ icon: Icon, label }) => (
                <Badge key={label} variant="outline" className="gap-1.5">
                  <Icon className="w-3 h-3" />
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
