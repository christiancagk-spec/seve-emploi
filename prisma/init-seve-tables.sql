-- ============================================================
-- Script SQL pour créer les tables SEVE dans la base AGK partagée.
-- Utilise CREATE TABLE IF NOT EXISTS pour ne rien casser.
-- Ne touche PAS aux tables AGK existantes (beneficiaires, users, etc.)
-- ============================================================

-- Enums nécessaires pour SEVE
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'REFERENT', 'LECTEUR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContactStatus" AS ENUM ('EN_ATTENTE', 'PMSMP', 'CONTRAT', 'REFUS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContactType" AS ENUM ('APPEL', 'EMAIL', 'VISITE', 'AUTRE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContactOutcome" AS ENUM ('POSITIF', 'NEGATIF', 'EN_ATTENTE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ProspectionStatus" AS ENUM ('EN_COURS', 'PMSMP', 'CONTRAT', 'REFUS', 'TERMINE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReminderType" AS ENUM ('SUIVI', 'ECHEANCE', 'OPPORTUNITE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReminderStatus" AS ENUM ('EN_ATTENTE', 'COMPLETE', 'ANNULE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Table seve_users
CREATE TABLE IF NOT EXISTS "seve_users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "hashedPassword" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'REFERENT',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seve_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "seve_users_email_key" ON "seve_users"("email");

-- Ajouter colonnes manquantes à beneficiaires (si elles n'existent pas)
ALTER TABLE "beneficiaires" ADD COLUMN IF NOT EXISTS "target_job" TEXT DEFAULT '';

-- Table companies
CREATE TABLE IF NOT EXISTS "companies" (
  "id" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "address" TEXT NOT NULL DEFAULT '',
  "city" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "sector" TEXT NOT NULL DEFAULT '',
  "contactStatus" "ContactStatus" NOT NULL DEFAULT 'EN_ATTENTE',
  "notes" TEXT NOT NULL DEFAULT '',
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT NOT NULL,
  "supervisorId" TEXT NOT NULL,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "companies_supervisorId_idx" ON "companies"("supervisorId");
CREATE INDEX IF NOT EXISTS "companies_contactStatus_idx" ON "companies"("contactStatus");
CREATE INDEX IF NOT EXISTS "companies_sector_idx" ON "companies"("sector");
CREATE INDEX IF NOT EXISTS "companies_deleted_idx" ON "companies"("deleted");

-- Table company_contacts
CREATE TABLE IF NOT EXISTS "company_contacts" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "position" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
);

-- Table contacts (interactions)
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" "ContactType" NOT NULL,
  "outcome" "ContactOutcome" NOT NULL DEFAULT 'EN_ATTENTE',
  "comment" TEXT NOT NULL DEFAULT '',
  "companyId" TEXT NOT NULL,
  "beneficiaryId" INTEGER,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "contacts_companyId_idx" ON "contacts"("companyId");
CREATE INDEX IF NOT EXISTS "contacts_beneficiaryId_idx" ON "contacts"("beneficiaryId");
CREATE INDEX IF NOT EXISTS "contacts_date_idx" ON "contacts"("date");

-- Table prospections
CREATE TABLE IF NOT EXISTS "prospections" (
  "id" TEXT NOT NULL,
  "status" "ProspectionStatus" NOT NULL DEFAULT 'EN_COURS',
  "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP(3),
  "notes" TEXT NOT NULL DEFAULT '',
  "outcome" TEXT NOT NULL DEFAULT '',
  "companyId" TEXT NOT NULL,
  "beneficiaryId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "prospections_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "prospections_companyId_idx" ON "prospections"("companyId");
CREATE INDEX IF NOT EXISTS "prospections_beneficiaryId_idx" ON "prospections"("beneficiaryId");
CREATE INDEX IF NOT EXISTS "prospections_status_idx" ON "prospections"("status");

-- Table reminders
CREATE TABLE IF NOT EXISTS "reminders" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" "ReminderType" NOT NULL DEFAULT 'SUIVI',
  "status" "ReminderStatus" NOT NULL DEFAULT 'EN_ATTENTE',
  "comment" TEXT NOT NULL DEFAULT '',
  "companyId" TEXT NOT NULL,
  "beneficiaryId" INTEGER,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "reminders_companyId_idx" ON "reminders"("companyId");
CREATE INDEX IF NOT EXISTS "reminders_date_idx" ON "reminders"("date");

-- Foreign keys (ajoutées seulement si elles n'existent pas)
DO $$ BEGIN
  ALTER TABLE "companies" ADD CONSTRAINT "companies_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "seve_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "companies" ADD CONSTRAINT "companies_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "seve_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "seve_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "prospections" ADD CONSTRAINT "prospections_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "prospections" ADD CONSTRAINT "prospections_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reminders" ADD CONSTRAINT "reminders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reminders" ADD CONSTRAINT "reminders_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "reminders" ADD CONSTRAINT "reminders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "seve_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Prisma migrations tracking (pour éviter que prisma db push ne re-tente)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP(3),
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
