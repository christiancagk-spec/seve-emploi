# Guide de déploiement — Unification BDD AGK/SEVE

## Résumé des modifications

1. **schema.prisma** :
   - `User` → mappé vers `seve_users` (nouvelle table, séparée de `users` AGK)
   - `Beneficiary` → mappé vers `beneficiaires` existante (avec @map sur les colonnes)
   - `beneficiaryId` → passé de `String` à `Int` (dans Contact, Prospection, Reminder)

2. **Routes API** :
   - `GET /api/beneficiaires` : supprimé le filtre supervisorId (tous les SEVE users voient tous les salariés)
   - `POST /api/beneficiaires` : supprimé supervisorId (plus de relation directe)
   - `GET/PATCH /api/beneficiaires/[id]` : parseInt sur l'id

3. **Validations Zod** : `beneficiaryId` changé de `z.string()` à `z.coerce.number().int()`

4. **Seed** : ne crée plus de bénéficiaires de test (ils viennent de la base AGK)

---

## Étapes de déploiement

### Étape 1 — Ajouter la colonne target_job à la base AGK

Connecte-toi à la base Postgres Railway et exécute :

```sql
ALTER TABLE beneficiaires ADD COLUMN IF NOT EXISTS target_job VARCHAR(100) DEFAULT '';
```

### Étape 2 — Changer DATABASE_URL de SEVE sur Railway

Dans le projet Railway de SEVE (agk-app-production-ecf6), change la variable :

```
DATABASE_URL=postgresql://postgres:MOT_DE_PASSE@centerbeam.proxy.rlwy.net:27862/railway
```

(Le mot de passe est sur la page Postgres du projet "awake-caring" → Connect)

### Étape 3 — Push le code modifié

Depuis ton terminal Windows :

```bash
cd seve-emploi
git add prisma/schema.prisma prisma/seed.ts
git add src/app/api/beneficiaires/route.ts
git add src/app/api/beneficiaires/\[id\]/route.ts
git add src/app/api/prospections/route.ts
git add src/lib/validations.ts
git add src/components/beneficiaires/BeneficiaryFormModal.tsx
git commit -m "feat: unification BDD - pointer SEVE vers base AGK existante"
git push origin main
```

### Étape 4 — Appliquer le schéma Prisma

Après le déploiement Railway, dans la console du service ou en local :

```bash
npx prisma db push
```

Ceci va :
- Créer la table `seve_users` (nouvelle)
- Créer les tables `companies`, `contacts`, `prospections`, `reminders`, `company_contacts` (nouvelles)
- Mapper vers la table `beneficiaires` existante (sans la modifier dangereusement)

### Étape 5 — Seed les utilisateurs SEVE

```bash
npx prisma db seed
```

### Étape 6 — Tester

1. Va sur https://agk-app-production-ecf6.up.railway.app/beneficiaires
2. Tu devrais voir les 15 salariés de la base AGK
3. Vérifie que les entreprises fonctionnent toujours
4. Vérifie que l'app AGK principale fonctionne toujours (https://agk-app-production.up.railway.app)
