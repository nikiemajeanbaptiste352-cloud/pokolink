/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu du Creator Performance Market.
 * Aucun facteur n'est calculé dans l'application : toutes ces valeurs seront fournies par
 * l'API (TanStack Query) une fois les règles du marché validées. Elles ont été préparées
 * hors application avec la formule du rapport, F(t+1) = F(t) × (1 + 0,02 × S), S = (G − A) /
 * (G + A), bornée entre 0,5 et 1,5, avec une moyenne de référence sur six périodes.
 * Aucune vidéo n'est fournie : un fond provisoire est affiché tant que `videoSrc` est absent.
 */
import type {
  CreatorMarket,
  MarketParams,
  MarketPoolFlowEntry,
  UserPosition,
} from '@/types/market'

export const TEMP_MARKET_PARAMS: MarketParams = {
  factorMin: 0.5,
  factorMax: 1.5,
  maxStep: 0.02,
  referencePeriods: 6,
  updateEveryMinutes: 60,
}

const now = Date.now()

function flow(
  entries: readonly Omit<MarketPoolFlowEntry, 'at'>[],
  offsetsMin: readonly number[],
): MarketPoolFlowEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    at: now - (offsetsMin[index] ?? 30) * 60_000,
  }))
}

export const TEMP_MARKETS: readonly CreatorMarket[] = [
  {
    id: 'mkt-1',
    creatorName: 'Awa Diallo',
    creatorHandle: 'awa.cuisine',
    title: 'Vues validées sur 24 h',
    caption: 'Le thieboudienne de ma grand-mère, étape par étape.',
    hashtags: ['Cuisine', 'Dakar'],
    /** Démo test : lien d’affiliation sous la vidéo. */
    partnershipLink: '/etablissement/boutique.alpha?aff=AFF-AWA01',
    status: 'open',
    updateState: 'active',
    referencePeriodsDone: 6,
    poolState: 'covered',
    coverageRatio: 1,
    poolCollected: 1_240_000,
    poolPaid: 186_000,
    poolBalance: 1_054_000,
    poolFlow: flow(
      [
        { id: 'f1-1', kind: 'stake', amount: 10_000, label: 'Mise OUI · Awa K.' },
        { id: 'f1-2', kind: 'withdraw', amount: 22_500, label: 'Retrait · Moussa D.' },
        { id: 'f1-3', kind: 'stake', amount: 5_000, label: 'Mise NON · Fatou S.' },
        { id: 'f1-4', kind: 'stake', amount: 25_000, label: 'Mise OUI · Ibrahim K.' },
        { id: 'f1-5', kind: 'withdraw', amount: 8_200, label: 'Retrait · Aminata O.' },
        { id: 'f1-6', kind: 'stake', amount: 15_000, label: 'Mise OUI · Kofi M.' },
      ],
      [4, 18, 35, 52, 90, 140],
    ),
    cote: 1.0164,
    openingCote: 1,
    history: [
      1, 1, 1, 1, 1, 1, 1.0012, 1.0029, 1.0055, 1.0085, 1.0104, 1.0128, 1.015, 1.0162,
      1.0159, 1.0147, 1.0144, 1.0164,
    ],
    recentRate: 1900,
    referenceRate: 1558,
    signal: 0.099,
    validatedViews: 23700,
    participants: 342,
    likes: 3200,
    comments: 145,
    shares: 61,
    timeLabel: 'Clôture dans 6 h',
    nextUpdateLabel: 'dans 23 min',
  },
  {
    id: 'mkt-2',
    creatorName: 'Moussa Traoré',
    creatorHandle: 'moussa.tech',
    title: 'Vues validées sur 24 h',
    caption: 'Trois outils gratuits pour lancer votre boutique en ligne.',
    hashtags: ['Business', 'Tech'],
    status: 'open',
    updateState: 'active',
    referencePeriodsDone: 6,
    poolState: 'limited',
    coverageRatio: 0.82,
    poolCollected: 2_860_000,
    poolPaid: 1_980_000,
    poolBalance: 880_000,
    poolFlow: flow(
      [
        { id: 'f2-1', kind: 'withdraw', amount: 45_000, label: 'Retrait · Sarah B.' },
        { id: 'f2-2', kind: 'withdraw', amount: 12_800, label: 'Retrait · Jean P.' },
        { id: 'f2-3', kind: 'stake', amount: 8_000, label: 'Mise NON · Lamine C.' },
        { id: 'f2-4', kind: 'withdraw', amount: 30_000, label: 'Retrait · Awa D.' },
      ],
      [8, 22, 40, 75],
    ),
    cote: 0.971,
    openingCote: 1,
    history: [
      1, 1, 1, 1, 1, 1, 1.0015, 1.0037, 1.0051, 1.0047, 1.0027, 0.9987, 0.9934, 0.9877,
      0.9839, 0.9791, 0.9749, 0.971,
    ],
    recentRate: 900,
    referenceRate: 1350,
    signal: -0.2,
    validatedViews: 37100,
    participants: 1204,
    likes: 12400,
    comments: 890,
    shares: 234,
    timeLabel: 'Clôture dans 6 h',
    nextUpdateLabel: 'dans 41 min',
  },
  {
    id: 'mkt-3',
    creatorName: 'Fatou Sané',
    creatorHandle: 'fatou.mode',
    title: 'Vues validées sur 24 h',
    caption: 'Ma collection wax de la saison. Qui la porte avec moi ?',
    hashtags: ['Mode', 'Wax'],
    status: 'upcoming',
    updateState: 'warmup',
    referencePeriodsDone: 0,
    poolState: 'covered',
    coverageRatio: 1,
    poolCollected: 0,
    poolPaid: 0,
    poolBalance: 0,
    poolFlow: [],
    cote: 1,
    openingCote: 1,
    history: [1],
    recentRate: 0,
    referenceRate: 0,
    signal: 0,
    validatedViews: 0,
    participants: 0,
    likes: 987,
    comments: 54,
    shares: 19,
    timeLabel: 'Ouverture demain à 08:00',
  },
  {
    id: 'mkt-4',
    creatorName: 'Ibrahim Kaboré',
    creatorHandle: 'ibra.sport',
    title: 'Vues validées sur 24 h',
    caption: 'Le but de la semaine, en ralenti.',
    hashtags: ['Foot', 'Ouaga'],
    status: 'closed',
    updateState: 'active',
    referencePeriodsDone: 6,
    poolState: 'covered',
    coverageRatio: 1,
    poolCollected: 4_120_000,
    poolPaid: 4_120_000,
    poolBalance: 0,
    poolFlow: flow(
      [
        { id: 'f4-1', kind: 'withdraw', amount: 95_000, label: 'Retrait final · Pool' },
        { id: 'f4-2', kind: 'withdraw', amount: 42_000, label: 'Retrait · Oumar S.' },
        { id: 'f4-3', kind: 'stake', amount: 20_000, label: 'Dernière mise · Chloé T.' },
      ],
      [120, 180, 240],
    ),
    cote: 1.0076,
    openingCote: 1,
    history: [
      1, 1, 1, 1, 1, 1, 1.0047, 1.0118, 1.0199, 1.0276, 1.0327, 1.035, 1.035, 1.0331,
      1.0301, 1.0266, 1.0231, 1.0199, 1.0172, 1.0147, 1.0135, 1.0117, 1.0097, 1.0076,
    ],
    recentRate: 1300,
    referenceRate: 1617,
    signal: -0.109,
    validatedViews: 45000,
    participants: 2310,
    likes: 21800,
    comments: 1320,
    shares: 640,
    timeLabel: 'Terminé hier',
  },
  {
    id: 'mkt-5',
    creatorName: 'Aminata Ouédraogo',
    creatorHandle: 'aminata.beaute',
    title: 'Vues validées sur 12 h',
    caption: 'Ma routine soin complète avec des produits locaux.',
    hashtags: ['Beauté', 'Abidjan'],
    status: 'open',
    updateState: 'warmup',
    referencePeriodsDone: 3,
    poolState: 'covered',
    coverageRatio: 1,
    poolCollected: 87_000,
    poolPaid: 0,
    poolBalance: 87_000,
    poolFlow: flow(
      [
        { id: 'f5-1', kind: 'stake', amount: 3_000, label: 'Mise OUI · Nadia R.' },
        { id: 'f5-2', kind: 'stake', amount: 7_500, label: 'Mise NON · Paul M.' },
        { id: 'f5-3', kind: 'stake', amount: 2_000, label: 'Mise OUI · Yael K.' },
      ],
      [12, 28, 55],
    ),
    cote: 1,
    openingCote: 1,
    history: [1, 1, 1],
    recentRate: 380,
    referenceRate: 0,
    signal: 0,
    validatedViews: 1200,
    participants: 58,
    likes: 640,
    comments: 31,
    shares: 12,
    timeLabel: 'Clôture dans 9 h',
    nextUpdateLabel: 'dans 41 min',
  },
  {
    id: 'mkt-6',
    creatorName: 'Kofi Mensah',
    creatorHandle: 'kofi.voyage',
    title: 'Vues validées sur 24 h',
    caption: 'Trois jours à Accra : mes adresses préférées.',
    hashtags: ['Voyage', 'Accra'],
    status: 'open',
    updateState: 'suspended',
    suspendedReason:
      'Les données de vues sont indisponibles. Le facteur est figé jusqu’au retour de données fiables : ce n’est pas une baisse de performance.',
    referencePeriodsDone: 6,
    poolState: 'covered',
    coverageRatio: 1,
    poolCollected: 420_000,
    poolPaid: 64_000,
    poolBalance: 356_000,
    poolFlow: flow(
      [
        { id: 'f6-1', kind: 'stake', amount: 12_000, label: 'Mise OUI · Mariam B.' },
        { id: 'f6-2', kind: 'withdraw', amount: 18_500, label: 'Retrait · Eric N.' },
      ],
      [45, 100],
    ),
    cote: 1.0066,
    openingCote: 1,
    history: [1, 1, 1, 1, 1, 1, 1.0008, 1.0023, 1.0044, 1.0058, 1.0066],
    recentRate: 860,
    referenceRate: 793,
    signal: 0.04,
    validatedViews: 8420,
    participants: 214,
    likes: 2300,
    comments: 98,
    shares: 40,
    timeLabel: 'Clôture dans 13 h',
  },
]

/**
 * Positions d'exemple du participant (TEMPORAIRE). Montants préparés hors application avec
 * V = M × r (OUI) ou M × max(0, 2 − r) (NON), r = facteur actuel / facteur d'entrée, puis
 * payable = arrondi inférieur(net × taux de couverture) : voir docs/creator-market-liquidite.md.
 */
export const TEMP_POSITIONS: readonly UserPosition[] = [
  {
    id: 'pos-1',
    marketId: 'mkt-1',
    side: 'yes',
    stake: 10000,
    entryCote: 1.008,
    theoreticalValue: 10083,
    latent: 83,
    netValue: 10083,
    payableNow: 10083,
  },
  {
    id: 'pos-2',
    marketId: 'mkt-2',
    side: 'no',
    stake: 20000,
    entryCote: 1,
    theoreticalValue: 20580,
    latent: 580,
    netValue: 20580,
    payableNow: 16875,
  },
]

export function getTempPositions(marketId: string): readonly UserPosition[] {
  return TEMP_POSITIONS.filter((position) => position.marketId === marketId)
}

export function getTempMarket(id: string | undefined): CreatorMarket | undefined {
  return TEMP_MARKETS.find((market) => market.id === id)
}
