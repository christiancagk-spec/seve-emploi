import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { createContactSchema } from "@/lib/validations";

// POST /api/contacts â Ajouter un contact Ã  une entreprise
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const data = createContactSchema.parse(body);

    const contact = await prisma.contact.create({
      data: {
        ...data,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        beneficiary: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Met Ã  jour la date de derniÃ¨re interaction sur l'entreprise
    await prisma.company.update({
      where: { id: data.companyId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "DonnÃ©es invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Erreur lors de la crÃ©ation du contact" },
      { status: 500 }
    );
  }
}
