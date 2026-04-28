import type {
  Category,
  DominantFoot,
  Gender,
  MatchResult,
  MatchStatus,
  Modality,
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
  gender: Gender | null;
  primaryPosition: Position | null;
  secondaryPosition: Position | null;
  dominantFoot: DominantFoot | null;
  currentClub: string | null;
  /** Altura em METROS (ex.: 1.78). Pra exibir em cm, multiplicar por 100. */
  height: number | null;
  /** Peso em kg. */
  weight: number | null;
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

// ---- Global matches (BE-10 / BE-11 / BE-12) ----

export interface AdminMatchAthleteProfile {
  id: string;
  name: string;
  nickname: string | null;
  profilePhoto: string | null;
  primaryPosition: Position;
}

export interface AdminMatchesGlobalItem extends AdminMatchListItem {
  athleteProfile: AdminMatchAthleteProfile;
  myTeamId?: string | null;
  modality?: Modality | null;
  category?: Category | null;
  location?: string | null;
  athleteId?: string | null;
}

export interface AdminMatchesGlobalResponse {
  items: AdminMatchesGlobalItem[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface AdminMatchTeam {
  id: string;
  name: string;
  acronym: string | null;
  shieldPhoto: string | null;
}

export interface AdminMatchDetail {
  id: string;
  date: string;
  adversaryTeam: string;
  myTeamScore: number | null;
  adversaryScore: number | null;
  status: MatchStatus;
  result: MatchResult;
  playsCount: number;
  isFriendly?: boolean;
  location?: string | null;
  modality?: Modality | null;
  category?: Category | null;
  observations?: string | null;
  createdAt?: string;
  updatedAt?: string;
  athleteProfile: AdminMatchAthleteProfile;
  myTeam: AdminMatchTeam | null;
  competition: { id: string; name: string } | null;
}

export interface AdminMatchPlaysResponse {
  items: AdminPlayItem[];
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

// ---- Dashboard ----

export interface DashboardOverviewTotals {
  athletes: number;
  observers: number;
  matches: number;
  plays: number;
  achievements?: number;
  activeSubscriptions: number;
}

export interface DashboardOverviewPeriod {
  days: number;
  from: string;
  to: string;
  newAthletes: number;
  newObservers: number;
  newMatches: number;
  newPlays: number;
}

export interface DashboardOverview {
  totals: DashboardOverviewTotals;
  period: DashboardOverviewPeriod;
}

export type DashboardGrowthPeriod = "daily" | "weekly" | "monthly";

export interface DashboardGrowthBucket {
  bucket: string;
  newAthletes: number;
  newObservers: number;
  total: number;
}

export interface DashboardUserGrowth {
  period: DashboardGrowthPeriod;
  from: string;
  to: string;
  series: DashboardGrowthBucket[];
}

export interface DashboardUserActivity {
  total: number;
  activeLast7d: number;
  activeLast30d: number;
  activeLast90d: number;
  inactiveOver30d: number;
  inactiveOver90d: number;
  neverLoggedIn: number;
  activePercent30d: number;
}

export interface DashboardInactivityBucket {
  label: string;
  minDays: number | null;
  maxDays: number | null;
  count: number;
}

export interface DashboardInactivityBuckets {
  buckets: DashboardInactivityBucket[];
  total: number;
}
