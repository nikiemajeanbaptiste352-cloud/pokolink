# Rewards (points de fidélité)

Frontend uniquement. Aucune API, table, migration ni règle financière n'est touchée.

## 1. Périmètre

- Écran `/rewards` : solde disponible, points en attente, actions rapides, activité récente.
- Entrée depuis **Profil** (carte « Rewards »). Pas d'onglet dédié dans la nav principale.
- Parcours : Gagner, Missions publicitaires, Transférer, Utiliser, Historique.
- Données d'exemple signalées par une note de démonstration.

## 2. Routes

| Route | Écran |
| --- | --- |
| `/rewards` | Accueil Rewards |
| `/rewards/gagner` | Comment gagner des points |
| `/rewards/missions` | Missions publicitaires (vues, visites, abonnements) |
| `/rewards/transfert` | Demande de transfert (en attente serveur) |
| `/rewards/utiliser` | Utiliser des points |
| `/rewards/historique` | Journal |

## 3. Missions publicitaires (rapport §9)

- Types : vue, visite, abonnement — plafonds journaliers 10 / 3 / 4.
- Points nominaux selon le forfait de la campagne (Bronze / Argent / Or).
- Démo frontend : « Faire la mission », paiement confirmé et participation créditent les
  points **immédiatement** (`rewards-earn-store` + solde démo). Pas de points liés au
  scanner. En production, le serveur reste la source de vérité.

## 4. Règles respectées

- Points distincts du Wallet FCFA : ni retrait en FCFA, ni conversion Mobile Money.
- Aucune conversion points ↔ FCFA affichée.
- Le serveur est la source de vérité. Le client ne crédite, ne débite et ne réserve rien.
- Chaque opération a une référence et un statut.

## 5. Fichiers clés

| Fichier | Rôle |
| --- | --- |
| `src/types/rewards.ts` / `ad-missions.ts` | Types soldes, opérations, missions ads |
| `src/lib/placeholder-ad-missions.ts` | Missions d'exemple |
| `src/lib/ad-mission-requests-store.ts` | Demandes EARN locales « en attente » |
| `src/pages/rewards/RewardsAdsPage.tsx` | Écran missions |
| `src/components/rewards/AdMissionCard.tsx` | Carte mission |
