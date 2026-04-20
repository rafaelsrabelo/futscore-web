import type {
  DominantFoot,
  Gender,
  MatchResult,
  MatchStatus,
  Position,
} from "@/lib/types";

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

export interface AdminAthleteDetailProfile {
  id: string;
  userId: string;
  nickname: string | null;
  profilePhoto: string | null;
  birthDate: string | null;
  age?: number | null;
  gender: Gender;
  primaryPosition: Position;
  secondaryPosition: Position | null;
  dominantFoot: DominantFoot;
  currentClub: string | null;
  /** Altura em metros. */
  height: number;
  weight: number;
  hasManager: boolean;
  managerName?: string | null;
  managerCompany?: string | null;
  managerContact?: string | null;
  biography?: string | null;
  cpf?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  hasNutritionist?: boolean;
  hasPsychologist?: boolean;
  hasPersonalTrainer?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminAthleteDetailAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
}

export interface AdminAthleteDetailUser {
  id: string;
  name: string;
  email: string;
  role: "ATHLETE" | "ADMIN" | "OBSERVER";
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminAthleteDetailCounts {
  matches: number;
  plays: number;
  achievements: number;
  teamHistory: number;
}

export interface AdminAthleteDetailSubscription {
  planName: string;
  planPrice: number;
  planCurrency: string;
  planIsUnlimited: boolean;
  status: string;
  currentPeriodEnd: string;
}

export interface AdminAthleteDetail {
  profile: AdminAthleteDetailProfile;
  address: AdminAthleteDetailAddress | null;
  user: AdminAthleteDetailUser;
  counts: AdminAthleteDetailCounts;
  playsByType?: Record<string, number>;
  subscription: AdminAthleteDetailSubscription | null;
}

export interface AdminMatchListItem {
  id: string;
  date: string;
  adversaryTeam: string;
  myTeamScore: number | null;
  adversaryScore: number | null;
  status: MatchStatus;
  result: MatchResult;
  playsCount: number;
  competition: { id?: string; name: string } | null;
}

export interface AdminMatchListResponse {
  items: AdminMatchListItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export type AdminPlayClassificationType =
  | "PHYSICAL"
  | "TACTICAL"
  | "TECHNICAL"
  | "MENTAL";

export interface AdminPlayClassification {
  id: string;
  classification: AdminPlayClassificationType;
}

export interface AdminPlayItem {
  id: string;
  playType: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  photoUrl: string | null;
  rating: number | null;
  observations: string | null;
  classifications: AdminPlayClassification[];
  createdAt: string;
  match: { id: string; date: string; adversaryTeam: string } | null;
}

export interface AdminPlaysResponse {
  items: AdminPlayItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export type AdminAchievementType = "COLLECTIVE" | "INDIVIDUAL";

export interface AdminAchievementItem {
  id: string;
  name: string;
  category: string;
  year: number;
  type: AdminAchievementType;
  createdAt: string;
}

export interface AdminAchievementsResponse {
  items: AdminAchievementItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface AdminTeamHistoryTeam {
  id: string;
  name: string;
  acronym: string;
  shieldPhoto: string | null;
}

export interface AdminTeamHistoryItem {
  id: string;
  startDate: string;
  endDate: string | null;
  team: AdminTeamHistoryTeam;
}

export interface AdminTeamHistoryResponse {
  items: AdminTeamHistoryItem[];
  currentTeam: AdminTeamHistoryItem | null;
}
