export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Role = "ATHLETE" | "OBSERVER" | "ADMIN";
export type DominantFoot = "LEFT" | "RIGHT";
export type Position =
  | "GOALKEEPER"
  | "DEFENDER"
  | "MIDFIELDER"
  | "FORWARD";
export type Category =
  | "U5"
  | "U6"
  | "U7"
  | "U8"
  | "U9"
  | "U10"
  | "U11"
  | "U12"
  | "U13"
  | "U14"
  | "U15"
  | "U16"
  | "U17"
  | "U18"
  | "U19"
  | "U20"
  | "AMATEUR"
  | "PROFESSIONAL";
export type MatchResult = "WIN" | "DRAW" | "LOSS" | "NOT_FINISHED";
export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED";
export type Modality = "FUT_11" | "FUT_7" | "FUTSAL";
export type PlayType =
  | "GOAL"
  | "DIFFICULT_SAVE"
  | "EASY_SAVE"
  | "ASSIST"
  | "FOUL_COMMITTED"
  | "FOUL_RECEIVED"
  | "DRIBBLE"
  | "ANTICIPATION"
  | "LONG_PASS"
  | "FREE_KICK"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "RIGHT_FOOT_SHOT"
  | "LEFT_FOOT_SHOT"
  | "HEADER"
  | "TACKLE"
  | "INTERCEPTION"
  | "CROSS"
  | "CORNER_KICK"
  | "PENALTY"
  | "PASS"
  | "KEY_PASS"
  | "PENALTY_SAVE"
  | "ONE_ON_ONE_SAVE"
  | "REFLEX_SAVE"
  | "DIVING_SAVE"
  | "CATCH"
  | "PUNCH"
  | "DISTRIBUTION"
  | "GOAL_KICK"
  | "THROW_OUT"
  | "SHOT_BLOCKED"
  | "CLEARANCE"
  | "OFFENSIVE_FOUL"
  | "DEFENSIVE_FOUL"
  | "BALL_RECOVERY"
  | "THROUGH_PASS"
  | "BACKHEEL"
  | "VOLLLEY"
  | "BICYCLE_KICK"
  | "OFFSIDE"
  | "MISSED_SHOT"
  | "SHOT_ON_TARGET"
  | "SHOT_OFF_TARGET"
  | "BEST_MOMENTS";
export type Classification = "PHYSICAL" | "TACTICAL" | "TECHNICAL" | "MENTAL";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  isActive: boolean;
}

export interface Athlete {
  id: string;
  userId: string;
  gender: Gender;
  nickname: string | null;
  profilePhoto: string | null;
  height: number;
  weight: number;
  dominantFoot: DominantFoot;
  primaryPosition: Position;
  secondaryPosition?: Position | null;
  currentClub: string | null;
  hasManager: boolean;
  user: User;
  createdAt: string;
  favorites: number;
  isFavorite: boolean;
  // Campos extras para a página detalhada
  cpf?: string;
  birthDate?: string;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  biography?: string;
  managerName?: string | null;
  managerCompany?: string | null;
  managerContact?: string | null;
  hasNutritionist?: boolean;
  hasPsychologist?: boolean;
  hasPersonalTrainer?: boolean;
  updatedAt?: string;
  address?: Address;
  finishedMatches?: MatchGroup[];
  videoFeed?: VideoPlay[];
}

export interface Address {
  id: string;
  athleteId: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  nickname: string;
  acronym: string;
}

export interface Match {
  id: string;
  adversaryTeam: string;
  date: string;
  myTeam: Team;
  location: string;
  category: Category;
  modality: Modality;
  status: MatchStatus;
  result: MatchResult;
  resultFlag: string;
  myTeamScore: number | null;
  adversaryScore: number | null;
  performanceRating: number | null;
  isFriendly: boolean;
  competitionName: string | null;
  competition: unknown | null;
}

export interface MatchGroup {
  type: string;
  competition: string | null;
  matches: Match[];
}

export interface VideoClassification {
  id: string;
  playId: string;
  classification: Classification;
  createdAt: string;
}

export interface VideoPlay {
  id: string;
  type: PlayType;
  videoUrl: string;
  thumbnailUrl: string;
  classifications: VideoClassification[];
  match: {
    id: string;
    adversaryTeam: string;
    date: string;
    category: Category;
  } | null;
  createdAt: string;
}

export interface AthletesResponse {
  athletes: Athlete[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AthleteDetailResponse {
  athlete: Athlete;
}

