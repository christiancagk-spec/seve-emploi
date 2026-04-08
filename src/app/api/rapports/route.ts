import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";

// GET /api/rapports — KPIs complets pour la page rapports SEVE
export async function GET() {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const now = new Date();
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const debutMoisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMoisPrec = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      entreprisesTotal,
      entreprisesParStatut,
      entreprisesParSecteur,
      prospectionsTotal,
      prospectionsParStatut,
      prospectionsParType,
      prospectionsMoisEnCours,
      prospectionsMoisPrec,
      contactsMoisEnCours,
      contactsMoisPrec,
      contactsParType,
      contactsParOutcome,
      rappelsEnAttente,
      rappelsEnRetard,
      beneficiairesTotal,
      benefActifs,
      benefEnEmploi,
      benefEnFormation,
      benefSortis,
    ] = await Promise.all([
      // Entreprises
      prisma.company.count({ where: { deleted: false } }),
      prisma.company.groupBy({ by: ["contactStatus"], where: { deleted: false }, _count: true }),
      prisma.company.groupBy({ by: ["sector"], where: { deleted: false, sector: { not: "" } }, _count: true, orderBy: { _count: { sector: "desc" } }, take: 10 }),

      // Prospections
      prisma.prospection.count(),
      prisma.prospection.groupBy({ by: ["status"], _count: true }),
      prisma.prospection.groupBy({ by: ["placementType"], _count: true }),
      prisma.prospection.count({ where: { createdAt: { gte: debutMois, lte: finMois } } }),
      prisma.prospection.count({ where: { createdAt: { gte: debutMoisPrec, lte: finMoisPrec } } }),

      // Contacts (interactions)
      prisma.contact.count({ where: { date: { gte: debutMois, lte: finMois } } }),
      prisma.contact.count({ where: { date: { gte: debutMoisPrec, lte: finMoisPrec } } }),
      prisma.contact.groupBy({ by: ["type"], _count: true }),
      prisma.contact.groupBy({ by: ["outcome"], _count: true }),

      // Rappels
      prisma.reminder.count({ where: { status: "EN_ATTENTE" } }),
      prisma.reminder.count({ where: { status: "EN_ATTENTE", date: { lt: now } } }),

      // Beneficiaires
      prisma.beneficiary.count(),
      prisma.beneficiary.count({ where: { statut: { in: ["actif", "en_cours"] } } }),
      prisma.beneficiary.count({ where: { statut: { in: ["en_emploi", "emploi"] } } }),
      prisma.beneficiary.count({ where: { statut: { in: ["en_formation", "formation"] } } }),
      prisma.beneficiary.count({ where: { statut: { in: ["sorti_positif", "sorti_neutre", "sorti_negatif", "abandon"] } } }),
    ]);

    // Transformer groupBy en objets
    const entreprisesStatut: Record<string, number> = {};
    entreprisesParStatut.forEach((e) => { entreprisesStatut[e.contactStatus] = e._count; });

    const entreprisesSecteur: { secteur: string; count: number }[] =
      entreprisesParSecteur.map((e) => ({ secteur: e.sector, count: e._count }));

    const prospStatut: Record<string, number> = {};
    prospectionsParStatut.forEach((p) => { prospStatut[p.status] = p._count; });

    const prospType: Record<string, number> = {};
    prospectionsParType.forEach((p) => { prospType[p.placementType] = p._count; });

    const contactType: Record<string, number> = {};
    contactsParType.forEach((c) => { contactType[c.type] = c._count; });

    const contactOutcome: Record<string, number> = {};
    contactsParOutcome.forEach((c) => { contactOutcome[c.outcome] = c._count; });

    // Variation mois/mois
    const variationProspections = prospectionsMoisPrec > 0
      ? Math.round(((prospectionsMoisEnCours - prospectionsMoisPrec) / prospectionsMoisPrec) * 100)
      : prospectionsMoisEnCours > 0 ? 100 : 0;

    const variationContacts = contactsMoisPrec > 0
      ? Math.round(((contactsMoisEnCours - contactsMoisPrec) / contactsMoisPrec) * 100)
      : contactsMoisEnCours > 0 ? 100 : 0;

    return NextResponse.json({
      entreprises: {
        total: entreprisesTotal,
        parStatut: entreprisesStatut,
        parSecteur: entreprisesSecteur,
      },
      prospections: {
        total: prospectionsTotal,
        parStatut: prospStatut,
        parType: prospType,
        ceMois: prospectionsMoisEnCours,
        moisPrecedent: prospectionsMoisPrec,
        variation: variationProspections,
      },
      contacts: {
        ceMois: contactsMoisEnCours,
        moisPrecedent: contactsMoisPrec,
        variation: variationContacts,
        parType: contactType,
        parOutcome: contactOutcome,
      },
      rappels: {
        enAttente: rappelsEnAttente,
        enRetard: rappelsEnRetard,
      },
      beneficiaires: {
        total: beneficiairesTotal,
        actifs: benefActifs,
        enEmploi: benefEnEmploi,
        enFormation: benefEnFormation,
        sortis: benefSortis,
      },
    });
  } catch (error) {
    console.error("Rapports API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
