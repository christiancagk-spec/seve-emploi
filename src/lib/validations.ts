import { z } from "zod";

// ============================================================
// ENTREPRISES
// ============================================================

export const createCompanySchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis").max(200),
  address: z.string().max(500).default(""),
  city: z.string().max(100).default(""),
  phone: z
    .string()
    .max(20)
    .regex(/^[\d\s\+\-\.]*$/, "Format de telephone invalide")
    .default(""),
  email: z.union([z.string().email("Email invalide"), z.literal("")]).default(""),
  sector: z.string().max(100).default(""),
  contactStatus: z
    .enum(["EN_ATTENTE", "PMSMP", "CONTRAT", "REFUS"])
    .default("EN_ATTENTE"),
  notes: z.string().max(5000).default(""),
});

export const updateCompanySchema = createCompanySchema.partial();

// ============================================================
// CONTACTS (interactions)
// ============================================================

export const createContactSchema = z.object({
  companyId: z.string().min(1),
  beneficiaryId: z.string().optional(),
  date: z.string().or(z.date()).transform((v) => new Date(v)),
  type: z.enum(["APPEL", "EMAIL", "VISITE", "AUTRE"]),
  outcome: z.enum(["POSITIF", "NEGATIF", "EN_ATTENTE"]).default("EN_ATTENTE"),
  comment: z.string().max(5000).default(""),
});

// ============================================================
// BENEFICIAIRES
// ============================================================

export const createBeneficiarySchema = z.object({
  firstName: z.string().min(1, "Le prenom est requis").max(100),
  lastName: z.string().min(1, "Le nom est requis").max(100),
  targetJob: z.string().max(200).default(""),
  phone: z.string().max(20).default(""),
  email: z.union([z.string().email("Email invalide"), z.literal("")]).default(""),
  notes: z.string().max(5000).default(""),
});

// ============================================================
// RAPPELS
// ============================================================

export const createReminderSchema = z.object({
  companyId: z.string().min(1),
  beneficiaryId: z.string().optional(),
  date: z.string().or(z.date()).transform((v) => new Date(v)),
  type: z.enum(["SUIVI", "ECHEANCE", "OPPORTUNITE"]).default("SUIVI"),
  comment: z.string().max(2000).default(""),
});

// ============================================================
// AUTH
// ============================================================

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caracteres"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateBeneficiaryInput = z.infer<typeof createBeneficiarySchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
