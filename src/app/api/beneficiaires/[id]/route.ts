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

  const beneficiary = await prisma.beneficiary.findUnique({
    where: { id: params.id },
    include: {
      supervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
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
    return NextResponse.json({ error: "Bénéficiaire non trouvé" }, { status: 404 });
  }

  if (user.role === "REFERENT" && beneficiary.supervisorId !== user.id) {
    return forbidden();
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

  const existing = await prisma.beneficiary.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Bénéficiaire non trouvé" }, { status: 404 });
  }

  if (user.role === "REFERENT" && existing.supervisorId !== user.id) {
    return forbidden();
  }

  try {
    const body = await request.json();
    const data = createBeneficiarySchema.partial().parse(body);

    const updated = await prisma.beneficiary.update({
      where: { id: params.id },
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
