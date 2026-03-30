import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Créer l'admin par défaut
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
  console.log("Admin created:", admin.email);

  // Créer un référent de test
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
  console.log("Referent created:", referent.email);

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

  // Créer quelques bénéficiaires de test
  const beneficiaries = [
    { firstName: "Marie", lastName: "Dupont", targetJob: "Aide-soignante" },
    { firstName: "Jean", lastName: "Martin", targetJob: "Maçon" },
    { firstName: "Fatima", lastName: "Ali", targetJob: "Agent de propreté" },
  ];

  for (const b of beneficiaries) {
    await prisma.beneficiary.create({
      data: {
        ...b,
        supervisorId: referent.id,
      },
    });
  }
  console.log(`${beneficiaries.length} beneficiaries created`);

  console.log("\nSeed completed!");
  console.log("\nComptes de test :");
  console.log("  Admin:    admin@mediation-active.re / admin123");
  console.log("  Référent: referent@mediation-active.re / referent123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
