# Publicité (Espace Pro)

Frontend uniquement. Aucune API, table, migration ni règle financière n'est touchée.

## Où

Espace Pro → carte d'un établissement → « Créer une publicité », ou rubrique **Publicité** du
tableau de bord (`/services/:serviceId/publicite`). Pas de nouvel onglet de navigation.

## Types de publicité

- **Mon établissement** : faire connaître la page, gagner des abonnés.
- **Un produit ou une prestation** : met en avant un élément du catalogue.
- **Une promotion** : annonce une offre ou un événement ponctuel.

## Forfaits V5 (rapport Rewards, section 9)

| Forfait | Prix | Vues | Visites | Abonnés | Budget Rewards |
| --- | --- | --- | --- | --- | --- |
| Bronze | 1 000 FCFA | 5 000 | 500 | 50 | 500 FCFA (5 000 pts) |
| Argent | 5 000 FCFA | 30 000 | 3 000 | 300 | 2 500 FCFA (25 000 pts) |
| Or | 15 000 FCFA | 100 000 | 10 000 | 1 000 | 7 500 FCFA (75 000 pts) |

Missions rémunérées affichées à titre d'information (vue, visite, abonnement) avec leurs
plafonds quotidiens (10 / 3 / 4). Les valeurs viennent du rapport ; le serveur reste la
référence (décimales, reliquats, anti double récompense).

## Parcours de création

1. **Forfait** : choix du forfait, des **canaux de diffusion** (Accueil, Explorer,
   publications) et aperçu des missions Rewards.
2. **Type** : établissement, produit/prestation ou promotion.
3. **Annonce** : titre, texte, bouton, image, aperçu (marquée **Sponsorisé**).
4. **Paiement** : Wallet FCFA, code PIN (finalité `advertising`). En démo frontend, la
   campagne passe en diffusion sur les canaux choisis.
5. **Suivi** : liste (`CampaignCard` avec canaux + objectifs) et détail
   (`/services/:serviceId/publicite/:campaignId`) : gestion centralisée des publications
   sponsorisées.

Diffusion démo : Accueil (panneau À la une + fil) / Explorer (rail Sponsorisé + rails
populaires partagés via `recommendations.ts`) + onglet Publications de l’établissement.
Missions Rewards (`/rewards/missions`) dérivées des campagnes actives.

## Règles respectées

- Une publicité sponsorisée n'est pas une mission Rewards : seules les campagnes avec budget
  Rewards apparaissent dans les missions. Le frontend ne diffuse rien, ne mesure rien et
  n'attribue aucun point.
- Aucun solde modifié côté client ; le serveur confirme le paiement, valide l'annonce et décide
  de la diffusion.
- Les campagnes d'exemple (`src/lib/placeholder-ads.ts`) sont temporaires.
