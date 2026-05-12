import type { Position, Gender, DominantFoot } from "@/lib/types";
import { CLASSIFICATION_FILTER_LABELS } from "./classification";
import type { NotificationAudience } from "./types";

export const POSITION_LABELS: Record<Position, string> = {
  GOALKEEPER: "Goleiros",
  DEFENDER: "Defensores",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacantes",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
};

export const DOMINANT_FOOT_LABELS: Record<DominantFoot, string> = {
  RIGHT: "Destro",
  LEFT: "Canhoto",
};

export function describeAudience(audience: NotificationAudience): string {
  if (audience.type === "ALL") return "Todos os usuários";
  if (audience.type === "USER_IDS") {
    const n = audience.userIds.length;
    return `${n} ${n === 1 ? "usuário específico" : "usuários específicos"}`;
  }

  const f = audience.filters;
  const parts: string[] = [];
  if (f.primaryPosition) parts.push(POSITION_LABELS[f.primaryPosition]);
  if (f.classification) parts.push(CLASSIFICATION_FILTER_LABELS[f.classification]);
  if (f.gender) parts.push(GENDER_LABELS[f.gender]);
  if (f.dominantFoot) parts.push(DOMINANT_FOOT_LABELS[f.dominantFoot]);
  if (f.minAge !== undefined || f.maxAge !== undefined) {
    parts.push(`${f.minAge ?? "?"}–${f.maxAge ?? "?"} anos`);
  }
  if (f.minHeight !== undefined || f.maxHeight !== undefined) {
    parts.push(`${f.minHeight ?? "?"}–${f.maxHeight ?? "?"} m`);
  }
  if (f.minWeight !== undefined || f.maxWeight !== undefined) {
    parts.push(`${f.minWeight ?? "?"}–${f.maxWeight ?? "?"} kg`);
  }
  if (f.currentClub) parts.push(`Clube: ${f.currentClub}`);
  return parts.length > 0
    ? `Atletas (${parts.join(" · ")})`
    : "Todos os atletas";
}

export const AUDIENCE_TYPE_LABELS: Record<
  NotificationAudience["type"],
  string
> = {
  ALL: "Todos",
  USER_IDS: "Usuários específicos",
  ATHLETE_FILTER: "Filtro de atletas",
};

export interface DeepLinkOption {
  value: string;
  label: string;
  data: Record<string, unknown>;
}

export const DEEP_LINK_OPTIONS: DeepLinkOption[] = [
  { value: "none", label: "Sem deep link", data: {} },
  {
    value: "home",
    label: "Tela inicial",
    data: { type: "admin_broadcast", screen: "/(private)/(tabs)" },
  },
  {
    value: "tournaments",
    label: "Torneios",
    data: { type: "tournament", screen: "/(private)/(tabs)/tournaments" },
  },
  {
    value: "favorites",
    label: "Favoritos",
    data: { type: "favorite", screen: "/(private)/(tabs)/favorites" },
  },
  {
    value: "subscription",
    label: "Plano / Assinatura",
    data: { type: "subscription", screen: "/(private)/(tabs)/profile" },
  },
];
