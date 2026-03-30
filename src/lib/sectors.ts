// Source unique pour les secteurs d'activite
export const SECTORS = [
  "ASH",
  "BTP/VRD",
  "Medico-social",
  "Agriculture",
  "Agroalimentaire",
  "Commerce",
  "Communication",
  "Education",
  "Environnement",
  "Hotellerie/Restauration",
  "Industrie",
  "Informatique",
  "Logistique",
  "Services a la personne",
  "Sport et loisirs",
  "Textile",
  "Transport",
  "Tourisme",
] as const;

export type SectorType = (typeof SECTORS)[number] | string;
