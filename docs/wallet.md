# Wallet AfriConnect — frontend (v3.0 : dépôts automatisés, retraits manuels)

> Document reconstruit après une suppression accidentelle du fichier (les sections 1 à 7 sont réécrites d'après le code, la section 8 et la section 9 sont reprises telles quelles). À relire avec le rapport Wallet v3.0.

## 1. Périmètre

Frontend uniquement : écrans utilisateur du Wallet. Aucune API, aucune table, aucune règle financière n'est créée ou modifiée. Le serveur décide de tout : soldes, statuts, frais, limites, numéro marchand, crédit et débit. Le frontend affiche, collecte une saisie (montant, PIN) et envoie une demande ; il ne crédite, ne débite et ne réserve jamais rien.

Écrans : soldes (disponible, réservé, total), « En cours », historique filtrable, dépôt (montant → instructions avec compte à rebours de 5 minutes → déclaration), retrait (formulaire + PIN), pages de suivi de chaque statut, paiements internes (section 9) et paiements entre utilisateurs (section 10).

## 2. Routes

| Route                           | Écran                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `/wallet`                       | Soldes, opérations en cours, historique (filtres Tout, Dépôts, Retraits, Paiements) |
| `/wallet/depot`                 | Nouveau dépôt : montant, instructions de transfert, compte à rebours, déclaration   |
| `/wallet/depot/:depositId`      | Suivi d'un dépôt (frise d'étapes, message du statut)                                |
| `/wallet/retrait`               | Nouveau retrait : moyen, numéro, montant, PIN                                       |
| `/wallet/retrait/:withdrawalId` | Suivi d'un retrait (frise, sort des fonds)                                          |
| `/wallet/transfert`             | Envoyer / Demander entre utilisateurs (section 10)                                  |

Fichiers : `src/pages/wallet/*`, `src/components/wallet/*`, `src/lib/wallet-labels.ts`, `wallet-schemas.ts`, `placeholder-wallet.ts`, `wallet-payments-store.ts`, `src/hooks/use-wallet.ts`, `src/types/wallet.ts`.

## 3. Statuts (noms API) et messages

Le frontend n'invente aucun statut : il traduit celui que le serveur envoie (`src/lib/wallet-labels.ts`).

**Dépôt** (frise : Demande créée, Paiement détecté, Vérification, Wallet crédité) : `CREATED` Demande créée, `WAITING_PAYMENT` En attente du transfert, `PAYMENT_DETECTED` Paiement détecté, `VERIFYING` Vérification en cours, `APPROVED` Transfert validé, `CREDITED` Wallet crédité, `REJECTED` Dépôt rejeté, `EXPIRED` Demande expirée, `MANUAL_REVIEW` Vérification manuelle.

**Retrait** (frise : Demande reçue, Demande validée, Transfert en cours, Retrait effectué) : `PENDING_ADMIN` En attente de validation, `VALIDATED` Demande validée, `PROCESSING` Transfert en cours, `COMPLETED` Retrait effectué, `REJECTED` Demande rejetée, `FAILED` Transfert échoué, `MANUAL_REVIEW` Vérification complémentaire, `CANCELLED` Demande annulée.

Sort des fonds d'un retrait (information, pas un calcul) : réservés (en attente, validé, en cours, vérification), sortis (effectué), restitués (rejeté, échoué), à définir (annulé).

Sont « En cours » : dépôts `CREATED` à `APPROVED` et `MANUAL_REVIEW` ; retraits `PENDING_ADMIN`, `VALIDATED`, `PROCESSING`, `MANUAL_REVIEW`.

## 4. Règles du rapport respectées

- Le serveur calcule et décide ; aucun calcul financier dans le frontend (le « total » est fourni).
- Dépôt : délai de 5 minutes pour effectuer le transfert ; un transfert tardif ou sans identifiant de transaction n'est jamais crédité automatiquement (vérification manuelle).
- Retrait : le montant est réservé dès la demande ; restitué seulement en cas de rejet ou d'échec constaté ; en cas de résultat incertain, les fonds restent réservés.
- Code PIN de 4 à 6 chiffres : jamais stocké ni affiché.
- Solde insuffisant signalé avant l'envoi (aide à la saisie), la décision finale revient au serveur.
- Les paiements internes (cotes, coins, forfaits, envois) créent seulement une demande « en attente de confirmation ».

## 5. Valeurs d'exemple à confirmer

Dans `src/lib/placeholder-wallet.ts` (à remplacer par l'API) : soldes 125 000 disponibles et 50 000 réservés ; limites `TEMP_LIMITS` (dépôt 1 000 à 500 000, retrait 1 000 à 300 000, envoi entre utilisateurs 100 à 200 000 FCFA) ; moyens de dépôt (Orange Money) et de retrait (Orange Money, Moov Money, Wave) ; numéro marchand d'exemple et code USSD d'exemple du rapport (format à confirmer avec le compte marchand réel).

## 6. Questions ouvertes (rapport, section 32)

Frais de dépôt, de retrait et de paiement ; limites réelles par moyen et par niveau de compte ; moyens activés ; format exact du code USSD ; durée de réservation avant annulation ; règles de restitution après annulation ; délais de traitement annoncés aux utilisateurs.

## 7. Non connecté

Soldes, historique, création des demandes de dépôt et de retrait, vérification du PIN, notifications et temps réel : tout est simulé ou absent tant que le serveur Wallet n'est pas branché. Chaque écran concerné porte un bandeau « Aperçu de démonstration ».

## 8. Tests réalisés

Largeurs 360 et 320 px, thèmes clair et sombre : aucun débordement horizontal, cibles tactiles ≥ 44 px, 17 pages de statut et l'état « introuvable » vérifiés, validations (minimum, maximum, format, solde, PIN), parcours dépôt et retrait jusqu'à l'écran de confirmation de démonstration.

## 9. Paiement interne du Creator Market (cotes et coins)

Le fil `/cotes` et les pages d'événement paient depuis le Wallet (`WalletPaymentForm`) :

- **Cotes** : feuille « Prendre position » (OUI / NON, mise en FCFA).
- **Coins** : feuille « Acheter des coins » (nombre de coins × prix du coin).

Parcours : l'écran affiche le solde disponible, compare le montant (aide à la saisie, « solde insuffisant » avec lien vers le dépôt), demande le code PIN (4 à 6 chiffres, jamais conservé), puis **envoie une demande**. Le solde affiché ne change pas : le serveur vérifie le solde, débite le Wallet et décide. La demande apparaît dans **Wallet → En cours** avec le statut « En attente de confirmation » et son montant sans signe (ce n'est pas encore un mouvement du solde).

Technique : `src/hooks/use-wallet.ts` (`useWalletBalances`, `useWalletPayments`), stockage d'essai `src/lib/wallet-payments-store.ts` (`localStorage`, clé `africonnect.wallet-payments.v1`). À remplacer par l'API, qui garantira l'unicité de la demande (clé d'idempotence), le débit et le résultat.

Points à trancher : montants minimum et maximum d'une mise ou d'un achat, frais, et la nature des mises. Le libellé de la mise passe de « points » à **FCFA** (cohérent avec le rapport de liquidité) : cela fait des mises une somme d'argent réelle, donc la vérification juridique signalée dans `docs/creator-market-liquidite.md` est nécessaire avant tout lancement. Autres paiements internes (caisse, événements) : toujours non branchés.

## 10. Paiements entre utilisateurs (P2P) et forfaits

Page `/wallet/transfert` (bouton « Envoyer / Demander » de la carte de solde), deux formulaires :

- **Envoyer** : destinataire (`@identifiant` ou numéro de téléphone), montant (de 100 à 200 000 FCFA, valeurs d'essai dans `TEMP_LIMITS`), message facultatif. Un récapitulatif s'affiche, puis `WalletPaymentForm` (solde, avertissement « solde insuffisant », code PIN jamais conservé) envoie la demande. On ne peut pas s'envoyer de l'argent à soi-même.
- **Demander** : même formulaire, sans PIN (aucun débit pour l'utilisateur).

Dans les deux cas, seule une **demande « en attente de confirmation »** est créée (`purpose` `p2p_send` ou `p2p_request`, avec `recipient`) : le solde ne bouge pas, le serveur vérifie le destinataire, le solde et les limites, puis décide. Elle apparaît dans Wallet → En cours.

Le paiement d'un forfait d'abonnement utilise le même formulaire (`purpose` `subscription`) : voir `docs/tickets-explorer.md`, section « Cartes d'abonnement ».

Points à trancher : plafonds, frais, vérification du destinataire (identifiant unique ?), expiration d'une demande d'argent, notification du destinataire.
