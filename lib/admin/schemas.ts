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
