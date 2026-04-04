import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { createBeneficiarySchema } from "@/lib/validations";

// GET /api/beneficiaires
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  // Tous les utilisateurs SEVE voient tous les salariés (base AGK partagée)
  const beneficiaries = await prisma.beneficiary.findMany({
    include: {
      _count: {
        select: {
          prospections: true,
          contacts: true,
        },
      },
      prospections: {
        select: { status: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(beneficiaries);
}

// POST /api/beneficiaires
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const data = createBeneficiarySchema.parse(body);

    const beneficiary = await prisma.beneficiary.create({
      data: {
        ...data,
      },
    });

    return NextResponse.json(beneficiary, { status: 201 });
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
