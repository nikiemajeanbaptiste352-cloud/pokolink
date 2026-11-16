# Tickets de paiement, Explorer, cartes d'abonnement et scanner

> Document reconstruit après une suppression accidentelle du fichier : les sections 1 à 6 sont réécrites d'après le code, les sections 7 et 8 sont les nouveautés de cette étape. À relire.

## 1. Ce qui a changé

- Le **ticket numérique de paiement** (QR code) est la preuve d'un paiement confirmé ; il se retrouve dans Profil → Tickets.
- La rubrique « Caisse » de l'Espace Pro est retirée (`/services/:id/caisse` renvoie au tableau de bord) ; la rubrique **Historique** sert à vérifier et valider un ticket.
- **Explorer** est un espace de découverte unique (produits, Services Pro, événements).
- L'accueil met en avant les meilleurs Services Pro et événements.
- Nouveau : **cartes d'abonnement** avec QR code (section 7) et **Scanner** de l'Espace Pro (section 8).

## 2. Ticket de paiement

Statuts : `paid` (payé, pas encore utilisé), `pending_validation` (payé, le prestataire doit valider), `validated` (prestation remise), `cancelled` (annulé).

Règle : un ticket n'est créé par le **serveur qu'après la confirmation du paiement**. Une demande de paiement ne produit jamais de ticket : le frontend n'en fabrique pas.

Côté client : `/tickets` (liste filtrable par statut), `/tickets/:ticketId` (ticket avec QR code, état, bouton « Télécharger le reçu » qui ouvre l'impression, donc l'enregistrement en PDF).

### QR code et vérification

Le QR code encode un lien vers le **Scanner** du prestataire (`/services/:serviceId/scanner?code=<code>`, section 8). Les anciens liens `/services/:serviceId/historique?ticket=<code>` fonctionnent toujours : l'Historique d'un service garde sa vérification d'un ticket (numéro, code ou lien). Le prestataire contrôle le paiement, le client et la prestation, puis clique « Valider la prestation » : une seule fois (un ticket déjà validé ou annulé est refusé). Les validations sont gardées dans `src/lib/tickets-store.ts` (stockage d'essai) ; en réel, le serveur applique l'unicité.

## 3. Explorer (`/explorer`)

Recherche, ville, filtres Tout / Produits / Services Pro / Événements, catégories, bannières, rails horizontaux. Un produit ouvre sa fiche (la pastille du vendeur ouvre le profil public), un Service Pro ouvre sa page publique, un événement ouvre sa page. Fichiers : `src/pages/ExplorePage.tsx`, `src/lib/explore.ts`, `src/components/explore/*`.

## 4. Accueil

Un bandeau de cartes visuelles présente les meilleurs Services Pro et événements (`TopShowcase`) à la place des anciennes rubriques textuelles.

## 5. Données temporaires et éléments non connectés

Tickets d'exemple (`src/lib/placeholder-tickets.ts`, établissement de test `svc-poko`), cartes d'exemple (`placeholder-subscriptions.ts`), contenu d'Explorer (`placeholder-explore.ts`, `lib/directory.ts`). Chaque écran concerné porte un bandeau de démonstration. Non connectés : création des tickets et des cartes, confirmation des paiements, validation unique côté serveur.

## 6. Questions ouvertes

Durée de validité d'un ticket non utilisé ; remboursement d'un ticket validé ou annulé ; ticket pour un paiement partiel ; règles d'affichage du nom du client sur un ticket scanné.

## 7. Cartes d'abonnement (parcours d'achat, QR code, téléchargement)

**Parcours** : page publique d'un Service Pro → rubrique Abonnements → « Souscrire » → `/etablissement/:ref/abonnement/:planId` :

1. **Forfait** : récapitulatif (prix, durée, avantages, titulaire) et acceptation des conditions si le forfait en a.
2. **Paiement** : `WalletPaymentForm` (`purpose` `subscription`, PIN, solde). Une **demande « en attente de confirmation »** est envoyée.
3. **Ma carte** : la carte d'abonnement s'affiche avec son **QR code** et son code de vérification ; boutons « Télécharger la carte » (image PNG dessinée sur canvas, `src/lib/subscription-card-image.ts`) et « Imprimer / enregistrer en PDF ».

La carte se retrouve dans **Profil → Tickets → Abonnements** (`/tickets?vue=abonnements`, détail `/tickets/abonnements/:id`).

**Règle** : le frontend ne peut pas activer une carte. Une carte issue d'un achat est toujours « Paiement en attente » : QR code estompé, mention « valable seulement après confirmation du paiement par le serveur », dates non fixées. C'est le serveur qui confirme le paiement, active la carte, fixe début et fin et la fait expirer (le statut « Expirée » s'affiche aussi quand la fin est passée). Forfaits sur devis (sans prix) et forfaits de son propre établissement : pas de souscription.

Le QR code contient l'adresse `/services/:serviceId/scanner?code=<code>` : l'appareil photo d'un téléphone ouvre donc le scanner du prestataire.

Fichiers : `types/subscription.ts`, `lib/subscription-labels.ts`, `lib/subscription-cards-store.ts` (stockage d'essai `localStorage`), `lib/placeholder-subscriptions.ts` (cartes d'exemple : active, expirée, annulée, en attente), `hooks/use-subscription-cards.ts`, `components/subscriptions/*`, `pages/SubscribePage.tsx`, `pages/tickets/SubscriptionCardPage.tsx`.

## 8. Scanner de l'Espace Pro

`/services/:serviceId/scanner`, rubrique « Scanner » du service (barre des outils, grille de rubriques) et bouton « Scanner tickets et cartes » sur chaque carte de `/espace-pro`.

- **Scan à la caméra** (`components/scanner/QrScanner.tsx`) : démarre seulement sur le bouton « Scanner avec la caméra », s'arrête à la lecture, à « Arrêter la caméra » ou en quittant l'écran. Utilise `BarcodeDetector` (Chrome, Edge, Android) ; sans lui, un message explique les alternatives.
- **Saisie** du numéro ou du code, ou adresse complète lue dans un QR code (`?code=`, `?ticket=`).
- **Résultat** (`components/scanner/ScanResult.tsx`) : grand bandeau **VALIDE** (vert) ou **NON VALIDE** (rouge), la raison, puis le détail.
  - Ticket : valide si payé ou en attente de validation ; non valide si déjà utilisé ou annulé. Un ticket valide propose « Valider la prestation » (usage unique).
  - Carte : valide si active et non expirée ; non valide si paiement en attente, expirée, annulée.
  - Code inconnu, ou document d'un autre établissement (jamais détaillé) : non valide.
- « Pour essayer » liste les cartes et tickets d'exemple de l'établissement de test (`svc-poko`).

Le verdict est calculé à partir des données connues du frontend (exemples + validations locales) : **en réel, le serveur vérifie et répond**, y compris l'usage unique. Aucun montant ni solde n'est modifié.
