import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, forbidden } from "@/lib/auth-helpers";
import { createBeneficiarySchema } from "@/lib/validations";

// GET /api/beneficiaires/:id
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

  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id },
    include: {
      prospections: {
        orderBy: { startDate: "desc" },
        include: {
          company: { select: { id: true, companyName: true, city: true, sector: true, contactStatus: true } },
        },
      },
      contacts: {
        orderBy: { date: "desc" },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          company: { select: { id: true, companyName: true } },
        },
      },
    },
  });

  if (!beneficiary) {
    return NextResponse.json({ error: "Salarié en transition non trouvé" }, { status: 404 });
  }

  return NextResponse.json(beneficiary);
}

// PATCH /api/beneficiaires/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const existing = await prisma.beneficiary.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Salarié en transition non trouvé" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = createBeneficiarySchema.partial().parse(body);

    const updated = await prisma.beneficiary.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
