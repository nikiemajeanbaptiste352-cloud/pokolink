# Pages publiques et carte de navigation

Cette page décrit les pages publiques ajoutées (Creator Studio, AfriLearn) et comment les
espaces publics et privés se relient. Frontend uniquement : le serveur reste seul juge des
paiements, des soldes, des validations et de la diffusion des contenus.

## Pages publiques

| Page | Route | Fichier |
| --- | --- | --- |
| Créateur (Creator Market et Creator Studio) | `/createur/:handle` | `src/pages/CreatorPage.tsx` |
| Membre AfriLearn | `/afrilearn/membre/:handle` | `src/pages/LearnMemberPage.tsx` |

- **Créateur** : identité, abonnés, boutons Suivre / Message / Partager, onglets Événements
  (cotes, coins ; pour soi, les événements du Studio programmés, en cours ou terminés) et À propos.
  Sur sa propre page : « Creator Studio » et « Créer un événement ».
- **Membre AfriLearn** : publications, documents, questions et réponses. Les contenus signalés
  ne sont visibles que par leur auteur.
- Suivre est local (`africonnect.following.v1`) et ne modifie aucun compteur du serveur.
- Données (bios, villes, abonnés) : `src/lib/creators.ts`, temporaires.

## Liens public ↔ privé

- Creator Market : le @identifiant et l'avatar d'un créateur ouvrent sa page (fils vidéo, pages
  événement cotes/coins, cartes du fil d'accueil).
- AfriLearn : chaque auteur (publication, document, commentaire) ouvre sa page de membre.
- Privé → public : Studio « Ma page », Profil « Voir ma page publique », Mes contributions
  « Ma page publique », Mon QR code (lien de la page publique).
- Public → privé : sur sa propre page, « Creator Studio » / « Mes contributions ».

## Nouveaux écrans

`/notifications`, `/recherche`, `/parametres`, `/profil/modifier`, `/profil/qr`, `/historique`,
`/rewards/gagner`, `/rewards/transfert`, `/rewards/utiliser`, `/rewards/historique`.

## Boutons : comportement et limites

- Accueil : stories (ajout et visionnage ; les stories des contacts sont des aperçus),
  publication, commentaires, partage, options (copier, masquer, signaler, supprimer) : tout est
  enregistré sur l'appareil jusqu'à la connexion du serveur.
- Messages : nouveau message (choix d'un correspondant) ; appel vidéo = information « pas encore
  disponible » avec repli vers un message.
- Retrait de position (cotes, coins) : envoie une **demande** en attente ; rien n'est versé.
- Rewards : transfert = demande en attente, solde inchangé.
- Commandes (Espace Pro) : le vendeur change le statut sur l'appareil ; le serveur validera.
- Stockage local : `src/lib/local-store.ts` (clés `africonnect.*`).
