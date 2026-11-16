# Market Event Africa : analyse du rapport et décisions corrigées

Ce document recense les incohérences du rapport initial et fixe, pour chacune, la règle retenue.
Il sert de référence aux agents Frontend et Backend. Les numéros renvoient aux sections du rapport.

## 1. Règles métier ambiguës

| #   | Section      | Problème                                                                                                                                                | Règle retenue                                                                                                                                                                                                                                                  |
| --- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 7, 8, 12, 46 | « Participer » et « Acheter » coexistent sans définition.                                                                                               | **Participer** = s'inscrire à l'événement (gratuit, sans paiement, annulable) : rappel, accès au live, éligibilité aux jeux. **Acheter** = créer une commande. Un achat pendant l'événement inscrit automatiquement l'acheteur.                                |
| 2   | 15, 29       | Les statuts `PENDING` et `PAYMENT_PENDING` font doublon. `REVIEW_REQUIRED` (anti-fraude) n'est pas dans la liste. Il manque les échecs et l'expiration. | `PENDING_PAYMENT` → `PAID` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`. Sorties : `FAILED`, `EXPIRED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`. `REVIEW_REQUIRED` s'intercale entre `PENDING_PAYMENT` et `PAID`.                              |
| 3   | 8            | Aucune règle contre la survente d'une vente flash (50 unités, des milliers de clients).                                                                 | Réservation atomique du stock à la création de la commande, avec durée limitée (ex. 10 min). Libération en cas d'échec ou d'expiration. Limite d'achat par utilisateur définie par l'événement.                                                                |
| 4   | 22           | L'exemple de commission (90 000 / 5 000 / 5 000) ignore les frais du prestataire de paiement, l'absence de créateur, les coupons et les arrondis.       | Commission calculée sur le montant **net après remise**, en entiers (FCFA, sans décimales), règle d'arrondi unique. Sans créateur : 0 % créateur. Frais du prestataire : à trancher (plateforme ou vendeur), l'exemple n'est exact que si ces frais sont nuls. |
| 5   | 17           | « Expiration 23:59 » sans fuseau (l'Afrique couvre plusieurs fuseaux). Cumul coupon + prix événement non défini.                                        | Dates stockées en UTC, affichées dans le fuseau du pays. Cumul coupon + prix événement **interdit par défaut**, autorisable par l'organisateur.                                                                                                                |
| 6   | 18, 19       | Points fixes (« Achat = +50 ») facilement abusables. Parrainage récompensé dès le premier achat.                                                        | Points attribués après `PAID` (parrainage : après `DELIVERED`), repris en cas de remboursement, plafonnés par jour.                                                                                                                                            |
| 7   | 9.6, 9.7     | Jeux et tirages sans mention du cadre légal. « Règles transparentes » non vérifiables.                                                                  | Avis juridique par pays avant ouverture. Tirage réalisé par le serveur, règles publiées avant le début, journal d'audit conservé. L'organisateur ne choisit pas les gagnants.                                                                                  |
| 8   | 10, 14       | « Acheter sans quitter le live » : le Mobile Money se confirme de façon asynchrone.                                                                     | L'interface affiche « paiement en attente » dans le live. La confirmation vient du prestataire (webhook idempotent), jamais du retour dans l'application.                                                                                                      |
| 9   | 14           | Un « portefeuille interne » est évoqué alors que le projet AfriConnect a un module Wallet.                                                              | MVP : pas de portefeuille interne, paiement via un prestataire agréé. Le Wallet reste un module séparé, soumis à validation réglementaire.                                                                                                                     |
| 10  | 4            | Rôles présentés comme des types d'utilisateurs séparés.                                                                                                 | Un utilisateur cumule des rôles (client + créateur + vendeur). Permissions portées par les rôles, pas par le type de compte.                                                                                                                                   |

## 2. Périmètre et architecture

| #   | Section | Problème                                                                                                                | Règle retenue                                                                                                                                        |
| --- | ------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11  | 30, 31  | Le schéma montre des microservices, le texte demande une architecture modulaire.                                        | **Monolithe modulaire** : un module par service du schéma, frontières nettes, extractible plus tard.                                                 |
| 12  | 36      | Le rapport recommande Flutter ; le projet est une application React (Vite).                                             | Le frontend reste React (PWA). Le contrat d'API est indépendant du client : une appli Flutter pourrait venir plus tard.                              |
| 13  | 37, 46  | La phase 1 inclut « marketplace » et les deux dashboards, alors que la section 46 déconseille un marketplace important. | Phase 1 : un vendeur, des produits, un événement, une vente. Marketplace simple (liste + fiche). Dashboard admin minimal (vérification, suspension). |
| 14  | 6.1, 7  | L'accueil exige créateurs populaires, feed et recommandations (phases 2 et 4) dès le départ.                            | Accueil phase 1 : en cours, à venir, offres flash, produits populaires (tri par participants). Créateurs en phase 2, recommandations en phase 4.     |
| 15  | 13      | Le panier gère coupons et livraison, absents de la phase 1.                                                             | Phase 1 : pas de coupon, livraison simple (retrait ou frais fixe). Coupons et zones en phase 2.                                                      |
| 16  | 42      | Plans FREE à ENTERPRISE cités sans contenu.                                                                             | MVP : commission seule. Abonnements après validation du marché.                                                                                      |
| 17  | 6       | La section 6 ne contient que 6.1 : écrans manquants.                                                                    | À prévoir : page événement, fiche produit, checkout, suivi de commande, notifications.                                                               |

## 3. Contrat d'API et données

| #   | Section | Manque                                                                | Ajout retenu                                                                                                                                                           |
| --- | ------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 18  | 34      | Pas d'inscription à un événement, pas de webhook, pas d'annulation.   | `POST /v1/events/{id}/participation`, `DELETE` idem, `POST /v1/payments/webhooks/{provider}`, `POST /v1/orders/{id}/cancel`.                                           |
| 19  | 34      | Pas de versionnement, pagination ni idempotence.                      | Préfixe `/v1`, pagination par curseur, en-tête `Idempotency-Key` sur les commandes et paiements.                                                                       |
| 20  | 32      | Tables manquantes.                                                    | `event_participations`, `stock_reservations`, `payment_events`, `order_status_history`, `addresses`, `live_messages`, `ledger_entries`. `followers` devient `follows`. |
| 21  | 8, 10   | Compte à rebours calculé avec l'horloge du téléphone, souvent fausse. | L'API renvoie `serverTime`, `startsAt`, `endsAt`. Le client corrige son décalage ; seul le serveur décide si l'événement est ouvert.                                   |

## 4. Ce qui a été corrigé dans le frontend

- **Un seul parcours, sans écran supplémentaire :** « Participer » ouvre une feuille dans le fil. Elle montre le détail (offre, prix, stock, compte à rebours, principe de l'événement), puis le paiement (quantité, moyen de paiement, numéro Mobile Money, total). Il n'y a plus de page d'événement séparée.
- **Le paiement n'est pas simulé :** le bouton « Payer » vérifie le formulaire, puis affiche que le paiement est indisponible dans la démonstration et qu'aucune somme n'est débitée. Le total affiché est indicatif : le serveur vérifie prix, stock et paiement.
- **Libellés des boutons :** « Participer » n'apparaît que sur un événement en cours. Sur un événement à venir ou terminé, le bouton devient « Voir l'événement » (la feuille propose alors « Me rappeler » ou signale la fin).
- **Cartes bancaires :** aucun champ de carte dans l'application : redirection vers la page du prestataire.
- **Lien partageable :** `/explorer/evenements?evenement=<id>` ouvre le fil directement sur l'événement.
- **Fil plein écran :** une carte ne disparaît plus sous le doigt quand son compte à rebours arrive à zéro. Les événements terminés ne sont retirés qu'au changement de catégorie.

## 5. Reste hors périmètre frontend

Réservation de stock, paiement, webhooks, commissions, coupons, points, tirage au sort, anti-fraude et horloge serveur relèvent du backend. Le frontend ne contient aucune de ces logiques.

## 6. Deux mécanismes de promotion participative (loterie marketing, réduction collective)

Ajoutés d'après le « Rapport global : mécanismes de promotion commerciale participative » et la maquette « Vente flash » (informations, progression en temps réel, barre « Participation »). Ils ont leur **propre écran de participation** (`/explorer/evenements/:id`) au lieu de la feuille du fil : il y a beaucoup plus à montrer avant de payer.

### Ce que montre l'écran

- **Informations** : produit ou lot, valeur du lot / prix initial, participation (ou « Gratuite »), maximum de participants / stock, nombre de gagnants, date de fin.
- **Progression en temps réel** : participants, montant collecté, temps restant ; pour la réduction collective, prix initial, prix actuel, montant de la réduction et paliers (atteints, prochain, à venir).
- **Étapes** : loterie = Publication, Participation, Clôture, Sélection, Attribution ; réduction collective = Publication, Contributions, Clôture (prix arrêté), Achats au prix final.
- **Transparence (§16 du rapport)** : organisateur, description, conditions, dates, sélection ou règle de réduction, financement, remise des lots ou conditions d'achat, remboursement, résultats.
- **Barre d'action** : « Participer » / « Contribuer » avec le montant ; « Acheter au prix final » après la clôture d'une réduction collective ; message explicatif quand rien n'est possible (complet, clos, stock épuisé).
- **Feuille de participation** : paiement (composant `PaymentFields`, partagé avec la feuille du fil), case « J'ai lu les règles » obligatoire, quantité plafonnée au stock pour l'achat. Le paiement et l'inscription restent indisponibles dans la démonstration.

### Écarts avec les décisions précédentes

- La décision n°1 (« Participer » = inscription gratuite, « Acheter » = commande) ne vaut pas pour ces deux formats : participer y est une contribution **éventuellement payante**. À trancher côté produit : ces deux formats ne devraient-ils pas avoir un vocabulaire distinct (« Participer au tirage », « Contribuer ») pour éviter la confusion avec l'achat ?
- La maquette mélange le titre « Vente flash » et des champs de loterie, avec le bouton « Acheter maintenant ». Le frontend suit le rapport (loterie = « Participer »).

### Points que le rapport laisse ouverts (aucune règle inventée côté frontend)

- **Loterie** : 2 700 participants × 300 FCFA = 810 000 FCFA collectés pour un lot de 25 000 FCFA (dans les données d'exemple, repris de la maquette). Où va l'écart ? Quelle part est reversée ? C'est le point le plus sensible juridiquement.
- **Réduction collective** : formule de la réduction (les paliers affichés sont un format d'exemple), qui finance la remise (vendeur, plateforme ?), seuil minimum de contributions, que devient une contribution si le seuil n'est pas atteint, ce qu'un contributeur obtient de plus qu'un acheteur qui n'a pas contribué (sinon, intérêt de passer en dernier), limite par personne.
- Les textes « financement » et « remboursement » sont affichés **« À définir »** dans les données d'exemple : ils ne doivent pas être remplacés par un texte inventé.
- **Note juridique du rapport** : une loterie à participation payante avec tirage au sort peut relever de la réglementation sur les jeux d'argent ; les contributions d'une réduction collective supposent un cadre sur la collecte, la conservation, l'affectation et le remboursement. À vérifier pour le Burkina Faso et chaque pays de déploiement avant toute ouverture. L'écran le rappelle dans son bandeau de démonstration.

### Côté frontend

- `EventKind` gagne `lottery` et `collective` ; `MarketEvent` porte `lottery?`, `collective?` et `terms?`. Toutes les valeurs (montant collecté, prix actuel, gagnants, étape) viennent du serveur. Le frontend n'affiche que la différence prix initial − prix actuel et le pourcentage.
- L'Espace Pro ne propose pas encore ces deux formats (leur formulaire de création reste à faire).
- Exemples : `evt-lottery-bio` (en cours, d'après la maquette), `evt-lottery-phone` (à venir, gratuite), `evt-lottery-done` (gagnant annoncé), `evt-collective-phone` (en cours), `evt-collective-done` (prix arrêté, achats ouverts). Les événements terminés ne sont pas dans le fil : on y accède par leur adresse directe.

### Mécanisme du tirage au sort (loterie marketing)

Carte « Mécanisme du tirage au sort » sur l'écran de la loterie : clôture (liste figée), tirage par le serveur (date et méthode annoncées), annonce des résultats avec preuve ; lignes « Gagnants tirés », « Chances par participant », « Preuve du tirage ». Le frontend n'exécute aucun tirage et ne calcule aucune probabilité : `EventLottery` porte `drawMethod`, `drawAt`, `entriesPerPerson`, `proofRef`, fournis par le serveur.

À définir côté produit et backend (non tranché par le rapport) :

- **Équité vérifiable** : comment prouver que le tirage n'est pas truqué (journal signé, empreinte publiée avant le tirage, graine publique) ? L'écran affiche une « preuve » mais son format reste à définir.
- **Chances** : une personne peut-elle participer plusieurs fois ? Si oui, plus de participations = plus de chances (le champ `entriesPerPerson` le permet), avec quelle limite ?
- **Plusieurs gagnants** : une même personne peut-elle gagner deux fois ? Y a-t-il des suppléants si un gagnant ne répond pas ?
- **Éligibilité** : compte vérifié, âge, pays, exclusion de l'organisateur et de ses proches.
- **Délai** entre clôture et tirage, et délai de réclamation du lot.
- **Probabilité affichée** : afficher « 1 chance sur N » est utile à la transparence, mais ne doit venir que du serveur, et n'est connue qu'à la clôture.
- **Cadre légal** : le tirage au sort avec participation payante est le cœur du risque « jeux d'argent » de la note juridique.
