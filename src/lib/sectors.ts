// Source unique pour les secteurs d'activité — plus de duplication !
export const SECTORS = [
  "ASH",
  "BTP/VRD",
  "Médico-social",
  "Agriculture",
  "Agroalimentaire",
  "Commerce",
  "Communication",
  "Éducation",
  "Environnement",
  "Hôtellerie/Restauration",
  "Industrie",
  "Informatique",
  "Logistique",
  "Services à la personne",
  "Sport et loisirs",
  "Textile",
  "Transport",
  "Tourisme",
] as const;

export type SectorType = (typeof SECTORS)[number] | string;
