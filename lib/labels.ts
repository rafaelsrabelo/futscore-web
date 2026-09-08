import type { Position } from "@/lib/types";

export const positionLabels: Record<Position, string> = {
  GOALKEEPER: "Goleiro",
  DEFENDER: "Defensor",
  MIDFIELDER: "Meio-campo",
  FORWARD: "Atacante",
};

export const videoTypeLabels: Record<string, string> = {
  GOAL: "Gol",
  PASS: "Passe",
  DISTRIBUTION: "Distribuição",
  DIFFICULT_SAVE: "Defesa Difícil",
  BEST_MOMENTS: "Melhores Momentos",
};
