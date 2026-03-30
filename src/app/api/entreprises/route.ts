import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { createCompanySchema } from "@/lib/validations";

// GET /api/entreprises — Liste des entreprises
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sector = searchParams.get("sector") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = {
    deleted: false,
  };

  // Les référents ne voient que leurs entreprises, les admins voient tout
  if (user.role === "REFERENT") {
    where.supervisorId = user.id;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  if (sector) {
    where.sector = sector;
  }

  if (status) {
    where.contactStatus = status;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: {
            contacts: true,
            prospections: true,
            reminders: { where: { status: "EN_ATTENTE" } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({
    companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/entreprises — Créer une entreprise
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const data = createCompanySchema.parse(body);

    const company = await prisma.company.create({
      data: {
        ...data,
        createdById: user.id,
        supervisorId: user.id,
      },
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
