import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { createReminderSchema } from "@/lib/validations";

// GET /api/rappels — Liste des rappels (en attente, du user connecté)
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "EN_ATTENTE";

  const where: any = { status };

  if (user.role === "REFERENT") {
    where.createdById = user.id;
  }

  const reminders = await prisma.reminder.findMany({
    where,
    include: {
      company: { select: { id: true, companyName: true, city: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(reminders);
}

// POST /api/rappels — Créer un rappel
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const data = createReminderSchema.parse(body);

    const reminder = await prisma.reminder.create({
      data: {
        ...data,
        createdById: user.id,
      },
      include: {
        company: { select: { id: true, companyName: true } },
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la création du rappel" },
      { status: 500 }
    );
  }
}

// PATCH /api/rappels — Mettre à jour le statut d'un rappel
export async function PATCH(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const { id, status } = await request.json();

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
