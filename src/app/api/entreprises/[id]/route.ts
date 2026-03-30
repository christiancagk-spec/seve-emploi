import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, forbidden } from "@/lib/auth-helpers";
import { updateCompanySchema } from "@/lib/validations";

// GET /api/entreprises/:id â DÃ©tails d'une entreprise
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const company = await prisma.company.findUnique({
    where: { id: params.id, deleted: false },
    include: {
      supervisor: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      contacts: {
        orderBy: { date: "desc" },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          beneficiary: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      reminders: {
        orderBy: { date: "asc" },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
        },
      },
      prospections: {
        orderBy: { startDate: "desc" },
        include: {
          beneficiary: {
            select: { id: true, firstName: true, lastName: true, targetJob: true },
          },
        },
      },
      companyContacts: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Entreprise non trouvÃ©e" }, { status: 404 });
  }

  // Les rÃ©fÃ©rents ne peuvent voir que leurs entreprises
  if (user.role === "REFERENT" && company.supervisorId !== user.id) {
    return forbidden();
  }

  return NextResponse.json(company);
}

// PATCH /api/entreprises/:id â Modifier une entreprise
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const existing = await prisma.company.findUnique({
    where: { id: params.id, deleted: false },
  });

  if (!existing) {
    return NextResponse.json({ error: "Entreprise non trouvÃ©e" }, { status: 404 });
  }

  if (user.role === "REFERENT" && existing.supervisorId !== user.id) {
    return forbidden();
  }

  try {
    const body = await request.json();
    const data = updateCompanySchema.parse(body);

    const updated = await prisma.company.update({
      where: { id: params.id },
      data,
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "DonnÃ©es invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise Ã  jour" },
      { status: 500 }
    );
  }
}

// DELETE /api/entreprises/:id â Suppression logique (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const existing = await prisma.company.findUnique({
    where: { id: params.id, deleted: false },
  });

  if (!existing) {
    return NextResponse.json({ error: "Entreprise non trouvÃ©e" }, { status: 404 });
  }

  if (user.role === "REFERENT" && existing.supervisorId !== user.id) {
    return forbidden();
  }

  await prisma.company.update({
    where: { id: params.id },
    data: { deleted: true, deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
