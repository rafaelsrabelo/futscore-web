import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("E-mail inválido"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const PositionSchema = z.enum([
  "GOALKEEPER",
  "DEFENDER",
  "MIDFIELDER",
  "FORWARD",
]);
const GenderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
const DominantFootSchema = z.enum(["RIGHT", "LEFT"]);

export const updateAthleteAddressSchema = z.object({
  zipCode: z.string().min(1).optional(),
  street: z.string().min(1).optional(),
  number: z.string().min(1).optional(),
  complement: z.string().nullable().optional(),
  district: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

export const updateAthleteSchema = z.object({
  // User
  name: z.string().min(1).optional(),
  email: z.email("E-mail inválido").optional(),
  cpf: z.string().min(11).max(14).nullable().optional(),
  isActive: z.boolean().optional(),
  // Profile
  nickname: z.string().min(1).max(50).optional(),
  profilePhoto: z.url("URL inválida").optional(),
  birthDate: z.string().min(1).optional(),
  gender: GenderSchema.optional(),
  height: z.number().positive("Altura deve ser maior que 0").optional(),
  weight: z.number().positive("Peso deve ser maior que 0").optional(),
  dominantFoot: DominantFootSchema.optional(),
  primaryPosition: PositionSchema.optional(),
  secondaryPosition: PositionSchema.nullable().optional(),
  currentClub: z.string().nullable().optional(),
  biography: z.string().optional(),
  hasManager: z.boolean().optional(),
  managerName: z.string().nullable().optional(),
  managerCompany: z.string().nullable().optional(),
  managerContact: z.string().nullable().optional(),
  hasNutritionist: z.boolean().optional(),
  hasPsychologist: z.boolean().optional(),
  hasPersonalTrainer: z.boolean().optional(),
  instagramUrl: z.url("URL inválida").optional(),
  twitterUrl: z.url("URL inválida").optional(),
  youtubeUrl: z.url("URL inválida").optional(),
  address: updateAthleteAddressSchema.optional(),
});

export type UpdateAthleteInput = z.infer<typeof updateAthleteSchema>;

const ClassificationSchema = z.enum([
  "PHYSICAL",
  "TACTICAL",
  "TECHNICAL",
  "MENTAL",
]);

export const updatePlaySchema = z.object({
  playType: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  observations: z.string().nullable().optional(),
  photoUrl: z.url("URL inválida").nullable().optional(),
  thumbnailUrl: z.url("URL inválida").nullable().optional(),
  classifications: z.array(ClassificationSchema).optional(),
});

export type UpdatePlayInput = z.infer<typeof updatePlaySchema>;

const ModalitySchema = z.enum(["FUT_11", "FUT_7", "FUTSAL"]);
const CategorySchema = z.enum([
  "U5",
  "U6",
  "U7",
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "U19",
  "U20",
  "AMATEUR",
  "PROFESSIONAL",
]);
const MatchStatusSchema = z.enum([
  "SCHEDULED",
  "LIVE",
  "FINISHED",
  "CANCELLED",
]);
const MatchResultSchema = z.enum(["WIN", "LOSS", "DRAW", "NOT_FINISHED"]);
const PlayerPositionSchema = z.enum(["STARTER", "SUBSTITUTE"]);

export const createMatchSchema = z.object({
  athleteProfileId: z.uuid(),
  myTeamId: z.uuid(),
  adversaryTeam: z.string().min(1),
  date: z.string().min(1),
  modality: z.enum(["FUT_11", "FUT_7", "FUTSAL"]).optional(),
  category: z
    .enum([
      "U5",
      "U6",
      "U7",
      "U8",
      "U9",
      "U10",
      "U11",
      "U12",
      "U13",
      "U14",
      "U15",
      "U16",
      "U17",
      "U18",
      "U19",
      "U20",
      "AMATEUR",
      "PROFESSIONAL",
    ])
    .optional(),
  location: z.string().optional(),
  streamUrl: z.url("URL inválida").optional(),
  competitionId: z.uuid().optional(),
  status: z
    .enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"])
    .optional(),
  result: z.enum(["WIN", "LOSS", "DRAW", "NOT_FINISHED"]).optional(),
  myTeamScore: z.number().int().min(0).optional(),
  adversaryScore: z.number().int().min(0).optional(),
  playerPosition: z.enum(["STARTER", "SUBSTITUTE"]).optional(),
  observations: z.string().optional(),
  matchDuration: z.number().int().min(0).max(240).optional(),
  approximateTime: z.number().int().min(0).max(240).optional(),
  photoUrl: z.url("URL inválida").optional(),
  videoUrl: z.url("URL inválida").optional(),
  youtubeUrl: z.url("URL inválida").optional(),
  performanceRating: z.number().int().min(1).max(5).optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

export const updateMatchSchema = z.object({
  athleteProfileId: z.uuid().optional(),
  myTeamId: z.uuid().optional(),
  competitionId: z.uuid().nullable().optional(),
  adversaryTeam: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  modality: ModalitySchema.optional(),
  category: CategorySchema.optional(),
  location: z.string().optional(),
  streamUrl: z.url("URL inválida").nullable().optional(),
  status: MatchStatusSchema.optional(),
  result: MatchResultSchema.optional(),
  myTeamScore: z.number().int().min(0).nullable().optional(),
  adversaryScore: z.number().int().min(0).nullable().optional(),
  playerPosition: PlayerPositionSchema.nullable().optional(),
  observations: z.string().nullable().optional(),
  matchDuration: z.number().int().min(0).max(240).nullable().optional(),
  approximateTime: z.number().int().min(0).max(240).nullable().optional(),
  photoUrl: z.url("URL inválida").nullable().optional(),
  videoUrl: z.url("URL inválida").nullable().optional(),
  youtubeUrl: z.url("URL inválida").nullable().optional(),
  performanceRating: z.number().int().min(1).max(5).nullable().optional(),
});

export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;

export const updateMatchResultSchema = z.object({
  myTeamScore: z.number().int().min(0).optional(),
  adversaryScore: z.number().int().min(0).optional(),
  status: MatchStatusSchema.optional(),
  result: MatchResultSchema.optional(),
});

export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;

const AchievementTypeSchema = z.enum(["COLLECTIVE", "INDIVIDUAL"]);

export const createAchievementSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  year: z.number().int().min(1900),
  type: AchievementTypeSchema,
});

export type CreateAchievementInput = z.infer<typeof createAchievementSchema>;

export const updateAchievementSchema = createAchievementSchema.partial();

export type UpdateAchievementInput = z.infer<typeof updateAchievementSchema>;

export const createTeamHistorySchema = z.object({
  teamId: z.uuid(),
  startDate: z.string().min(1),
  endDate: z.string().min(1).nullable().optional(),
});

export type CreateTeamHistoryInput = z.infer<typeof createTeamHistorySchema>;

export const updateTeamHistorySchema = z.object({
  teamId: z.uuid().optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).nullable().optional(),
});

export type UpdateTeamHistoryInput = z.infer<typeof updateTeamHistorySchema>;
