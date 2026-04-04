import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";

// Escape CSV field
function csvField(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET /api/export?type=entreprises|placements
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) return unauthorized();

  const type = request.nextUrl.searchParams.get("type") || "entreprises";

  try {
    if (type === "placements") {
      const prospections = await prisma.prospection.findMany({
        include: {
          company: { select: { companyName: true, city: true, sector: true } },
          beneficiary: { select: { firstName: true, lastName: true, targetJob: true } },
        },
        orderBy: { startDate: "desc" },
      });

      const headers = [
        "Salarié", "Métier visé", "Entreprise", "Ville", "Secteur",
        "Type placement", "Statut", "Date début", "Date fin", "Notes",
      ];

      const rows = prospections.map((p) => [
        csvField(`${p.beneficiary?.firstName || ""} ${p.beneficiary?.lastName || ""}`),
        csvField(p.beneficiary?.targetJob),
        csvField(p.company?.companyName),
        csvField(p.company?.city),
        csvField(p.company?.sector),
        csvField(p.placementType),
        csvField(p.status),
        csvField(p.startDate ? new Date(p.startDate).toLocaleDateString("fr-FR") : ""),
        csvField(p.endDate ? new Date(p.endDate).toLocaleDateString("fr-FR") : ""),
        csvField(p.notes),
      ]);

      const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="placements_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Default: entreprises
    const companies = await prisma.company.findMany({
      include: {
        supervisor: { select: { firstName: true, lastName: true } },
        _count: { select: { contacts: true, prospections: true, reminders: true } },
      },
      orderBy: { companyName: "asc" },
    });

    const headers = [
      "Entreprise", "Ville", "Secteur", "Téléphone", "Email",
      "Adresse", "Statut", "Référent", "Nb interactions", "Nb placements", "Notes",
    ];

    const statusLabels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      PMSMP: "PMSMP",
      CONTRAT: "Contrat",
      REFUS: "Refus",
    };

    const rows = companies.map((c) => [
      csvField(c.companyName),
      csvField(c.city),
      csvField(c.sector),
      csvField(c.phone),
      csvField(c.email),
      csvField(c.address),
      csvField(statusLabels[c.contactStatus] || c.contactStatus),
      csvField(`${c.supervisor?.firstName || ""} ${c.supervisor?.lastName || ""}`),
      csvField(c._count.contacts),
      csvField(c._count.prospections),
      csvField(c.notes),
    ]);

    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="entreprises_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Erreur d'export" }, { status: 500 });
  }
}
