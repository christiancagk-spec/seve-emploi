import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";

// GET /api/recherche?q=xxx — Recherche globale entreprises + bénéficiaires
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return NextResponse.json({ companies: [], beneficiaries: [] });
  }

  try {
    const [companies, beneficiaries] = await Promise.all([
      prisma.company.findMany({
        where: {
          OR: [
            { companyName: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { sector: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          companyName: true,
          city: true,
          sector: true,
          contactStatus: true,
          _count: { select: { prospections: true } },
        },
        take: 20,
        orderBy: { companyName: "asc" },
      }),
      prisma.beneficiary.findMany({
        where: {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { targetJob: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          targetJob: true,
          city: true,
          _count: { select: { prospections: true } },
        },
        take: 20,
        orderBy: { lastName: "asc" },
      }),
    ]);

    return NextResponse.json({ companies, beneficiaries });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ companies: [], beneficiaries: [] }, { status: 200 });
  }
}
