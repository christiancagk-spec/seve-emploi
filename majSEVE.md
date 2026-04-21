# Suivi des mises a jour - SEVE Emploi

## 2026-04-21 — Diagnostic : changement de role non pris en compte cote utilisateur
- **Symptome** : admin change le role d'un utilisateur (ex: David LI-FOK-WAI de REFERENT a ADMIN).
  Le changement est bien enregistre en base et visible dans la liste, mais l'utilisateur reste
  bloque avec son ancien role apres reconnexion.
- **Cause racine** : `src/lib/auth.ts` callback `jwt` (lignes 77-85) ne recupere le role depuis
  la DB qu'au moment du login initial (`if (user) { token.role = user.role; }`). Le cookie JWT
  NextAuth conserve ensuite l'ancien role pendant toute la duree de vie du token (24h max, voir
  `session.maxAge`).
- **Contournement immediat** : l'utilisateur doit cliquer **Deconnexion** puis se reconnecter
  (pas juste rafraichir). Au nouveau login, `authorize` relit user.role en base et ecrit le
  nouveau JWT.
- **Ameliorations possibles** (a decider) :
  1. Refetch du role a chaque requete dans `jwt` callback (simple, mais +1 query DB par appel)
  2. Invalider la session cote admin (ex: incrementer un `tokenVersion` sur User, le stocker
     dans le JWT, le comparer a chaque appel)
  3. Bouton "Forcer deconnexion" dans la page Administration pour invalider cote serveur
- **Pas de modification de code** cette session — diagnostic et communication utilisateur seulement.
