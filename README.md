# SEVE Emploi — Module Prospection v3

Application web de suivi de la prospection d'entreprises pour **Médiation Active**.

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL via Prisma ORM
- **Auth** : NextAuth.js (credentials)
- **Déploiement** : Railway (Docker)

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Configurer votre DATABASE_URL et NEXTAUTH_SECRET dans .env

# 4. Générer le secret NextAuth
openssl rand -base64 32

# 5. Appliquer le schéma à la base de données
npx prisma db push

# 6. Injecter les données de test
npm run db:seed

# 7. Lancer en développement
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@mediation-active.re | admin123 |
| Référent | referent@mediation-active.re | referent123 |

## Déploiement sur Railway

### Étape 1 : Créer le projet

1. Allez sur [railway.app](https://railway.app) et connectez-vous
2. Cliquez sur **New Project**
3. Choisissez **Deploy from GitHub repo** et sélectionnez ce dépôt

### Étape 2 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur **+ New** → **Database** → **PostgreSQL**
2. Railway fournit automatiquement la variable `DATABASE_URL`

### Étape 3 : Configurer les variables d'environnement

Dans les settings de votre service, ajoutez :

```
NEXTAUTH_URL=https://votre-app.up.railway.app
NEXTAUTH_SECRET=votre-secret-genere
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Étape 4 : Initialiser la base

```bash
# Depuis votre machine locale avec la DATABASE_URL de Railway
npx prisma db push
npm run db:seed
```

### Étape 5 : Déployer

Railway déploie automatiquement à chaque push sur la branche main.

## Structure du projet

```
src/
├── app/
│   ├── (auth)/login/       # Page de connexion
│   ├── (dashboard)/        # Layout principal avec sidebar
│   │   ├── dashboard/      # Tableau de bord
│   │   ├── entreprises/    # CRUD entreprises
│   │   ├── beneficiaires/  # Liste bénéficiaires
│   │   ├── recherche/      # Recherche avancée
│   │   └── admin/          # Administration
│   └── api/                # API Routes
│       ├── auth/           # NextAuth
│       ├── entreprises/    # CRUD API
│       ├── contacts/       # Interactions
│       ├── rappels/        # Rappels
│       └── beneficiaires/  # API bénéficiaires
├── components/
│   ├── layout/             # Sidebar, Header
│   ├── entreprises/        # Formulaires entreprise
│   └── ui/                 # Composants réutilisables
├── lib/
│   ├── prisma.ts           # Client Prisma singleton
│   ├── auth.ts             # Config NextAuth
│   ├── auth-helpers.ts     # Helpers d'authentification
│   ├── validations.ts      # Schémas Zod
│   └── sectors.ts          # Liste des secteurs (source unique)
└── middleware.ts            # Protection des routes
prisma/
├── schema.prisma           # Modèle de données (7 tables)
└── seed.ts                 # Données initiales
```

## Modèle de données

7 tables PostgreSQL : `users`, `companies`, `contacts`, `beneficiaries`, `prospections`, `reminders`, `company_contacts`.

Voir `prisma/schema.prisma` pour le détail complet.
