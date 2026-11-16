# Creator Studio

L'espace du créateur pour **proposer** ses propres événements Creator Market (cotes OUI / NON ou coins), suivre leur historique et leurs statistiques. Accès : `Profil → Mes outils → Creator Studio`. Aucune nouvelle entrée dans la navigation principale (l'onglet Profil reste actif sous `/studio`).

Frontend uniquement : aucune table, aucun appel serveur. Tout est temporaire (voir §6).

## 1. Écrans et routes

| Route                             | Écran                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/studio`                         | Rubriques **Aperçu**, **Événements** (historique), **Statistiques**, **Revenus**. L'onglet est dans l'adresse : `?onglet=evenements`, `statistiques`, `revenus`. |
| `/studio/evenements/nouveau`      | Formulaire de création (cote ou coins).                                                                                                                          |
| `/studio/evenements/:id`          | Détail : état, motif, résultats, paramètres, suivi daté, aperçu participants.                                                                                    |
| `/studio/evenements/:id/modifier` | Modification (brouillons et événements refusés seulement).                                                                                                       |

- **Aperçu** : chiffres clés, événements à traiter (brouillons, refusés, suspendus), derniers événements.
- **Événements** : historique complet, filtre par état avec compteurs (Tous, Brouillons, En revue, Programmés, En cours, Terminés, À corriger) et recherche tolérante aux accents.
- **Statistiques** : un **graphique** (MetricChart) des **vues, participants et revenus** par événement (une colonne par événement, du plus ancien au plus récent, 8 au plus ; boutons Vues / Participants / Revenus ; chaque colonne ouvre l'événement ; valeurs lisibles par les lecteurs d'écran), puis les totaux, vues validées par événement, coins vendus, répartition par type ; filtre Tous / Cotes / Coins. Les chiffres viennent du serveur par événement ; l'écran les additionne ou les compare pour l'affichage. Le ratio « Réactions / vues » est un repère indicatif.
- **Revenus** : voir §5.

## 2. Formulaire de création

1. **Type** : cote OUI / NON ou coins.
2. **Vidéo et légende** : vidéo (200 Mo max, aperçu local), image de couverture facultative, légende (150 caractères), mots-clés (5 max, nettoyés et dédoublonnés).
3. **Calendrier** : début (au moins 2 h après l'envoi, pour laisser le temps à la validation) et durée (6 h à 7 jours).
4. **Coins** (type coins) : nombre de coins et prix initial. Une phrase indicative donne le montant si tous les coins sont achetés.
5. **Engagements** (obligatoires à l'envoi) : droits sur la vidéo, pas de participation à son propre événement ni de gonflement des vues, compréhension du rôle d'AfriConnect.

Deux actions :

- **Enregistrer le brouillon** : accepte un formulaire incomplet, mais toute valeur saisie doit être correcte.
- **Envoyer pour validation** : exige tout. L'événement passe « En revue » ; **rien n'est publié**.

La validation est dans `lib/studio-schemas.ts` (Zod, deux niveaux : brouillon / envoi).

## 3. États

| État                           | Qui décide  | Actions du créateur                      |
| ------------------------------ | ----------- | ---------------------------------------- |
| Brouillon                      | Le créateur | Compléter et envoyer, supprimer          |
| En revue                       | AfriConnect | Retirer la demande (retour en brouillon) |
| Refusé (motif)                 | AfriConnect | Corriger et renvoyer                     |
| Programmé / En cours / Terminé | AfriConnect | Aucune (consultation)                    |
| Suspendu (motif)               | AfriConnect | Aucune ; données conservées              |

Seuls les passages brouillon ↔ en revue et la suppression d'un brouillon sont des actions du créateur. Le frontend ne valide, ne programme ni ne lance jamais un événement.

## 4. Règles respectées

- Le frontend ne calcule ni facteur, ni indice, ni pool, ni montant versé. Le seul montant affiché dans le formulaire est « nombre de coins × prix », présenté comme un ordre de grandeur.
- Le plafond d'achat par personne et les frais ne sont pas réglables par le créateur (décisions ouvertes, voir [creator-market-coins.md](creator-market-coins.md)).
- Le créateur n'achète pas sur son propre événement : c'est un engagement affiché, que le serveur devra faire respecter.
- Aucune navigation principale ajoutée, aucun module Creator Market existant modifié.

## 5. Revenus : commission 2 %

Le créateur reçoit **2 % de commission** sur le volume de chaque événement (mises / ventes collectées). Formule frontend : `floor(collected × 0,02)` (`CREATOR_EVENT_COMMISSION_RATE` dans `lib/studio.ts`). Affiché dans l’onglet Revenus, les statistiques et le détail d’événement. Le versement Wallet reste côté serveur.

## 6. Données temporaires et éléments non connectés

- Exemples : `lib/placeholder-studio.ts` (8 événements couvrant chaque état). Créations et modifications : `localStorage`, clé `africonnect.studio.v1` (`lib/studio-store.ts`, `hooks/use-studio.ts`), à remplacer par l'API.
- Limites provisoires du formulaire (`STUDIO_LIMITS` dans `lib/studio.ts`) : coins 100 à 100 000, prix 100 à 10 000 FCFA, vidéo 200 Mo, délai 2 h. Valeurs de test, à fixer par le serveur.
- Non branchés : envoi réel de la vidéo (le fichier n'est ni envoyé ni conservé), décision de modération, notifications de décision, statistiques en direct, versement des revenus.
- Non construit : **collaborations** (le descriptif d'origine du Studio les mentionnait, aucune règle n'existe).

## 7. Points à trancher

1. Reliquat du pool après clôture (hors commission 2 % déjà fixée).
2. Limites réelles : nombre de coins, prix initial, durée, taille de la vidéo.
3. Délai minimal avant le début et délai de modération annoncé.
4. Un événement programmé peut-il être modifié ou annulé par le créateur ? Ici : non, via le support.
5. Collaborations : à quoi servent-elles et avec qui (Services Pro, autres créateurs) ?
