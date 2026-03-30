# SEVE Emploi â Module Prospection v3

Application web de suivi de la prospection d'entreprises pour **MÃ©diation Active**.

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de donnÃ©es** : PostgreSQL via Prisma ORM
- **Auth** : NextAuth.js (credentials)
- **DÃ©ploiement** : Railway (Docker)

## Installation locale

```bash
# 1. Installer les dÃ©pendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Configurer votre DATABASE_URL et NEXTAUTH_SECRET dans .env

# 4. GÃ©nÃ©rer le secret NextAuth
openssl rand -base64 32

# 5. Appliquer le schÃ©ma Ã  la base de donnÃ©es
npx prisma db push

# 6. Injecter les donnÃ©es de test
npm run db:seed

# 7. Lancer en dÃ©veloppement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

### Comptes de test

| RÃ´le | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@mediation-active.re | admin123 |
| RÃ©fÃ©rent | referent@mediation-active.re | referent123 |

## DÃ©ploiement sur Railway

### Ãtape 1 : CrÃ©er le projet

1. Allez sur [railway.app](https://railway.app) et connectez-vous
2. Cliquez sur **New Project**
3. Choisissez **Deploy from GitHub repo** et sÃ©lectionnez ce dÃ©pÃ´t

### Ãtape 2 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **+ New** â **Database** â **PostgreSQL**
2. Railway fournit automatiquement la variable `DATABASE_URL`

### Ãtape 3 : Configurer les variables d'environnement

Dans les settings de votre service, ajoutez :

```
NEXTAUTH_URL=https://votre-app.up.railway.app
NEXTAUTH_SECRET=votre-secret-genere
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Ãtape 4 : Initialiser la base

```bash
# Depuis votre machine locale avec la DATABASE_URL de Railway
npx prisma db push
npm run db:seed
```

### Ãtape 5 : DÃ©ployer

Railway dÃ©ploie automatiquement Ã  chaque push sur la branche main.

## Structure du projet

```
src/
âââ app/
â   âââ (auth)/login/       # Page de connexion
â   âââ (dashboard)/        # Layout principal avec sidebar
â   â   âââ dashboard/      # Tableau de bord
â   â   âââ entreprises/    # CRUD entreprises
â   â   âââ beneficiaires/  # Liste bÃ©nÃ©ficiaires
â   â   âââ recherche/      # Recherche avancÃ©e
â   â   âââ admin/          # Administration
â   âââ api/                # API Routes
â       âââ auth/           # NextAuth
â       âââ entreprises/    # CRUD API
â       âââ contacts/       # Interactions
â       âââ rappels/        # Rappels
â       âââ beneficiaires/  # API bÃ©nÃ©ficiaires
âââ components/
â   âââ layout/             # Sidebar, Header
â   âââ entreprises/        # Formulaires entreprise
â   âââ ui/                 # Composants rÃ©utilisables
âââ lib/
â   âââ prisma.ts           # Client Prisma singleton
â   âââ auth.ts             # Config NextAuth
â   âââ auth-helpers.ts     # Helpers d'authentification
â   âââ validations.ts      # SchÃ©mas Zod
â   âââ sectors.ts          # Liste des secteurs (source unique)
âââ middleware.ts            # Protection des routes
prisma/
âââ schema.prisma           # ModÃ¨le de donnÃ©es (7 tables)
âââ seed.ts                 # DonnÃ©es initiales
```

## ModÃ¨le de donnÃ©es

7 tables PostgreSQL : `users`, `companies`, `contacts`, `beneficiaries`, `prospections`, `reminders`, `company_contacts`.

Voir `prisma/schema.prisma` pour le dÃ©tail complet.
