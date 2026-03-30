import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== "init-seve-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create enums
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'REFERENT', 'LECTEUR');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ContactStatus" AS ENUM ('EN_ATTENTE', 'PMSMP', 'CONTRAT', 'REFUS');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ContactType" AS ENUM ('APPEL', 'EMAIL', 'VISITE', 'AUTRE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ContactOutcome" AS ENUM ('POSITIF', 'NEGATIF', 'EN_ATTENTE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ProspectionStatus" AS ENUM ('EN_COURS', 'PMSMP', 'CONTRAT', 'REFUS', 'TERMINE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ReminderType" AS ENUM ('SUIVI', 'ECHEANCE', 'OPPORTUNITE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ReminderStatus" AS ENUM ('EN_ATTENTE', 'COMPLETE', 'ANNULE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Create tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL, "email" TEXT NOT NULL, "hashedPassword" TEXT NOT NULL,
        "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL,
        "role" "Role" NOT NULL DEFAULT 'REFERENT', "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "companies" (
        "id" TEXT NOT NULL, "companyName" TEXT NOT NULL,
        "address" TEXT NOT NULL DEFAULT '', "city" TEXT NOT NULL DEFAULT '',
        "phone" TEXT NOT NULL DEFAULT '', "email" TEXT NOT NULL DEFAULT '',
        "sector" TEXT NOT NULL DEFAULT '',
        "contactStatus" "ContactStatus" NOT NULL DEFAULT 'EN_ATTENTE',
        "notes" TEXT NOT NULL DEFAULT '', "deleted" BOOLEAN NOT NULL DEFAULT false,
        "deletedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT NOT NULL, "supervisorId" TEXT NOT NULL,
        CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "company_contacts" (
        "id" TEXT NOT NULL, "name" TEXT NOT NULL,
        "position" TEXT NOT NULL DEFAULT '', "phone" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL DEFAULT '', "companyId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "beneficiaries" (
        "id" TEXT NOT NULL, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL,
        "targetJob" TEXT NOT NULL DEFAULT '', "phone" TEXT NOT NULL DEFAULT '',
        "email" TEXT NOT NULL DEFAULT '', "notes" TEXT NOT NULL DEFAULT '',
        "supervisorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "contacts" (
        "id" TEXT NOT NULL, "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "type" "ContactType" NOT NULL,
        "outcome" "ContactOutcome" NOT NULL DEFAULT 'EN_ATTENTE',
        "comment" TEXT NOT NULL DEFAULT '', "companyId" TEXT NOT NULL,
        "beneficiaryId" TEXT, "createdById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "prospections" (
        "id" TEXT NOT NULL,
        "status" "ProspectionStatus" NOT NULL DEFAULT 'EN_COURS',
        "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP(3), "notes" TEXT NOT NULL DEFAULT '',
        "outcome" TEXT NOT NULL DEFAULT '', "companyId" TEXT NOT NULL,
        "beneficiaryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "prospections_pkey" PRIMARY KEY ("id")
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "reminders" (
        "id" TEXT NOT NULL, "date" TIMESTAMP(3) NOT NULL,
        "type" "ReminderType" NOT NULL DEFAULT 'SUIVI',
        "status" "ReminderStatus" NOT NULL DEFAULT 'EN_ATTENTE',
        "comment" TEXT NOT NULL DEFAULT '', "companyId" TEXT NOT NULL,
        "beneficiaryId" TEXT, "createdById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys (ignore if exist)
    const fkeys = [
      'ALTER TABLE "companies" ADD CONSTRAINT "companies_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      'ALTER TABLE "companies" ADD CONSTRAINT "companies_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      'ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      'ALTER TABLE "contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      'ALTER TABLE "contacts" ADD CONSTRAINT "contacts_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE',
      'ALTER TABLE "contacts" ADD CONSTRAINT "contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      'ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
      'ALTER TABLE "prospections" ADD CONSTRAINT "prospections_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      'ALTER TABLE "prospections" ADD CONSTRAINT "prospections_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      'ALTER TABLE "reminders" ADD CONSTRAINT "reminders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE',
      'ALTER TABLE "reminders" ADD CONSTRAINT "reminders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
    ];
    for (const fk of fkeys) {
      try { await prisma.$executeRawUnsafe(fk); } catch (e) { /* ignore duplicate */ }
    }

    // Seed data
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
      where: { email: "admin@mediation-active.re" },
      update: {},
      create: {
        email: "admin@mediation-active.re",
        hashedPassword: adminPassword,
        firstName: "Admin",
        lastName: "Mediation Active",
        role: "ADMIN",
      },
    });

    const referentPassword = await bcrypt.hash("referent123", 12);
    const referent = await prisma.user.upsert({
      where: { email: "referent@mediation-active.re" },
      update: {},
      create: {
        email: "referent@mediation-active.re",
        hashedPassword: referentPassword,
        firstName: "Samuel",
        lastName: "Jean-Baptiste",
        role: "REFERENT",
      },
    });

    const existingCompanies = await prisma.company.count();
    if (existingCompanies === 0) {
      const companies = [
        { companyName: "Carrefour Saint-Denis", address: "Centre Commercial Duparc", city: "Saint-Denis", phone: "0262 21 00 00", sector: "Commerce", contactStatus: "EN_ATTENTE" as const },
        { companyName: "GTOI BTP", address: "ZI du Chaudron", city: "Le Port", phone: "0262 42 00 00", sector: "BTP/VRD", contactStatus: "PMSMP" as const },
        { companyName: "CHU Felix Guyon", address: "Allee des Topazes", city: "Saint-Denis", phone: "0262 90 55 55", sector: "Medico-social", contactStatus: "CONTRAT" as const },
        { companyName: "ATIS Proprete", address: "ZAC 2000", city: "Saint-Pierre", phone: "0262 32 00 00", sector: "ASH", contactStatus: "EN_ATTENTE" as const },
        { companyName: "Hotel Lux Saint-Gilles", address: "Rue des Bains", city: "Saint-Gilles", phone: "0262 24 00 00", sector: "Hotellerie/Restauration", contactStatus: "REFUS" as const },
      ];
      for (const c of companies) {
        await prisma.company.create({ data: { ...c, createdById: referent.id, supervisorId: referent.id } });
      }

      const beneficiaries = [
        { firstName: "Marie", lastName: "Dupont", targetJob: "Aide-soignante" },
        { firstName: "Jean", lastName: "Martin", targetJob: "Macon" },
        { firstName: "Fatima", lastName: "Ali", targetJob: "Agent de proprete" },
      ];
      for (const b of beneficiaries) {
        await prisma.beneficiary.create({ data: { ...b, supervisorId: referent.id } });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized and seeded",
      accounts: {
        admin: "admin@mediation-active.re / admin123",
        referent: "referent@mediation-active.re / referent123"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
