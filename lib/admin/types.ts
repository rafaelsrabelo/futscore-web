import type { DominantFoot, Gender, Position } from "@/lib/types";

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN";
  avatarUrl?: string | null;
}

export interface AdminSession {
  user: AdminUser;
}

export interface VerifyPayload {
  userId: string;
  email: string;
  role: "ADMIN";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AdminAthleteUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminAthleteListItem {
  id: string;
  nickname: string | null;
  profilePhoto: string | null;
  birthDate: string | null;
  age: number | null;
  gender: Gender;
  primaryPosition: Position;
  secondaryPosition: Position | null;
  dominantFoot: DominantFoot;
  currentClub: string | null;
  /** Altura em METROS (ex.: 1.78). Pra exibir em cm, multiplicar por 100. */
  height: number;
  /** Peso em kg. */
  weight: number;
  hasManager: boolean;
  cpf: string | null;
  createdAt: string;
  user: AdminAthleteUser;
}

export interface AdminAthletesResponse {
  items: AdminAthleteListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface GlobalSearchAthlete {
  id: string;
  name: string;
  slug?: string | null;
  photoUrl: string | null;
  position: Position | null;
  currentClub?: string | null;
}

export interface GlobalSearchMatch {
  id: string;
  date: string;
  adversaryTeam: string;
  myTeamScore: number | null;
  adversaryScore: number | null;
  athlete: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
}

export interface GlobalSearchResponse {
  athletes: GlobalSearchAthlete[];
  matches: GlobalSearchMatch[];
}
