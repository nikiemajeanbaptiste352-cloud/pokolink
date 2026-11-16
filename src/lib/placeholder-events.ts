/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu de Market Event.
 * Les horaires sont calculés à partir du chargement de la page pour que les comptes à
 * rebours soient visibles. À remplacer par les événements réels de l'API (TanStack Query) :
 * l'état, les prix, les stocks et les participations sont décidés par le serveur.
 */
import type { MarketEvent } from '@/types/event'

const NOW = Date.now()
const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export const TEMP_EVENTS: readonly MarketEvent[] = [
  {
    id: 'evt-flash-sneakers',
    kind: 'flash',
    title: 'Vente flash : baskets de ville',
    description:
      'Une paire à prix événement pendant 30 minutes seulement. Le stock est limité : quand il est épuisé, l’offre se termine.',
    host: {
      name: 'Sahel Sneakers',
      type: 'merchant',
      verified: true,
      proRef: 'sahel.sneakers',
    },
    startsAt: NOW - 2 * MIN,
    endsAt: NOW + 28 * MIN,
    offer: {
      productName: 'Baskets de ville Sahel',
      normalPrice: 20000,
      eventPrice: 12000,
      stockLeft: 31,
      stockTotal: 50,
    },
    participants: 214,
    partnershipLink: '/etablissement/boutique.alpha?aff=AFF-AWA01',
  },
  {
    id: 'evt-live-phone',
    kind: 'live',
    title: 'Live : le Téléphone X en démonstration',
    description:
      'Awa présente le Téléphone X en direct, répond à vos questions et dévoile un prix réservé au live.',
    host: { name: 'Awa Tech', type: 'creator', verified: true },
    startsAt: NOW - 25 * MIN,
    endsAt: NOW + 95 * MIN,
    offer: {
      productName: 'Téléphone X',
      normalPrice: 150000,
      eventPrice: 130000,
      stockLeft: 12,
      stockTotal: 40,
    },
    participants: 1832,
  },
  {
    id: 'evt-flash-wax',
    kind: 'flash',
    title: 'Vente flash : tissus wax',
    description: 'Trois jolis motifs à prix réduit, jusqu’à épuisement du stock.',
    host: { name: 'Wax & Co', type: 'merchant', proRef: 'wax.co' },
    startsAt: NOW + 45 * MIN,
    endsAt: NOW + 105 * MIN,
    offer: {
      productName: 'Pagne wax 6 yards',
      normalPrice: 10000,
      eventPrice: 7500,
      stockLeft: 60,
      stockTotal: 60,
    },
    participants: 96,
  },
  {
    id: 'evt-live-cuisine',
    kind: 'live',
    title: 'Live cuisine : le riz gras de Fatou',
    description: 'Cuisinez en direct avec Fatou et commandez les ustensiles utilisés.',
    host: { name: 'Fatou Cuisine', type: 'creator', verified: true },
    startsAt: NOW + 2 * HOUR,
    endsAt: NOW + 3 * HOUR,
    offer: {
      productName: 'Set de cuisine Fatou',
      normalPrice: 25000,
      eventPrice: 21000,
      stockLeft: 30,
      stockTotal: 30,
    },
    participants: 310,
  },
  {
    id: 'evt-launch-fashion',
    kind: 'launch',
    title: 'Fashion Night Ouaga',
    description:
      'Lancement de la nouvelle collection avec cinq créateurs invités : présentation, offre de lancement et coupon pour les participants.',
    host: { name: 'Maison Faso', type: 'brand', verified: true },
    startsAt: NOW + 3 * HOUR,
    endsAt: NOW + 5 * HOUR,
    offer: {
      productName: 'Robe collection Faso',
      normalPrice: 45000,
      eventPrice: 36000,
      stockLeft: 120,
      stockTotal: 120,
    },
    participants: 540,
  },
  {
    id: 'evt-promo-market',
    kind: 'promo',
    title: 'Promo : produits du quotidien',
    description:
      'Des réductions sur une sélection de produits, valables pendant toute la durée de l’événement.',
    host: { name: 'Nikiema Market', type: 'merchant' },
    startsAt: NOW - 3 * HOUR,
    endsAt: NOW + 2 * DAY,
    offer: {
      productName: 'Panier du quotidien',
      normalPrice: 15000,
      eventPrice: 12000,
      stockLeft: 86,
      stockTotal: 100,
    },
    participants: 392,
  },
  {
    id: 'evt-draw-bike',
    kind: 'draw',
    title: 'Tirage au sort : un vélo à gagner',
    description:
      'Participez à l’événement pour être inscrit au tirage. Les règles et la date du tirage sont publiques.',
    host: { name: 'Ibra Sport', type: 'creator' },
    startsAt: NOW + 1 * DAY,
    endsAt: NOW + 3 * DAY,
    reward: 'Un vélo tout terrain',
    participants: 0,
  },
  {
    id: 'evt-community-cooking',
    kind: 'community',
    title: 'Défi cuisine avec Awa',
    description:
      'Cuisinez la recette de la semaine, partagez-la et découvrez les créations de la communauté.',
    host: { name: 'Awa Cuisine', type: 'creator' },
    startsAt: NOW - 1 * HOUR,
    endsAt: NOW + 20 * HOUR,
    reward: 'Des coupons pour les participants',
    participants: 77,
  },
  {
    id: 'evt-lottery-bio',
    kind: 'lottery',
    title: 'Loterie : pack alimentation bio',
    description:
      'Participez pour tenter de gagner un pack de produits bio. Le tirage est réalisé par le serveur à la clôture.',
    host: { name: 'Bio Faso', type: 'merchant', verified: true, proRef: 'bio.faso' },
    startsAt: NOW - 2 * DAY,
    endsAt: NOW + 6 * HOUR,
    lottery: {
      prizeName: 'Pack Alimentation Bio',
      prizeValue: 25000,
      entryFee: 300,
      // Auto : valeur ÷ participation = 83 places ; 25 000 → 3 chances
      maxParticipants: 83,
      winnersCount: 1,
      drawMethod:
        'Tirage au sort parmi les numéros de tickets inscrits ; chaque carte loterie porte un numéro.',
      drawAt: NOW + 6 * HOUR + 30 * MIN,
      entriesPerPerson: 3,
      collected: 21600,
    },
    terms: {
      conditions:
        'Un compte AfriConnect est nécessaire. Chaque participation reçoit des tickets numérotés (nombre auto selon la valeur du produit). Le tirage se fait sur ces numéros.',
      funding: 'À définir avant l’ouverture réelle des loteries (voir la documentation).',
      delivery:
        'Le gagnant est prévenu par message. Le lot est remis ou livré selon les modalités de l’organisateur.',
      refund: 'À définir avant l’ouverture réelle des loteries (voir la documentation).',
    },
    participants: 72,
  },
  {
    id: 'evt-lottery-phone',
    kind: 'lottery',
    title: 'Loterie gratuite : un smartphone à gagner',
    description:
      'Participation gratuite : inscrivez-vous avant la clôture pour entrer dans le tirage au sort.',
    host: { name: 'Awa Tech', type: 'creator', verified: true },
    startsAt: NOW + 1 * DAY,
    endsAt: NOW + 4 * DAY,
    lottery: {
      prizeName: 'Smartphone Tecno',
      prizeValue: 90000,
      entryFee: 0,
      // Auto gratuit : max(500, valeur/50) = 1800 ; 90 000 → 9 chances
      maxParticipants: 1800,
      winnersCount: 2,
      drawMethod:
        'Tirage au sort parmi les numéros de tickets inscrits ; chaque carte loterie porte un numéro.',
      drawAt: NOW + 4 * DAY + HOUR,
      entriesPerPerson: 9,
      collected: 0,
    },
    terms: {
      conditions:
        'Un compte AfriConnect est nécessaire. Chaque participation reçoit des tickets numérotés (auto selon la valeur du produit). Le tirage se fait sur ces numéros.',
      funding: 'Participation gratuite : aucune somme n’est demandée.',
      delivery:
        'Les gagnants sont prévenus par message. Le lot est remis ou livré selon les modalités de l’organisateur.',
      refund: 'Sans objet : la participation est gratuite.',
    },
    participants: 0,
  },
  {
    id: 'evt-lottery-done',
    kind: 'lottery',
    title: 'Loterie : machine à coudre',
    description:
      'Campagne terminée : le tirage a désigné le ticket gagnant parmi les numéros inscrits.',
    host: { name: 'Couture Express', type: 'merchant', proRef: 'couture.express' },
    startsAt: NOW - 6 * DAY,
    endsAt: NOW - 1 * DAY,
    lottery: {
      prizeName: 'Machine à coudre',
      prizeValue: 120000,
      entryFee: 200,
      // Auto : 120 000 ÷ 200 = 600 places ; 120 000 → 10 chances (plafond)
      maxParticipants: 600,
      winnersCount: 1,
      drawMethod:
        'Tirage au sort parmi les numéros de tickets inscrits ; la carte gagnante est publiée.',
      drawAt: NOW - 1 * DAY + HOUR,
      entriesPerPerson: 10,
      proofRef: 'Exemple · empreinte 9f2c…b71a',
      collected: 370000,
      phase: 'awarded',
      winners: ['Mariam T., Bobo-Dioulasso'],
      winningTicketNumbers: ['LT-2026-014821'],
      drawTickets: [
        { number: 'LT-2026-014101', holderLabel: 'Awa K.' },
        { number: 'LT-2026-014218', holderLabel: 'Ibrahim S.' },
        { number: 'LT-2026-014337', holderLabel: 'Fatou B.' },
        { number: 'LT-2026-014456', holderLabel: 'Moussa D.' },
        {
          number: 'LT-2026-014821',
          holderLabel: 'Mariam T.',
          winner: true,
        },
        { number: 'LT-2026-014902', holderLabel: 'Serge O.' },
        { number: 'LT-2026-015033', holderLabel: 'Grace N.' },
        { number: 'LT-2026-015144', holderLabel: 'Paul Y.' },
      ],
    },
    terms: {
      conditions:
        'Un compte AfriConnect est nécessaire. Chaque participation reçoit des tickets numérotés. Le tirage de fin de session se fait sur ces numéros.',
      funding: 'À définir avant l’ouverture réelle des loteries (voir la documentation).',
      delivery:
        'Le gagnant a été prévenu par message ; le lot est remis par l’organisateur.',
      refund: 'À définir avant l’ouverture réelle des loteries (voir la documentation).',
    },
    participants: 600,
  },
  {
    id: 'evt-collective-phone',
    kind: 'collective',
    title: 'Réduction collective : Tecno Spark',
    description:
      'Plus nous sommes nombreux à contribuer, plus le prix baisse. À la clôture, le prix est arrêté pour tous.',
    host: { name: 'Awa Tech', type: 'creator', verified: true },
    startsAt: NOW - 3 * DAY,
    endsAt: NOW + 4 * DAY,
    collective: {
      productName: 'Téléphone Tecno Spark',
      initialPrice: 100000,
      currentPrice: 85000,
      entryFee: 500,
      collected: 640000,
      tiers: [
        { collected: 0, price: 100000 },
        { collected: 250000, price: 95000 },
        { collected: 500000, price: 85000 },
        { collected: 750000, price: 78000 },
        { collected: 1000000, price: 70000 },
      ],
      stockLeft: 15,
      stockTotal: 20,
    },
    terms: {
      conditions:
        'Un compte AfriConnect est nécessaire. Le montant de contribution est le même pour tous.',
      funding:
        'À définir avant l’ouverture réelle des réductions collectives (voir la documentation).',
      delivery:
        'Après la clôture, l’achat est ouvert au prix final, dans la limite du stock disponible.',
      refund:
        'À définir avant l’ouverture réelle des réductions collectives (voir la documentation).',
    },
    participants: 1280,
  },
  {
    id: 'evt-collective-done',
    kind: 'collective',
    title: 'Réduction collective : mixeur Kenwood',
    description:
      'Campagne clôturée : le prix est arrêté et l’achat est ouvert dans la limite du stock.',
    host: {
      name: 'Maison Pratique',
      type: 'merchant',
      verified: true,
      proRef: 'maison.pratique',
    },
    startsAt: NOW - 8 * DAY,
    endsAt: NOW - 1 * DAY,
    collective: {
      productName: 'Mixeur Kenwood 800 W',
      initialPrice: 100000,
      currentPrice: 70000,
      entryFee: 500,
      collected: 1120000,
      tiers: [
        { collected: 0, price: 100000 },
        { collected: 250000, price: 95000 },
        { collected: 500000, price: 85000 },
        { collected: 750000, price: 78000 },
        { collected: 1000000, price: 70000 },
      ],
      stockLeft: 12,
      stockTotal: 20,
    },
    terms: {
      conditions:
        'Un compte AfriConnect est nécessaire. Le montant de contribution est le même pour tous.',
      funding:
        'À définir avant l’ouverture réelle des réductions collectives (voir la documentation).',
      delivery:
        'L’achat est ouvert au prix final de 70 000 FCFA, dans la limite du stock disponible.',
      refund:
        'À définir avant l’ouverture réelle des réductions collectives (voir la documentation).',
    },
    participants: 2240,
  },
  {
    id: 'evt-salon-afrique',
    kind: 'community',
    title: 'Salon des Entrepreneurs d’Afrique',
    description:
      'Trois jours de rencontres entre entrepreneurs, exposants et clients à Ouagadougou.',
    host: { name: 'Salon des Entrepreneurs d’Afrique', type: 'brand', verified: true },
    startsAt: NOW + 26 * HOUR,
    endsAt: NOW + 26 * HOUR + 3 * DAY,
    reward: 'Rencontres, démonstrations et offres de lancement',
    participants: 2800,
  },
]

export function getTempEvent(id: string | undefined): MarketEvent | undefined {
  return TEMP_EVENTS.find((event) => event.id === id)
}
