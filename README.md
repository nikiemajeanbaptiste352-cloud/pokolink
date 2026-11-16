# AfriConnect – Frontend

Interface de la Super App AfriConnect (frontend uniquement, MVP).

**Stack :** React · TypeScript (strict) · Vite · Tailwind CSS v4 · shadcn/ui · Lucide · React Router · React Hook Form · Zod · TanStack Query · ESLint · Prettier.

## Scripts

| Commande         | Rôle                           |
| ---------------- | ------------------------------ |
| `npm run dev`    | Serveur de développement       |
| `npm run build`  | Vérification des types + build |
| `npm run lint`   | ESLint                         |
| `npm run format` | Formatage Prettier             |

## Structure (`src/`)

- `app/` : point d'entrée de l'application et providers
- `routes/` : routeur et chemins
- `layouts/` : structures de page (shell, navigation)
- `pages/` : écrans
- `components/ui/` : composants shadcn/ui
- `components/` : composants communs AfriConnect
- `hooks/`, `services/`, `types/`, `lib/` : utilitaires, couche API future, typage
- `styles/globals.css` : **design tokens** (couleurs, rayons, ombres, typographie, thèmes clair et sombre)

## Services (établissements professionnels)

Un **service** est un espace professionnel indépendant (boutique, restaurant, transport…). Un utilisateur peut en créer plusieurs ; chacun a son propre catalogue et ses propres données (tout est rattaché à son `serviceId`).

Parcours : `Profil → Espace Pro` (`/espace-pro` : uniquement la liste des cartes de vos Services Pro) → `Créer un service` (`/services/nouveau`) → configuration en 8 étapes (type, identité, localisation, contacts, configuration métier, paiements, personnalisation, vérification ; progression enregistrée) → espace professionnel (`/services/:id`, 9 outils, aux couleurs du service) → page publique façon fiche entreprise (`/etablissement/:nom-d-utilisateur`, rubriques Accueil, Catalogue, Profil, Événements, Publications, Avis, Abonnements, Contact).

- Types et schémas : `types/service.ts`, `lib/service-types.ts`, `lib/service-schemas.ts`.
- **Stockage temporaire** : les services créés sont gardés dans le `localStorage` (`lib/services-storage.ts`, `app/services-provider.tsx`). À remplacer par l'API ; les composants passent par `hooks/use-services.ts`.
- Commandes, clients, historique, rapports, notifications, paiement et encaissement : écrans en place, contenu à brancher avec les modules concernés.
- **Tickets de paiement** : la rubrique « Caisse » a été retirée (l'ancienne adresse `/services/:id/caisse` renvoie au tableau de bord). La rubrique **Historique** (`/services/:id/historique`) sert désormais à **vérifier un ticket** (numéro, code ou lien du QR code) et à le valider une seule fois. Côté client : `Profil → Tickets` (`/tickets`, `/tickets/:id`). Détails : [`docs/tickets-explorer.md`](docs/tickets-explorer.md).
- Catalogue façon marketplace (`/services/:id/catalogue`) : recherche tolérante aux accents, catégories, tri, grille ou liste de cartes produit. Chaque carte ouvre la **fiche produit** (`/catalogue/:itemId`) : image, prix, disponibilité, description, options, produits de la même catégorie. L'édition est sur `/catalogue/:itemId/modifier`.
- Rubriques privées **Canal**, **Avis**, **Abonnements** et **Événements** (`/services/:id/canal`, `/avis`, `/abonnements`, `/evenements`) : formulaires et boutons fonctionnent dans l'interface (validation locale, confirmations), sur des **données d'exemple** (`lib/pro-extras-seed.ts`) et un **stockage temporaire** dans le `localStorage` (`lib/pro-extras-store.ts`, seul point à remplacer par l'API). Aucune table, aucun appel serveur.

## Market Event (Explorer)

- `/explorer` : écran de découverte (recherche, ville, filtres Tout / Produits / Services Pro / Événements, catégories, rails horizontaux). Voir [`docs/tickets-explorer.md`](docs/tickets-explorer.md). Les événements ont leur rail dans Explorer ; le fil plein écran reste sur `/explorer/evenements`.
- `/explorer/evenements` : fil plein écran des événements (ventes flash, lives, lancements, promotions, jeux), avec catégories.
- « Participer » ouvre une feuille dans le fil (détail de l'offre, puis paiement) : pas d'écran supplémentaire. Lien partageable : `/explorer/evenements?evenement=<id>`.
- Deux formats ont leur propre écran de participation (`/explorer/evenements/:id`) : la **loterie marketing** et la **réduction collective** (informations, progression en temps réel, étapes, règles, barre « Participer »). Voir la section 6 de [docs/market-event-africa.md](docs/market-event-africa.md), qui liste aussi les règles encore à définir et la note juridique.
- Données temporaires dans `src/lib/placeholder-events.ts`. Aucune logique de prix, de stock ni de paiement côté frontend.
- Analyse du rapport d'origine et règles corrigées : [`docs/market-event-africa.md`](docs/market-event-africa.md).

## Accueil

- Cartes visuelles des **Top Services Pro** et des **événements** en cours ou à venir, en rangées horizontales au-dessus des stories (`components/home/TopShowcase.tsx`, mêmes cartes qu'Explorer) ; chaque carte ouvre la page publique du Service Pro ou de l'événement. Creator Market reste dans la navigation ; Market Event, Marché numérique et AfriLearn restent accessibles depuis Explorer et Profil.

## Navigation globale

- Les modules sont reliés sans changer la navigation principale : cartes Explorer → fiche produit (`/produits/:id`) ou profil public (`/etablissement/:ref`), organisateurs Market Event → profil et messagerie, profil public ↔ Espace Pro (`/services/:id`), conversations (`/messages/:id`) avec contexte et anti-doublon.
- Routes, boutons et destinations, tests et éléments non connectés : [`docs/navigation-globale.md`](docs/navigation-globale.md).

## Wallet (Profil → Wallet)

- Écrans utilisateur uniquement : soldes (disponible / réservé / total), historique, dépôt (montant → instructions avec compte à rebours de 5 min → déclaration), retrait (formulaire + PIN) et pages de suivi pour chaque statut (`/wallet`, `/wallet/depot[/:id]`, `/wallet/retrait[/:id]`).
- Le frontend ne crédite, ne débite et ne réserve rien : toutes les données sont temporaires et le serveur décidera de tout (soldes, frais, limites, rapprochement, statuts).
- **Envoyer / Demander** entre utilisateurs (`/wallet/transfert`) : formulaires P2P ; seule une demande « en attente de confirmation » est créée.
- Statuts, règles respectées, questions ouvertes et éléments non connectés : [`docs/wallet.md`](docs/wallet.md).

## Abonnements, cartes et scanner

- Page publique d'un Service Pro façon page Facebook (couverture, logo rond, rubriques Accueil, Catalogue, Événements, Publications, Avis, Abonnements, À propos, Contact).
- Parcours d'abonnement : forfait → paiement Wallet → carte d'abonnement avec QR code, téléchargeable en image (`/etablissement/:ref/abonnement/:planId`). La carte reste « en attente de paiement » tant que le serveur ne l'a pas activée. Mes cartes : `/tickets?vue=abonnements`.
- Espace Pro → **Scanner** (`/services/:id/scanner`) : scan caméra ou saisie, verdict VALIDE / NON VALIDE pour les tickets et les cartes. Détails : [`docs/tickets-explorer.md`](docs/tickets-explorer.md), [`docs/espace-pro.md`](docs/espace-pro.md).

## Panier, achats et Wallet comme seul moyen de paiement

Profil → Panier et achats : un panier par vendeur, une caisse (nom, prénom, identifiant) puis
paiement avec le Wallet, suivi des commandes. Le serveur décide de tout. Voir
`docs/panier-achats.md`.

## Publicité (Espace Pro)

Créer et suivre des campagnes (forfaits Bronze / Argent / Or, trois types d'annonce, paiement
Wallet). Voir `docs/publicite.md`.

## Rewards (Profil → Rewards)

Écran `/rewards` (phase 1, données d'exemple) : solde de points, actions rapides à venir et
activité récente. Les points sont distincts du Wallet FCFA, le serveur décide de chaque
opération. Voir `docs/rewards.md`.

## Creator Market (Cotes)

- `/cotes` : fil plein écran des événements liés à un créateur ; `/cotes/liste` : liste, « Comment ça marche » et « Mes positions » ; `/cotes/:id` : détail (facteur, rythme des vues, état du pool, ma position).
- Fil /cotes (Cotes et Coins) : défilement vertical façon TikTok, un événement par écran (accroche magnétique, repères de position sur mobile, flèches précédent / suivant et touches ↑ ↓ sur ordinateur). Le bouton « Détails » masque d'un appui les informations superposées (en-tête, textes, cote, boutons OUI/NON, repères) ; restent la vidéo, le statut (« En cours »), le nombre de vues et les compteurs j'aime / partages ; un second appui sur le même bouton réaffiche tout. Le défilement vertical continue de fonctionner en mode vidéo seule.
- Feuilles de prise de position (OUI / NON) et de retrait : montants fournis par le serveur, la mise est payée depuis le Wallet (demande envoyée, le serveur débite et confirme ; voir [docs/wallet.md](docs/wallet.md)).
- Données temporaires dans `src/lib/placeholder-markets.ts`. Aucun calcul du facteur, de la valeur ou du paiement côté frontend.
- Règles du facteur : [`docs/creator-market-facteur.md`](docs/creator-market-facteur.md). Valorisation, distribution et insuffisance du pool : [`docs/creator-market-liquidite.md`](docs/creator-market-liquidite.md).

### 2e type d'événement : les coins

- Le fil plein écran `/cotes` a un sélecteur « Cotes | Coins » dans son en-tête : chaque type a son propre fil (le bouton « Acheter des coins » ouvre une feuille d'achat).
- `/cotes/liste` propose les deux types via les puces « Cotes (OUI / NON) » et « Coins » ; `/cotes/coins/:id` : détail d'un événement coins (valeur du coin, indice 50–150, parcours Achats → En cours → Clôture → Règlement, pool, mes coins, achat, règles).
- Les 6 états du rapport v4.0 sont affichés (achats ouverts / fermés, en cours, clôture en cours, clôturé, suspendu). L'achat de coins est payé depuis le Wallet (demande « en attente de confirmation » ; voir [docs/wallet.md](docs/wallet.md)) ; le retrait reste inactif.
- Données temporaires dans `src/lib/placeholder-coin-markets.ts` (séries d'indice préparées hors application). Aucun calcul de l'indice, de la valeur d'un coin ni du pool côté frontend.
- Analyse du rapport, points à trancher et risques : [`docs/creator-market-coins.md`](docs/creator-market-coins.md).

### Creator Studio (Profil → Creator Studio)

- `/studio` : aperçu, historique des événements, statistiques et revenus ; `/studio/evenements/nouveau` : formulaire de création (cote ou coins) ; `/studio/evenements/:id` : détail et suivi.
- Le créateur **propose** un événement (brouillon, puis « Envoyer pour validation ») : AfriConnect valide et calcule tout. Aucun montant ni facteur n'est calculé côté frontend ; l'onglet Revenus reste volontairement vide tant que la rémunération n'est pas définie.
- Données temporaires dans `src/lib/placeholder-studio.ts`, stockage `localStorage` dans `src/lib/studio-store.ts`. Détails, limites provisoires et points à trancher : [`docs/creator-studio.md`](docs/creator-studio.md).

- **Espace Pro d'un service** : le tableau de bord affiche le hero, puis toutes les rubriques sur une rangée horizontale (chaque icône ouvre sa page), puis une courbe d'activité (visiteurs, revenus). Rapports, Canal et Événements utilisent des graphiques ; les événements sont des cartes façon réseau social. Chiffres d'activité temporaires (src/lib/placeholder-activity.ts). Détails : [docs/espace-pro.md](docs/espace-pro.md).

## Design system

Tous les tokens visuels sont centralisés dans `src/styles/globals.css`. L'aperçu est disponible sur `/design-system` en développement.

## Pages publiques et navigation

Pages publiques du cr�ateur (`/createur/:handle`) et du membre AfriLearn
(`/afrilearn/membre/:handle`), liens public ? priv� et boutons de l'accueil, des messages et du
profil : voir [docs/pages-publiques.md](docs/pages-publiques.md).
