# Navigation globale et interconnexion des modules

Cahier des charges v1.0. Cette tranche relie Explorer, Market Event, les produits, les profils publics, la messagerie et l'Espace Pro. Rien n'a été reconstruit : la navigation principale (Accueil, Creator Market, Explorer, Messages, Profil) est inchangée.

Frontend uniquement. Les données de démonstration sont temporaires et signalées dans l'interface.

## 1. Audit (résumé)

| Constat | Décision |
| --- | --- |
| Cartes Explorer (produit, boutique, service, restaurant) sans destination | Reliées (section 3) |
| Aucun profil public riche : `/etablissement/:ref` n'était qu'un catalogue + caisse | Page refaite sur le modèle TechPro Services, panier et caisse conservés |
| Aucune route de conversation ni de contexte | Messagerie centrale avec contexte et anti-doublon |
| `BackLink` toujours hiérarchique | Option `history` : retour à l'écran précédent |
| Le cahier des charges propose `/services/:id` pour le profil public | Conflit avec l'Espace Pro existant (`/services/:serviceId/*`). Les routes françaises existantes sont gardées, sans renommage |
| Un « service » est un établissement (= Espace Pro) | `Service.id` joue le rôle de `professional_space_id`. Il n'existe pas d'entité « offre de service » distincte |

## 2. Routes

| Route | Écran | Public / privé |
| --- | --- | --- |
| `/etablissement/:ref` | Profil public d'un Espace Pro (`:ref` = nom d'utilisateur ou identifiant) | Public |
| `/etablissement/:ref?onglet=catalogue\|evenements\|publications\|avis\|abonnements` | Rubrique ouverte | Public |
| `/etablissement/:ref?ajouter=:itemId` | Ajoute l'article à la sélection (bouton « Commander ») | Public |
| `/produits/:productId` | Fiche produit publique | Public |
| `/messages` | Liste des conversations (recherche active) | Privé à l'utilisateur |
| `/messages/:conversationId` | Conversation | Privé à l'utilisateur |
| `/services/:serviceId/*` | Espace Pro (gestion) | Privé, propriétaire |
| `/explorer/evenements`, `/explorer/evenements/:id` | Market Event | Public |

Le profil public et l'Espace Pro sont séparés : le profil public ne contient aucune fonction de gestion. Le propriétaire y voit seulement « Gérer mon Espace Pro » (vers `/services/:id`) ; il ne voit ni « Discuter » ni « S'abonner » sur son propre profil.

## 3. Boutons et destinations

| Origine | Bouton / carte | Destination |
| --- | --- | --- |
| Explorer | Carte produit | `/produits/:id` |
| Explorer | Boutique « Visiter » | `/etablissement/:proRef` |
| Explorer | Carte service, carte restaurant | `/etablissement/:proRef` |
| Fiche produit | Nom/photo du vendeur, « Voir la boutique » | Profil public du vendeur (`professional_space_id`) |
| Fiche produit | « Message » | Conversation, contexte `product` |
| Fiche produit | « Commander » | Profil du vendeur, catalogue, article ajouté |
| Fiche produit (propriétaire) | « Gérer ce produit » | Fiche produit de l'Espace Pro |
| Fiche produit | Produits du même vendeur | Autres fiches produit |
| Profil public | « Discuter maintenant » | Conversation, contexte `professional_profile` |
| Profil public | « Catalogue », cartes produit | Rubrique catalogue, fiche produit |
| Profil public | Événement du hub, rubrique Événements | Écran de participation ou fil Market Event ouvert sur l'événement (`getEventPath`) |
| Profil public | Publication liée à un produit | Fiche produit |
| Profil public | « Passer à la caisse » | Récapitulatif et paiement (désactivé, module Wallet) |
| Market Event (fiche, page de participation) | Organisateur : « Voir le profil », « Message » | Profil de l'organisateur ; conversation, contexte `market_event` |
| Messages | Ligne de conversation | `/messages/:id` |
| Conversation | Bandeau de contexte, icône profil | Objet d'origine, profil du destinataire |
| Espace Pro, fiche article | « Voir côté client » | `/produits/:id` |

## 4. Messagerie centrale

- Un seul magasin (`africonnect.conversations.v1`). Clé anti-doublon : destinataire + `context.type` + `context.id`. Un second clic sur « Message » rouvre la conversation existante (vérifié).
- Contextes pris en charge : `product`, `professional_profile`, `market_event` ; `service`, `creator_content` et `user` sont prévus dans le type, sans bouton pour l'instant.
- Le destinataire d'un Espace Pro est `space:<professional_space_id>`.
- Démonstration : les messages restent sur l'appareil, aucune réponse n'est simulée.

## 5. Retour

`BackLink history` revient à l'écran précédent quand l'historique existe, sinon à la destination par défaut. Utilisé sur le profil public, la fiche produit et la conversation. Le changement de rubrique du profil utilise `replace` : il ne remplit pas l'historique.

## 6. Composants réutilisés et adaptés

Réutilisés : `PageHeader`, `BottomSheet`, `EmptyState`, `Media`, `Avatar`, `Rating`, `VerifiedBadge`, `ServiceCover`, `CatalogPicker`, `CartSummary`, `useCart`, `DemoNote`, `useNow`, magasins de l'Espace Pro (`pro-extras-store`).

Adaptés : `BackLink` (prop `history`), `ConversationItem` (lien + contexte), `MessagesPage` (recherche), `EventSheet` et `ParticipationTerms` (actions organisateur), cartes Explorer (liens).

Nouveaux (aucune nouvelle version d'un module existant) : `pro-public/*` (profil public), `ProductPage`, `ConversationPage`, `HostActions`, `lib/directory.ts` (répertoire de démonstration), `lib/pro-public.ts` (sélecteurs publics), `lib/conversations-store.ts`, `lib/follows-store.ts`, `lib/messaging-contexts.ts`, `lib/event-links.ts`.

## 7. Données temporaires

- `lib/directory.ts` : 24 professionnels de démonstration (TechPro Services, boutiques, services, restaurants, organisateurs d'événements) construits avec les vrais types de l'Espace Pro. Les `proRef` des cartes Explorer et des organisateurs d'événements pointent vers eux.
- Un professionnel de démonstration n'est jamais « le vôtre ». Seul un service du magasin local de l'utilisateur est reconnu comme tel.
- Avis, publications, forfaits et événements du profil sont des exemples tant que leurs modules ne sont pas branchés (bandeau affiché).
- Visibilité publique : publications actives d'un canal public, événements publiés, forfaits actifs. Les brouillons et les données de gestion ne sont jamais montrés aux visiteurs.

## 8. Tests de navigation (contrôlés dans le navigateur, mobile 390 px)

| Test | Résultat |
| --- | --- |
| Explorer → fiche produit → profil du vendeur | OK |
| Fiche produit → Message → conversation, puis second « Message » : une seule conversation | OK |
| Fiche produit → Commander → profil, rubrique catalogue, article dans la sélection | OK |
| Profil propriétaire → « Gérer mon Espace Pro » → retour sur le profil public | OK |
| Profil propriétaire : ni « Discuter » ni « S'abonner » | OK |
| Produit ou établissement inexistant : état « introuvable » | OK |
| Rubrique dans l'adresse (`?onglet=`) | OK |
| Aucun débordement horizontal, cibles tactiles ≥ 44 px (profil) | OK |
| Mode sombre : profil lisible | OK (contrôle visuel) |

Non automatisés : pas de suite de tests dans le projet pour l'instant ; ces contrôles ont été faits à la main.

## 9. Pas encore connecté

- Accueil : publications et auteurs ne mènent nulle part.
- Creator Market : profils de créateurs, passage Accueil → Creator Market → vidéo, Explorer → profil créateur. Il n'existe pas de page profil créateur.
- Notifications : pas de module, donc pas de lien profond.
- Explorer : tuiles de catégories, « Services du quotidien », « Voir tout » et la recherche globale restent sans destination ; pastilles « En ligne » de Messages.
- Boutons « Envoyer une demande », devis et réservation.
- Souscription à un forfait (Wallet), paiement des commandes.
- Les articles ne sont pas reliés à un identifiant de produit global : seuls les cinq produits d'Explorer ont une fiche de démonstration.

## 10. Questions ouvertes

- Faut-il une entité « offre de service » distincte de l'établissement ? Aujourd'hui, service = établissement.
- Les routes publiques doivent-elles passer à `/pro/:id` et `/pro/manage/:id` ? Le renommage casserait des liens existants : à décider avec l'équipe backend.
- Le nom de la conversation doit-il suivre le contexte (une conversation par produit) ou le destinataire seul ? Le cahier des charges demande l'anti-doublon par contexte : c'est ce qui est appliqué.

## 11. Fil immersif d'Accueil et d'Explorer

Accueil et Explorer affichent le même fil, façon Facebook, qui mélange tous les types de contenu. Chaque carte mène à SON espace de diffusion.

| Carte | Badge | Toucher le visuel, la barre ou « Participer / Voir… » mène à |
| --- | --- | --- |
| Événement Market Event | Market Event | Écran de participation (loterie, réduction collective) ou fil Market Event ouvert sur l'événement (`/explorer/evenements?evenement=id`) |
| Événement Creator Market (cotes) | Creator Market · Cotes | Fil Cotes ouvert sur l'événement (`/cotes?evenement=id`) |
| Événement Creator Market (coins) | Creator Market · Coins | Fil Coins ouvert sur l'événement (`/cotes?type=coins&evenement=id`) |
| Publication d'un Espace Pro | Service Pro | Canal public de l'établissement (`/etablissement/:ref?onglet=publications`) |
| Produit | Produit | Fiche produit (`/produits/:id`) |
| Établissement suggéré (Explorer et Accueil) | Suggestion · Boutique / Service / Restaurant | Profil public |
| Publication d'un membre (Accueil) | — | Pas d'espace propre : aucun profil d'utilisateur n'existe encore |

- Le nom de l'auteur ouvre son profil quand il en a un (Espace Pro, organisateur avec Espace Pro). Créateurs Creator Market : pas de profil pour l'instant.
- Filtres en haut du fil : Pour vous, Market Event, Creator Market, Services Pro, Produits.
- « J'aime » et « Enregistrer » restent locaux ; « Partager » partage le lien de la destination.
- Accueil : stories et zone « Quoi de neuf ? » restent en haut. Explorer : recherche, entrées Market Event et AfriLearn, bannières et catégories restent en haut ; les rangées horizontales (produits, services, boutiques, restaurants) sont remplacées par le fil. Les composants de ces rangées (`ProductCard`, `ShopCard`, etc.) restent dans le projet, reliés, mais ne sont plus utilisés par Explorer.
- Les vidéos sont des visuels provisoires (aucune vidéo fournie) avec un bouton de lecture ; elles ouvrent l'espace de diffusion.
- Fichiers : `lib/feed.ts` (composition et destinations), `components/feed/*`. Les événements terminés sont retirés du fil.
- Toujours sans destination : tuiles de catégories d'Explorer, boutons des stories, « Voir tout », zone « Quoi de neuf ? ».