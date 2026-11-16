# Creator Market : valorisation, distribution et insuffisance du pool

Ce document répond aux trois points laissés ouverts par le rapport de liquidité : formules de
valorisation, choix du modèle de distribution, règles d'insuffisance. Toutes les formules
sont calculées **par le serveur** ; le frontend n'affiche que les montants reçus.

Ce sont des propositions à simuler, pas des valeurs démontrées. Si les mises sont de l'argent
réel ou des points convertibles, une analyse juridique est nécessaire **avant** tout lancement
(les paris et jeux d'argent sont encadrés, parfois réservés à un opérateur national : à
vérifier avec un avocat local pour le Burkina Faso).

## 1. Modèle retenu : distribution limitée par le pool, au taux de couverture

| Modèle                         | Verdict                                                                                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A, paiement garanti            | Écarté : AfriConnect devient le teneur de paris et doit détenir des réserves couvrant le gain maximal. Risque financier et réglementaire élevé. |
| C, marché acheteurs / vendeurs | Écarté pour le prototype : demande des contreparties réelles et un algorithme de liquidité. À revoir quand il y aura du volume.                 |
| **B, limité par le pool**      | **Retenu.** Ne promet jamais plus que les fonds réellement présents. Solvable par construction.                                                 |

Retenue dans le modèle B : le retrait n'est **pas** « premier arrivé, premier servi ». Tous les
participants sont payés au **même taux de couverture** à un instant donné. Cela supprime la
course au retrait évoquée dans le rapport (« les premiers retraits réduisent la liquidité »).

## 2. Formules de valorisation

Notations pour une position _i_ : mise `M`, facteur à l'entrée `Fe`, facteur actuel `Ft`,
rapport `r = Ft / Fe`.

| Grandeur             | Formule                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| Valeur théorique OUI | `V = M × r`                                                                        |
| Valeur théorique NON | `V = M × max(0, 2 − r)`                                                            |
| Gain ou perte latent | `L = V − M`                                                                        |
| Montant net demandé  | `N = V − φ × max(0, V − M)` (φ = frais sur les gains, paramètre ; 0 en simulation) |
| Fonds disponibles    | `D = solde total − fonds réservés − obligations exigibles non réglées`             |
| Taux de couverture   | `c = min(1, D / ΣN)`, somme sur toutes les positions ouvertes                      |
| Montant payable      | `P = arrondi inférieur(N × c)`                                                     |

Tous les montants sont des entiers en FCFA, arrondis vers le bas ; le reliquat reste dans le pool.

Exemples vérifiés :

- OUI, 10 000 FCFA entrés à 1,008, facteur à 1,0164 : valeur théorique **10 083 FCFA**.
- NON, 20 000 FCFA entrés à 1,000, facteur à 0,971 : valeur théorique **20 580 FCFA**. Avec c = 0,82, montant payable **16 875 FCFA**.
- Exemple du rapport : pool de 50 000, positions valant 70 000 : `c = 0,714`, chacun reçoit 71,4 % de son net.

**Pas d'avantage au premier qui sort.** Quand `c < 1`, un retrait paie `N × c` et retire `N` de `ΣN` :
le nouveau taux est `(D − N×c) / (ΣN − N) = D / ΣN = c`. Il ne change pas. Vérifié sur
30 000 / 25 000 / 15 000 avec un pool de 50 000 : trois retraits successifs, taux constant 0,7143, pool à 0.

## 3. Règles d'insuffisance

| État du pool | Condition                                                  | Effets                                                                                                                                                                                                               |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Couvert**  | `c ≥ 1`                                                    | Retraits payés à 100 % du net. Nouvelles positions autorisées dans les plafonds.                                                                                                                                     |
| **Limité**   | `0 < c < 1`                                                | Retraits payés à `N × c`, montant exact affiché avant confirmation. **Nouvelles positions bloquées** (un nouvel entrant paierait sa mise pleine pour sortir à moins de 100 %). Historique et montants dus conservés. |
| **Suspendu** | `D ≤ 0`, données incohérentes ou décision d'administration | Aucun paiement. Positions conservées, montants dus enregistrés, participants informés. À la clôture : règlement de toutes les positions au taux `c` du moment.                                                       |

Règles communes :

1. Un pool vide ne supprime aucune position : les montants dus restent enregistrés.
2. Les retraits d'un même événement sont traités **un par un** (verrou sur le registre de l'événement), avec clé d'idempotence, pour empêcher deux retraits sur les mêmes fonds.
3. Le montant proposé est valable quelques secondes. S'il change avant la confirmation, le participant doit confirmer de nouveau.
4. Les obligations prioritaires (remboursements, frais) sont réglées avant les paiements.
5. Le participant voit toujours trois chiffres distincts : valeur théorique, net demandé, **payable maintenant**.

## 4. Incohérences relevées dans le rapport de liquidité

| #   | Problème                                                                                                                                                                                                                                      | Correction proposée                                                                                                                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Exemple de la section 6 : pool de 100 000 FCFA mais 60 000 FCFA de mises listées, d'où viennent les 40 000 autres ?                                                                                                                           | Un pool égale la somme des mises moins les paiements. Les positions des autres participants doivent figurer dans `ΣN`.                                                                     |
| 2   | Le pool n'a que les mises pour payer : si le camp favorisé est plus lourd, `ΣV` dépasse le pool dès que le facteur bouge. Avec 30 000 sur OUI et 20 000 sur NON : à r = 1,05 les positions valent 50 500 pour 50 000 en caisse (`c = 0,990`). | **Plafond de déséquilibre** : bloquer les mises sur le camp le plus lourd quand `                                                                                                          | OUI − NON | / pool`dépasse un seuil. Le déficit maximal vaut environ` | OUI − NON | × (r − 1)`. |
| 3   | La valorisation du camp NON n'est pas définie (« le sens est inversé »).                                                                                                                                                                      | Formule miroir `2 − r` ci-dessus. À noter : gain NON limité à 2× la mise, gain OUI jusqu'à 3×.                                                                                             |
| 4   | Le facteur se met à jour toutes les heures, mais les vues sont visibles en continu : on peut prévoir la prochaine mise à jour et entrer juste avant (gain presque sans risque), puis sortir tout de suite.                                    | **Fenêtre de gel** : mises et retraits fermés quelques minutes avant chaque mise à jour.                                                                                                   |
| 5   | « Retrait instantané » et « premiers servis » créent une course au retrait.                                                                                                                                                                   | Taux de couverture identique pour tous (section 2).                                                                                                                                        |
| 6   | Aucun frais ni arrondi n'est défini.                                                                                                                                                                                                          | Frais φ sur les gains, entiers, arrondi vers le bas.                                                                                                                                       |
| 7   | Les vues peuvent être gonflées, y compris par le créateur ou ses proches.                                                                                                                                                                     | Vues validées uniquement, créateur exclu de ses propres événements, détection de fraude côté serveur.                                                                                      |
| 8   | Le rapport sur le facteur dit « les points ne sont pas de l'argent », alors que le rapport de liquidité parle de mises, de retraits et de pool en FCFA. Les deux ne peuvent pas être vrais en même temps.                                     | À trancher : points sans valeur monétaire (alors pas de retrait en argent) ou mises réelles (alors cadre juridique et Wallet). Le frontend affiche des FCFA de démonstration en attendant. |

## 5. Décisions encore ouvertes

1. Affectation du reliquat à la clôture quand `c = 1` : marge de la plateforme annoncée avant les mises, ou redistribution aux positions gagnantes.
2. Valeur de φ (frais) et du seuil de déséquilibre.
3. Durée de la fenêtre de gel et durée de validité du montant proposé.
4. Volume minimal de vues pour que le signal compte (un petit créateur est très bruité).
5. Cadre juridique et agrément nécessaires.

## 6. Côté frontend

Le frontend n'a aucune de ces formules. Il affiche : l'état du pool et son taux de couverture, la position du participant (mise, valeur théorique, gain ou perte latent, net, payable maintenant), et la feuille de retrait avec les montants fournis par le serveur. La mise se paie depuis le Wallet (demande « en attente », le serveur décide) ; le bouton de retrait reste inactif.
