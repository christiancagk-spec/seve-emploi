import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { z } from "zod";

const createProspectionSchema = z.object({
  companyId: z.string().min(1, "Entreprise requise"),
  beneficiaryId: z.string().min(1, "Bénéficiaire requis"),
  status: z.enum(["EN_COURS", "PMSMP", "CONTRAT", "REFUS", "TERMINE"]).default("EN_COURS"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/prospections
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const data = createProspectionSchema.parse(body);

    const prospection = await prisma.prospection.create({
      data: {
        companyId: data.companyId,
        beneficiaryId: data.beneficiaryId,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        notes: data.notes || "",
      },
      include: {
        company: { select: { id: true, companyName: true, city: true, sector: true } },
        beneficiary: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(prospection, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
