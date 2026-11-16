# Creator Market : événements « coins » (rapport v4.0)

Deuxième type d'événement du Creator Market. Le premier (cotes OUI / NON) est décrit dans
[`creator-market-facteur.md`](creator-market-facteur.md) et
[`creator-market-liquidite.md`](creator-market-liquidite.md).

Ici le participant **achète des coins** avant le début, la valeur du coin suit un **indice de
popularité**, et les retraits sont payés par le **pool** (somme des achats).

Tout le calcul est fait **par le serveur**. Le frontend affiche des valeurs reçues : indice,
valeur du coin, solde du pool, montant payable. Les seuls calculs d'interface sont la position
des jauges et « nombre de coins × prix » dans le formulaire d'achat (indicatif).

## 1. Ce qui est construit (frontend)

| Écran                         | Contenu                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/cotes/liste` puce « Coins » | Filtres Tous / Achats / En cours / Terminés, cartes d'événement, « Comment ça marche », « Mes coins », feuille de retrait                          |
| `/cotes/coins/:id`            | Valeur du coin, indice (jauge 50–150, courbe), parcours en 4 étapes, notice d'état, statistiques, pool, mes coins, achat, règles et avertissements |

États affichés (section 4 du rapport) : achats ouverts, achats fermés, en cours, clôture en
cours, clôturé, suspendu. Le brouillon n'existe que côté créateur (non construit). La fermeture
des achats, la clôture et le règlement sont **trois choses distinctes** (section 15) : le parcours
« Achats → En cours → Clôture → Règlement » le montre.

Le participant voit toujours séparément : **valeur théorique (non garantie)**, **payable
maintenant**, retrait **en cours** (réservé, pas payé), retiré. Le pool affiche collecté, payé,
réservé, solde distribuable, coins encore détenus et leur valeur théorique.

Données : `src/lib/placeholder-coin-markets.ts`, 6 événements couvrant chaque état et 4 positions.
Les séries d'indice viennent d'une simulation des formules du rapport (K = 100 000, α = 0,02).
Le pool respecte `B = C − W − réservé` dans chaque exemple.

## 2. Contrat attendu de l'API (par événement)

`state`, `maxCoins`, `soldCoins`, `coinPrice`, `index`, `indexHistory`, `coinValue`,
`validatedViews`, `recentViews` (G), `referenceViews` (A), `signal` (S), `poolCollected` (C),
`poolPaid` (W), `poolReserved`, `poolBalance` (B), `heldCoins`, `heldTheoreticalValue`,
`closeReason`, `settlement`. Par position : `coins`, `spent`, `theoreticalValue`, `payableNow`,
`pendingCoins` / `pendingAmount`, `withdrawnCoins` / `withdrawnAmount`. Types dans
`src/types/coin-market.ts`.

## 3. Problèmes relevés dans le rapport v4.0

Ces points sont mesurés avec les formules du rapport telles qu'écrites.

| #   | Constat                                                                                                                                                                                                                                                                                                                                                                                                                            | Proposition                                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **L'indice ne mesure presque que le cumul de vues.** `p(V) = 1 + 2V/(V + K)` croît toujours avec `V`. Simulé sur 24 périodes : 1 500 vues/h constantes atteignent le plafond 150 (au bout d'une journée) et y restent. Une vidéo qui s'éteint (30 vues/h à la fin) est encore à 128. La tendance `F` (2 % par période au plus) ne rattrape pas. Les tests 4 et 5 (« le score stagne / diminue ») ne produisent donc pas de baisse. | Baser l'indice sur la **croissance** (G contre A) plutôt que sur le cumul, ou borner `p`. À simuler avant de figer `K`.                                       |
| 2   | **Le pool ne peut pas couvrir la valeur théorique.** Les coins sont payés 100 % du prix initial mais valent jusqu'à 150 %. Si l'indice dépasse 100, la somme des valeurs théoriques dépasse le pool. Exemple de l'aperçu : 800 coins détenus valent 102 400 FCFA pour 77 872 FCFA de solde.                                                                                                                                        | Afficher l'écart (fait), et décider de la règle de répartition (point 3).                                                                                     |
| 3   | **« Premier retrait, premier payé » transfère l'argent entre participants.** Les premiers retirent au-dessus de leur mise avec l'argent des derniers, qui perdent. Cela crée une course au retrait et rend le jeu à somme nulle entre acheteurs. L'aperçu affiche cette règle comme proposée, car le rapport la décrit.                                                                                                            | Alternative déjà étudiée pour les cotes : taux de couverture identique pour tous (`min(1, B / Σ valeurs)`), qui supprime la course. À trancher avant l'achat. |
| 4   | **Vues antérieures à l'événement.** `V_t` est « cumulé » mais `P_0` suppose `V = 0` au début. Une vidéo déjà populaire serait au plafond dès la première période.                                                                                                                                                                                                                                                                  | Ne compter que les vues validées **depuis le début** de l'événement (hypothèse retenue par l'aperçu).                                                         |
| 5   | **Reliquat du pool.** Le créateur reçoit **2 %** du volume de chaque événement. Un événement clôturé peut encore laisser un reliquat de pool (hors cette commission).                                                                                                                                                                                            | Décider l’affectation du reliquat : redistribution, marge plateforme, ou remboursement.                                                                       |
| 6   | **Montant payable non défini** (« selon les conditions de l'événement »).                                                                                                                                                                                                                                                                                                                                                          | À définir : `min(valeur théorique, solde)` ou taux de couverture.                                                                                             |
| 7   | **Cadre juridique.** Des achats en argent réel avec gains variables en FCFA, financés par les achats d'autres participants, ressemblent à un jeu d'argent. Un événement dont le gain dépend d'une règle de premier arrivé aggrave le risque.                                                                                                                                                                                       | Avis d'un avocat local **avant** tout lancement, comme pour les cotes. Aucun argent réel dans l'application tant que ce point n'est pas réglé.                |

## 4. Différences avec les cotes (OUI / NON)

|                    | Cotes (type 1)                        | Coins (type 2)                                                    |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------- |
| Participation      | Mise libre, côté OUI ou NON           | Achat d'un nombre limité de coins au prix initial, avant le début |
| Valeur             | Facteur 0,5 à 1,5, valeur = mise × r  | Indice 50 à 150, valeur du coin = prix initial × indice ÷ 100     |
| Entrée après début | Possible tant que le pool est couvert | **Impossible** : achats fermés au début                           |
| Répartition        | Taux de couverture commun             | Proposée : premier payé jusqu'à épuisement (à valider)            |

## 5. Décisions encore ouvertes

1. Règle de répartition quand le pool ne couvre pas tout (points 2, 3 et 6).
2. Formule de l'indice : cumul de vues contre croissance, valeur de `K` (point 1).
3. Prix initial, plafond d'achat par personne, fréquence de mise à jour, frais, reliquat.
4. Traitement des paiements en attente, annulations, remboursements, suspensions.
5. Cadre juridique et agrément.

## 6. Non construit

- Création d'événement par le créateur : construite côté interface dans le Creator Studio (vidéo, nombre de coins, prix, début, historique, statistiques), voir [creator-studio.md](creator-studio.md). L'approbation, la publication et les chiffres restent côté serveur.
- Achat : payé depuis le Wallet (demande envoyée au serveur, voir docs/wallet.md section 9). Retrait réel : dépend du serveur, le bouton reste inactif.
- Outils d'administration (suspension, reprise, rapport final).
