import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import {
  createProspectionSchema,
  updateProspectionSchema,
} from "@/lib/validations";

// POST /api/prospections — Créer une prospection (liaison salarié/entreprise)
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
        placementType: data.placementType,
        startDate: data.startDate || new Date(),
        endDate: data.endDate || undefined,
        notes: data.notes || "",
      },
      include: {
        company: {
          select: { id: true, companyName: true, city: true, sector: true },
        },
        beneficiary: {
          select: { id: true, firstName: true, lastName: true, targetJob: true },
        },
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
    console.error("Error creating prospection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

// PATCH /api/prospections — Modifier une prospection (statut, type, dates)
export async function PATCH(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de prospection requis" },
        { status: 400 }
      );
    }

    const data = updateProspectionSchema.parse(updateData);

    const prospection = await prisma.prospection.update({
      where: { id },
      data,
      include: {
        company: {
          select: { id: true, companyName: true, city: true, sector: true },
        },
        beneficiary: {
          select: { id: true, firstName: true, lastName: true, targetJob: true },
        },
      },
    });

    return NextResponse.json(prospection);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating prospection:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
