# Market Event : Espace Pro ↔ page publique

## Règle

| Côté | Rôle |
| --- | --- |
| **Espace Pro** (privé) | Créer, publier, gérer les événements |
| **Page publique** (`/etablissement/:ref`) | Afficher les événements **publiés** et laisser clients / visiteurs **participer** |

Le frontend ne débite aucun Wallet ; les participations de démo sont locales.

## Flux

1. Pro → Événements → créer / publier (`ProExtras.events`, `published: true`).
2. Visiteur → page publique → onglet **Événements** (ou accueil « à la une »).
3. **Participer** / **S’inscrire** ouvre `EventSheet` (rappel ou RSVP local).
4. Loterie / réduction collective : écran dédié `/explorer/evenements/:id` via `resolveMarketEvent`.

## Fichiers

- `src/lib/pro-event-bridge.ts` — `proEventToMarketEvent`, `resolveMarketEvent`
- `src/lib/event-participation-store.ts` — RSVP / rappel locaux
- `src/components/pro-public/ProSections.tsx` — `EventsTab`, `HomeTab`
- `src/pages/services/ServiceEventsPage.tsx` — création privée
