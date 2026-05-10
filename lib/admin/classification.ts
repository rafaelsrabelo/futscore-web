import type {
  AthleteClassification,
  AthleteClassificationFilter,
} from "./types";

export const CLASSIFICATION_LABELS: Record<AthleteClassification, string> = {
  DESENVOLVIMENTO: "Desenvolvimento",
  PERFORMANCE: "Performance",
};

export const CLASSIFICATION_FILTER_LABELS: Record<
  AthleteClassificationFilter | "ALL",
  string
> = {
  ALL: "Todas",
  DESENVOLVIMENTO: "Desenvolvimento",
  PERFORMANCE: "Performance",
  UNCLASSIFIED: "Não classificadas",
};

/**
 * Tailwind classes — fechadas em strings completas pra que o JIT do Tailwind
 * detecte na hora do build (evita classes dinâmicas que somem em produção).
 */
export const CLASSIFICATION_BADGE_CLASSES: Record<
  AthleteClassification | "UNCLASSIFIED",
  string
> = {
  DESENVOLVIMENTO:
    "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PERFORMANCE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UNCLASSIFIED: "bg-muted text-muted-foreground border-border/60",
};

export interface ClassificationDisplay {
  label: string;
  badgeClass: string;
}

export function describeClassification(
  value: AthleteClassification | null,
): ClassificationDisplay {
  if (value) {
    return {
      label: CLASSIFICATION_LABELS[value],
      badgeClass: CLASSIFICATION_BADGE_CLASSES[value],
    };
  }
  return {
    label: "Não classificada",
    badgeClass: CLASSIFICATION_BADGE_CLASSES.UNCLASSIFIED,
  };
}

export function isClassificationFilter(
  value: string | undefined,
): value is AthleteClassificationFilter {
  return (
    value === "DESENVOLVIMENTO" ||
    value === "PERFORMANCE" ||
    value === "UNCLASSIFIED"
  );
}
