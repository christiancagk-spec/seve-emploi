import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";

// GET /api/beneficiaires/:id/cip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    // 5 derniers entretiens
    const entretiens = await prisma.entretien.findMany({
      where: { beneficiaireId: id },
      orderBy: { dateEntretien: "desc" },
      take: 5,
    });

    // Derniere evaluation
    const evaluations = await prisma.evaluationCip.findMany({
      where: { beneficiaireId: id },
      orderBy: { dateEvaluation: "desc" },
      take: 1,
    });

    // PMSMP realisees
    const pmsmp = await prisma.pmsmp.findMany({
      where: { beneficiaireId: id },
      orderBy: { dateDebut: "desc" },
    });

    // Emplois obtenus
    const emplois = await prisma.emploi.findMany({
      where: { beneficiaireId: id },
      orderBy: { dateDebut: "desc" },
    });

    // Compteurs
    const counts = {
      entretiens: await prisma.entretien.count({ where: { beneficiaireId: id } }),
      evaluations: await prisma.evaluationCip.count({ where: { beneficiaireId: id } }),
      pmsmp: await prisma.pmsmp.count({ where: { beneficiaireId: id } }),
      emplois: await prisma.emploi.count({ where: { beneficiaireId: id } }),
    };

    // Score moyen derniere evaluation
    let scoreMoyen = null;
    if (evaluations.length > 0) {
      const e = evaluations[0];
      const scores = [
        e.ponctualite, e.assiduite, e.motivation, e.autonomie,
        e.travailEquipe, e.communication, e.respectConsignes, e.initiative,
      ].filter((s) => s != null) as number[];
      if (scores.length > 0) {
        scoreMoyen =
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
      }
    }

    return NextResponse.json({
      entretiens,
      evaluations,
      pmsmp,
      emplois,
      counts,
      scoreMoyen,
    });
  } catch (err: any) {
    console.error("GET /api/beneficiaires/:id/cip error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
