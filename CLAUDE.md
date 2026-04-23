# SEVE Emploi — Prospection Entreprises — Contexte Claude Code

## Ce projet

Module de prospection entreprises pour placements des salaries en transition (PMSMP, stages, CDD, CDI).
- **URL prod** : https://agk-app-production-ecf6.up.railway.app
- **Login** : voir gestionnaire de mots de passe
- **Stack** : Next.js 14 + Prisma + PostgreSQL + NextAuth.js + Tailwind CSS
- **Deploy** : push GitHub (main) → Railway auto-deploy

## REGLE CRITIQUE

**NE JAMAIS** utiliser `prisma db push` ou `prisma migrate` — la BDD est PARTAGEE avec AGK App et les autres modules. Prisma supprime les tables qu'il ne connait pas. Utiliser uniquement `prisma generate` + SQL brut.

## BDD PostgreSQL PARTAGEE

```
Host: centerbeam.proxy.rlwy.net:27862
DB: railway / User: postgres
Password: voir variables Railway
```

## Modeles Prisma

### Tables SEVE (ecriture)
- `Company` → entreprises prospectees (18 importees)
- `CompanyContact` → contacts en entreprise
- `Prospection` → placements (PMSMP, Stage, CDD, CDI, Apprentissage, Interim)
- `Reminder` → rappels de suivi
- `User` → utilisateurs SEVE (table seve_users)

### Tables CIP (lecture seule, ajoutees avril 2026)
- `Entretien` → entretiens CIP (compteurs + 5 derniers)
- `EvaluationCip` → evaluations (score moyen)
- `Pmsmp` → immersions CIP
- `Emploi` → sorties emploi

### Relations Beneficiary
- Relations SEVE : prospections, contacts, reminders
- Relations CIP (lecture seule) : entretiens, evaluationsCip, pmsmpList, emplois

## Pages

- `/dashboard` — 5 KPIs, rappels, entreprises recentes
- `/entreprises` — Liste + filtres + CRUD
- `/entreprises/[id]` — Detail avec contacts, prospections
- `/beneficiaires` — Liste salaries avec compteurs entretiens/evaluations
- `/beneficiaires/[id]` — Detail + section "Parcours CIP" (entretiens, scores, PMSMP, emplois)
- `/recherche` — Recherche entreprises
- `/rapports` — KPIs complets
- `/admin` — Gestion utilisateurs

## API

- `/api/entreprises` — CRUD
- `/api/beneficiaires` — GET/PATCH (avec _count entretiens + evaluationsCip)
- `/api/beneficiaires/[id]/cip` — GET donnees CIP (lecture seule)
- `/api/prospections` — CRUD placements
- `/api/contacts` — CRUD contacts
- `/api/rappels` — CRUD rappels
- `/api/recherche` — Recherche
- `/api/rapports` — Stats agregees

## Comptes

- admin@angrenkouler.fr (ADMIN)
- gaellepavot.agk@gmail.com (REFERENT)
- emilie.perrine@federationsolidarite.org (REFERENT)
- Mots de passe : voir gestionnaire securise
