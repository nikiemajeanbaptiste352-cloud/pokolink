# Wallet, panier et paiements AfriConnect (frontend)

Frontend uniquement. Aucune API, table, migration ni règle financière n'est touchée.
Le serveur reste seul juge des dépôts, débits, crédits, commissions, tickets et
contrepassations.

## 1. Principe du Wallet interne

AfriConnect dispose d'un **Wallet FCFA unique**. L'utilisateur l'approvisionne via Orange
Money, Moov Money, Wave (ou d'autres moyens plus tard) : ces moyens ne servent qu'au
**dépôt**. Une fois crédité, toutes les opérations payantes de l'application passent par
ce Wallet — sans nouveau paiement externe à chaque achat.

Le Wallet FCFA est **distinct** du Wallet Rewards.

Le frontend n'exécute aucun mouvement : il envoie une demande « en attente de
confirmation ». Le serveur vérifie le solde, débite le payeur, crédite le bénéficiaire,
applique la commission AfriConnect si elle s'applique, et enregistre le journal.

## 2. Panier (présentation type coupons)

Le panier reprend uniquement le principe visuel de cartes compactes empilées (pas de
pari) :

- photo, nom, vendeur, référence, prix unitaire, quantité, total article ;
- modification de quantité et suppression ;
- récapitulatif : nombre d'articles, sous-total, réductions, frais, total à payer ;
- bouton **Passer au paiement** ;
- **un panier par vendeur** : un paiement va à un seul bénéficiaire.

Fichiers : `CartPage`, `CartGroup`, `CartItemCard`, `OrderTotals`, `cart-store`.

## 3. Formulaire universel de paiement

Chaque action payante ouvre `WalletPaymentForm` :

| Bloc         | Contenu                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| Payeur       | Nom, prénom, @identifiant ; adresse / téléphone seulement si la prestation l'exige                    |
| Bénéficiaire | Nom, photo, @identifiant, commerce                                                                    |
| Transaction  | Motif, désignation, quantité, prix unitaire (si un seul article), réduction, commission (note), total |
| Wallet       | Solde disponible, montant à débiter, solde restant (aperçu)                                           |

Finalités : `purchase`, `subscription`, `advertising`, `position`, `coins`, `p2p_send`,
`p2p_request`. Solde insuffisant → proposition de dépôt ; le panier est conservé.

## 4. Parcours d'achat

1. Ajouter au panier / Acheter (fiche produit ou boutique).
2. Vérifier les cartes et le total (`/panier`).
3. Caisse (`/panier/commande/:serviceId`) : informations acheteur, puis formulaire Wallet.
4. Demande enregistrée : achat `pending_payment` + demande Wallet liée (`walletPaymentId`).
5. Suivi : Mes achats, détail, Historique, Wallet.

Aucun solde n'est modifié côté client. Aucun achat n'est marqué « payé » par le frontend.

## 5. Débits, crédits et commissions (serveur)

Exemple d'intention métier (5 000 FCFA, commission 5 %) — **calculé et exécuté par le
serveur** :

- acheteur : débit 5 000 ;
- vendeur : crédit 4 750 ;
- AfriConnect : crédit 250.

Le frontend affiche la note de commission et les montants indicatifs ; les taux et le
journal définitif viennent du serveur.

## 6. Tickets et justificatifs

Après **confirmation effective** du paiement par le serveur :

- **ticket** : preuve à présenter (QR code) tant que la remise n'est pas faite ;
- **justificatif** : preuve de paiement sans validation physique.

Une demande en attente, refusée ou annulée **n'en produit jamais**. Routes :
`/justificatif/achat/:id`, `/justificatif/operation/:id`. Voir aussi Tickets et
l'Historique.

## 7. Historique

`/historique` regroupe demandes Wallet, achats et Rewards. Les corrections passent par
des annulations / contrepassations côté serveur : le frontend ne « corrige » pas une
ligne en la supprimant.

## 8. Fichiers clés

| Zone     | Fichiers                                                                 |
| -------- | ------------------------------------------------------------------------ |
| Panier   | `src/lib/cart-store.ts`, `src/components/cart/*`, `CartPage.tsx`         |
| Achats   | `purchases-store.ts`, `CheckoutPage.tsx`, `PurchaseDetailPage.tsx`       |
| Paiement | `WalletPaymentForm.tsx`, `wallet-payments-store.ts`, `payment-labels.ts` |
| Preuves  | `receipts.ts`, `ReceiptPage.tsx`, `ReceiptCard.tsx`                      |

## 9. Non fait (backend)

- Exécution atomique des débits / crédits / commissions.
- Commandes reçues côté vendeur (Espace Pro) via l'API.
- Génération réelle des numéros et QR codes de tickets.
- Remboursements et contrepassations.
- Adresse de livraison demandée dynamiquement selon le mode de remise (prévu : props
  `requiresAddress` / `requiresPhone` du formulaire).
