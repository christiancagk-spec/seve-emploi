import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (seve_users table)...");

  // Créer l'admin SEVE par défaut
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mediation-active.re" },
    update: {},
    create: {
      email: "admin@mediation-active.re",
      hashedPassword: adminPassword,
      firstName: "Admin",
      lastName: "Médiation Active",
      role: Role.ADMIN,
    },
  });
  console.log("Admin SEVE created:", admin.email);

  // Créer un référent SEVE de test
  const referentPassword = await bcrypt.hash("referent123", 12);
  const referent = await prisma.user.upsert({
    where: { email: "referent@mediation-active.re" },
    update: {},
    create: {
      email: "referent@mediation-active.re",
      hashedPassword: referentPassword,
      firstName: "Samuel",
      lastName: "Jean-Baptiste",
      role: Role.REFERENT,
    },
  });
  console.log("Referent SEVE created:", referent.email);

  // Créer quelques entreprises de test
  const companies = [
    {
      companyName: "Carrefour Saint-Denis",
      address: "Centre Commercial Duparc",
      city: "Saint-Denis",
      phone: "0262 21 00 00",
      sector: "Commerce",
      contactStatus: "EN_ATTENTE" as const,
    },
    {
      companyName: "GTOI BTP",
      address: "ZI du Chaudron",
      city: "Le Port",
      phone: "0262 42 00 00",
      sector: "BTP/VRD",
      contactStatus: "PMSMP" as const,
    },
    {
      companyName: "CHU Félix Guyon",
      address: "Allée des Topazes",
      city: "Saint-Denis",
      phone: "0262 90 55 55",
      sector: "Médico-social",
      contactStatus: "CONTRAT" as const,
    },
    {
      companyName: "ATIS Propreté",
      address: "ZAC 2000",
      city: "Saint-Pierre",
      phone: "0262 32 00 00",
      sector: "ASH",
      contactStatus: "EN_ATTENTE" as const,
    },
    {
      companyName: "Hôtel Lux Saint-Gilles",
      address: "Rue des Bains",
      city: "Saint-Gilles",
      phone: "0262 24 00 00",
      sector: "Hôtellerie/Restauration",
      contactStatus: "REFUS" as const,
    },
  ];

  for (const c of companies) {
    await prisma.company.create({
      data: {
        ...c,
        createdById: referent.id,
        supervisorId: referent.id,
      },
    });
  }
  console.log(`${companies.length} companies created`);

  // NOTE: Les salariés en transition sont maintenant lus depuis la table
  // beneficiaires partagée avec AGK App. Pas besoin de les créer ici.
  console.log("Salariés en transition : lus depuis la base AGK partagée");

  console.log("\nSeed completed!");
  console.log("\nComptes SEVE de test :");
  console.log("  Admin:    admin@mediation-active.re / admin123");
  console.log("  Référent: referent@mediation-active.re / referent123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
