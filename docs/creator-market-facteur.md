# Creator Market : règles du facteur

Document de référence pour le facteur affiché dans l'application. Tout est calculé **par le
serveur** ; le frontend affiche les valeurs reçues. La liquidité et les retraits sont dans
[`creator-market-liquidite.md`](creator-market-liquidite.md).

## 1. Formule

À chaque période (toutes les heures par défaut) :

```
S = (G − A) / (G + A)            signal, entre −1 et +1
F(t+1) = F(t) × (1 + 0,02 × S)   puis borné entre 0,5 et 1,5
```

- `G` : vues validées par heure sur la période récente.
- `A` : moyenne de référence, calculée sur les 6 périodes précédentes.
- Départ neutre à `F = 1,000`.

Exemple (Awa Diallo) : `G = 1 900`, `A = 1 558`, `S = 0,099`, donc le facteur monte d'environ 0,2 % par période.

## 2. Règles retenues

| Règle                     | Effet                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| Accélération (`G > A`)    | Le facteur monte.                                                                               |
| Ralentissement (`G < A`)  | Le facteur baisse, même si le total de vues continue d'augmenter.                               |
| Stabilité (`G ≈ A`)       | Le facteur reste presque stable.                                                                |
| Pas maximal               | 2 % par mise à jour, jamais plus.                                                               |
| Bornes                    | Toujours entre 0,5 et 1,5.                                                                      |
| Démarrage neutre          | Le facteur reste à 1,000 tant que les 6 périodes de référence ne sont pas écoulées.             |
| Suspension                | Données absentes ou incohérentes : facteur figé, jamais traité comme une baisse de performance. |
| Vues                      | Seules les vues validées comptent.                                                              |
| Pas d'offre et de demande | Le facteur ne vient pas d'un prix de marché formé par des achats et des ventes.                 |

## 3. États affichés

`warmup` (démarrage neutre, avec progression x / 6), `active`, `suspended` (avec motif), puis
l'état de l'événement : à venir, en cours, terminé. Un événement suspendu ou dont le pool est
limité n'accepte pas de nouvelles positions (voir le document de liquidité).

## 4. Limites connues du modèle

1. **Le signal ne mesure pas l'échelle.** `S` est un rapport : 190 vues/h contre 150 donne le même signal que 19 000 contre 15 000. Un petit créateur est donc très bruité. Il faut un **volume minimal de vues** avant de compter le signal.
2. **Le facteur mesure un changement, pas un niveau.** Un créateur stable à 1 million de vues/h ne bouge jamais, un créateur qui passe de 10 à 12 vues/h monte.
3. **Prévisible.** La mise à jour est horaire et les vues sont visibles en continu : on peut deviner le sens du prochain pas. Prévoir une fenêtre de gel (voir le document de liquidité).
4. **Manipulable.** Des vues gonflées font monter le facteur. Détection de fraude et exclusion du créateur de son propre événement côté serveur.
5. **Lent.** Au maximum 2 % par heure : sur une journée, le facteur reste proche de 1. C'est voulu, mais à confirmer par simulation.

Les paramètres (2 %, 0,5 à 1,5, 6 périodes, 60 minutes) sont des **valeurs de test**, pas des valeurs optimales démontrées.

## 5. Côté frontend

- Types : `src/types/market.ts` ; données d'exemple recalculées avec la vraie formule : `src/lib/placeholder-markets.ts`.
- Affichage : facteur avec 3 décimales, courbe centrée sur le point neutre (une petite variation paraît petite), jauge `role="meter"`, panneau de rythme (`G`, `A`, `S`), états de démarrage et de suspension.
- Aucune formule dans l'interface.
