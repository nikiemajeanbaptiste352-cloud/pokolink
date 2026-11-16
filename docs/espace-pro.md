# Espace Pro d'un service : tableau de bord, courbes, événements, public et scanner

> Document reconstruit après une suppression accidentelle du fichier : le début est réécrit d'après le code, les sections « Page publique » et « Scanner » sont à jour. À relire.

## Structure du tableau de bord (`/services/:serviceId`)

1. **Hero** : couverture, logo, nom, activité et ville.
2. **Rubriques** (`ServiceHub`) : une rangée horizontale, chaque icône ouvre sa page : Catalogue, Commandes, Scanner, Abonnements, Événements, Canal, Avis, Clients, Historique, Rapports, Notifications, Configuration (liste dans `src/lib/service-tools.ts`, aussi dans la barre `ServiceTabs`).
3. **Activité** : courbe d'activité (visiteurs, revenus) avec lien vers le profil public.
4. **Commandes récentes**.

## Graphiques

Deux composants maison, sans bibliothèque : `TrendChart` (courbe) et `ColumnChart` (colonnes), dans `src/components/charts`. Accessibles (résumé textuel), adaptés aux petites largeurs.

## Rubriques à graphiques

Rapports (ventes, performances), Canal (statistiques des publications) et Événements (participations) utilisent ces graphiques.

## Événements en cartes (style réseau social)

Les événements d'un service s'affichent en cartes visuelles (statut en direct / à venir / terminé, participants, dates, lieu, accès à la page de l'événement).

## Données temporaires

`src/lib/placeholder-activity.ts` fabrique des visiteurs, commandes et revenus
**d'exemple** (déterministes par établissement et par jour). Chaque écran concerné l'indique.
À remplacer par une requête TanStack Query qui renvoie, pour UN établissement, les valeurs
journalières agrégées par le serveur (`date`, `visitors`, `orders`, `revenue`).

## Liste des Services Pro (/espace-pro)

La page d'entrée ne contient plus que la liste des cartes de vos Services Pro (une colonne sur
mobile, deux dès md) : couverture, état (Actif / À configurer), logo, chiffres, boutons
« Tableau de bord », « Profil public » et « Scanner tickets et cartes ». Un brouillon propose
« Continuer la configuration ». Les rubriques de gestion restent dans le tableau de bord de
chaque service.

## Page publique d'un Service Pro (/etablissement/:ref)

Façon **page Facebook**, sans fonction de gestion (le propriétaire voit seulement « Gérer mon Espace Pro ») :

- **En-tête** (ProHero) : grande couverture, logo rond qui la chevauche, nom + pastille vérifiée, « N abonnés · activité · note », accroche, localisation, état ouvert/fermé, boutons S'abonner / Contact / Partager.
- **Rubriques** (ProTabs, défilantes, collées en haut) : Accueil, Catalogue, Événements, Publications, Avis, Abonnements, À propos (`?onglet=profil`), Contact. Les liens `?onglet=`, `?produit=` et `?ajouter=` fonctionnent toujours.
- **Accueil** : carte Intro (description, fiche), photos du catalogue en grille de 3 colonnes, événements, forfaits, **fil de publications** (carte avec auteur, texte, visuel, compteurs, « J'aime » local et « Partager »), avis, contact.
- **Publications** : le fil complet. **Abonnements** : chaque forfait a son bouton « Souscrire » (parcours d'achat jusqu'à la carte, voir `docs/tickets-explorer.md`).
- **À propos** : présentation, fiche entreprise, chiffres clés, catégories. **Contact** : discussion, liens http(s), adresse avec itinéraire, horaires.

L'application est limitée à 720 px de large : la page reste sur une seule colonne (comme Facebook mobile), le fil n'a pas de seconde colonne. « J'aime » n'est pas enregistré (le compteur réel viendra du serveur).

Uniquement des données renseignées par l'établissement : les valeurs vides sont omises. Chiffres clés, avis, publications, forfaits, événements et ancienneté des établissements d'exemple (lib/directory.ts) restent des exemples, signalés par le bandeau de démonstration. Helpers : src/lib/pro-profile.ts.

## Scanner (/services/:serviceId/scanner)

Voir `docs/tickets-explorer.md`, section 8 : scan à la caméra ou saisie, verdict VALIDE / NON VALIDE pour les tickets et les cartes d'abonnement.
