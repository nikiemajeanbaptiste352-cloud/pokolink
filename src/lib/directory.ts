/**
 * ANNUAIRE TEMPORAIRE des établissements d'exemple.
 *
 * Les cartes d'Explorer (produits, boutiques, services, restaurants) et les organisateurs
 * de Market Event ne pointaient vers rien : aucun établissement réel n'existe à part ceux
 * que l'utilisateur crée lui-même dans son Espace Pro. Cet annuaire donne à chacun un
 * profil public d'exemple, construit avec les mêmes types que les vrais établissements
 * (`Service`, `CatalogItem`, `ProExtras`) pour que la même page serve aux deux.
 *
 * Ces établissements n'appartiennent PAS à l'utilisateur : le visiteur ne voit jamais
 * « Gérer mon Espace Pro » sur eux. À remplacer par l'API : l'identifiant d'un
 * établissement est `Service.id` (le `professional_space_id` du cahier des charges).
 */
import { buildProExtrasSeed } from '@/lib/pro-extras-seed'
import { registerProExtrasSeed } from '@/lib/pro-extras-store'
import { createDefaultHours, createServiceDraft } from '@/lib/service-defaults'
import type { ChannelPost, ProEvent, ProExtras } from '@/types/pro'
import type { AccentId, CatalogItem, Service, ServiceType } from '@/types/service'

export type HighlightKind = 'experience' | 'clients' | 'projects' | 'quality'

export interface ProHighlight {
  kind: HighlightKind
  value: string
  label: string
}

export interface DemoPro {
  service: Service
  items: CatalogItem[]
  extras: ProExtras
  tagline: string
  verified: boolean
  followers: number
  rating: number
  reviewCount: number
  highlights: readonly ProHighlight[]
}

interface ItemSpec {
  id: string
  name: string
  price: number
  category: string
  description?: string
  quantity?: number
}

interface DemoSpec {
  username: string
  name: string
  type: ServiceType
  tagline: string
  city: string
  address?: string
  phone?: string
  description: string
  accent?: AccentId
  verified?: boolean
  followers: number
  rating: number
  reviewCount: number
  items?: readonly ItemSpec[]
  highlights?: readonly ProHighlight[]
  customize?: (base: ProExtras, service: Service, items: CatalogItem[]) => ProExtras
}

const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString()

function buildDemoPro(spec: DemoSpec): DemoPro {
  const id = `demo-${spec.username}`
  const service: Service = {
    ...createServiceDraft({
      id,
      type: spec.type,
      name: spec.name,
      username: spec.username,
    }),
    status: 'active',
    description: spec.description,
    country: 'Burkina Faso',
    city: spec.city,
    address: spec.address ?? '',
    accent: spec.accent ?? 'green',
    contacts: {
      phone: spec.phone ?? '',
      whatsapp: '',
      email: '',
      website: '',
      facebook: '',
      instagram: '',
      tiktok: '',
    },
    hours: createDefaultHours(),
    // Démo : crédit commerçant activé au niveau établissement.
    allowMerchantCredit: true,
  }
  const items: CatalogItem[] = (spec.items ?? []).map((item, index) => ({
    id: item.id,
    serviceId: id,
    name: item.name,
    image: '',
    description: item.description ?? '',
    price: item.price,
    category: item.category,
    stockMode: 'quantity',
    quantity: item.quantity ?? 20,
    available: true,
    // Démo : 1er article de chaque boutique autorise le crédit pour tester le parcours.
    allowMerchantCredit: index === 0,
    options: [],
  }))
  const base = buildProExtrasSeed(service, items)
  return {
    service,
    items,
    extras: spec.customize ? spec.customize(base, service, items) : base,
    tagline: spec.tagline,
    verified: spec.verified ?? false,
    followers: spec.followers,
    rating: spec.rating,
    reviewCount: spec.reviewCount,
    highlights: spec.highlights ?? [],
  }
}

/** Identifiant de l'événement d'exemple auquel TechPro participe (voir `placeholder-events.ts`). */
const SALON_EVENT_ID = 'evt-salon-afrique'

const TECHPRO_POSTS: ChannelPost[] = [
  {
    id: 'tp-post-1',
    type: 'promotion',
    title: 'TV Smart 55" à prix choc !',
    description: 'Profitez de notre offre spéciale jusqu’au 30 novembre.',
    media: [],
    itemId: 'techpro-tv',
    promoPrice: 320000,
    status: 'published',
    publishedAt: iso(-2 * HOUR),
    createdAt: iso(-3 * HOUR),
    views: 1210,
    reactions: 96,
  },
  {
    id: 'tp-post-2',
    type: 'news',
    title: 'Climatiseurs : entretien dès maintenant !',
    description: 'Gardez votre confort tout l’été avec TechPro Services.',
    media: [{ kind: 'video', name: 'entretien-climatiseur.mp4', src: '' }],
    itemId: '',
    promoPrice: null,
    status: 'published',
    publishedAt: iso(-1 * DAY),
    createdAt: iso(-1 * DAY),
    views: 2310,
    reactions: 188,
  },
]

const TECHPRO_EVENTS: ProEvent[] = [
  {
    id: SALON_EVENT_ID,
    title: 'Salon des Entrepreneurs d’Afrique',
    kind: 'community',
    description: 'Trois jours de rencontres entre entrepreneurs, exposants et clients.',
    cover: '',
    startsAt: NOW + 26 * HOUR,
    endsAt: NOW + 26 * HOUR + 3 * DAY,
    location: 'Ouaga Palais des Sports',
    extra: '',
    organizer: 'Salon des Entrepreneurs d’Afrique',
    mine: false,
    published: true,
    participation: 'confirmed',
    participants: 2800,
  },
]

const DEMO_SPECS: readonly DemoSpec[] = [
  {
    username: 'techpro',
    name: 'TechPro Services',
    type: 'boutique',
    tagline: 'Services Informatiques & Électroménagers',
    city: 'Ouagadougou',
    address: 'Avenue Kwame N’Krumah, Ouagadougou',
    phone: '+226 70 00 00 00',
    description:
      'Votre partenaire de confiance pour tous vos besoins en informatique, électroménagers et solutions digitales. Vente, installation, entretien et dépannage.',
    accent: 'orange',
    verified: true,
    followers: 32400,
    rating: 4.8,
    reviewCount: 12500,
    highlights: [
      { kind: 'experience', value: '5+ ans', label: 'd’expérience' },
      { kind: 'clients', value: '10k+ clients', label: 'satisfaits' },
      { kind: 'projects', value: '50+ projets', label: 'réalisés' },
      { kind: 'quality', value: '100 % qualité', label: 'garantie' },
    ],
    items: [
      {
        id: 'techpro-pc',
        name: 'Ordinateur HP',
        price: 425000,
        category: 'Informatique',
        description: 'Portable 15,6" — 8 Go de mémoire, 512 Go SSD.',
        quantity: 8,
      },
      {
        id: 'techpro-galaxy',
        name: 'Samsung Galaxy A16',
        price: 185000,
        category: 'Téléphones',
        description: 'Smartphone 128 Go, double SIM.',
        quantity: 14,
      },
      {
        id: 'techpro-casque',
        name: 'Casque Bluetooth',
        price: 25000,
        category: 'Accessoires',
        description: 'Casque sans fil avec réduction de bruit.',
        quantity: 30,
      },
      {
        id: 'techpro-tv',
        name: 'TV Smart 55"',
        price: 360000,
        category: 'Électroménager',
        description: 'Téléviseur 4K connecté.',
        quantity: 5,
      },
    ],
    customize: (base) => ({
      ...base,
      posts: TECHPRO_POSTS,
      events: [...TECHPRO_EVENTS, ...base.events.filter((e) => !e.mine)],
      plans: [
        {
          id: 'tp-plan-1',
          name: 'Essentiel',
          description: 'Assistance au quotidien.',
          price: 15000,
          duration: 'monthly',
          benefits: ['Assistance 24/7'],
          conditions: 'Sans engagement, renouvelable chaque mois.',
          image: '',
          status: 'active',
          createdAt: iso(-60 * DAY),
        },
        {
          id: 'tp-plan-2',
          name: 'Premium',
          description: 'Service prioritaire.',
          price: 30000,
          duration: 'monthly',
          benefits: ['Service prioritaire', 'Assistance 24/7'],
          conditions: 'Sans engagement, renouvelable chaque mois.',
          image: '',
          status: 'active',
          createdAt: iso(-45 * DAY),
        },
        {
          id: 'tp-plan-3',
          name: 'Entreprise',
          description: 'Accompagnement sur mesure.',
          price: 0,
          duration: 'monthly',
          benefits: ['Accompagnement dédié'],
          conditions: 'Sur devis.',
          image: '',
          status: 'active',
          createdAt: iso(-30 * DAY),
        },
      ],
    }),
  },
  {
    username: 'garage.wend-kuuni',
    name: 'Garage Wend-Kuuni',
    type: 'boutique',
    tagline: 'Entretien automobile',
    city: 'Ouagadougou',
    address: 'Route de Bobo, Ouagadougou',
    description: 'Vidange, freins, diagnostic et entretien de votre véhicule.',
    verified: true,
    followers: 2900,
    rating: 4.7,
    reviewCount: 340,
    items: [
      {
        id: 'wk-vidange',
        name: 'Vidange complète',
        price: 15000,
        category: 'Entretien',
        description: 'Huile moteur, filtre à huile et contrôle des niveaux.',
        quantity: 50,
      },
      {
        id: 'wk-freins',
        name: 'Contrôle des freins',
        price: 8000,
        category: 'Entretien',
        description: 'Vérification des plaquettes, des disques et du liquide.',
        quantity: 50,
      },
    ],
  },
  // --- Vendeurs des produits d'Explorer ---
  {
    username: 'boutique.alpha',
    name: 'Boutique Alpha',
    type: 'boutique',
    tagline: 'Téléphones et accessoires',
    city: 'Ouagadougou',
    description: 'Smartphones neufs et accessoires, garantis.',
    verified: true,
    followers: 3400,
    rating: 4.8,
    reviewCount: 410,
    items: [
      { id: 'pr1', name: 'Smartphone Pro 128 Go', price: 650000, category: 'Téléphones' },
    ],
  },
  {
    username: 'techstore',
    name: 'TechStore',
    type: 'boutique',
    tagline: 'High-tech et objets connectés',
    city: 'Ouagadougou',
    description:
      'Le high-tech au meilleur prix : montres connectées, audio, accessoires.',
    verified: true,
    followers: 12500,
    rating: 4.7,
    reviewCount: 980,
    items: [
      {
        id: 'pr2',
        name: 'Montre connectée M6',
        price: 25000,
        category: 'Objets connectés',
      },
    ],
  },
  {
    username: 'audiopro',
    name: 'AudioPro',
    type: 'boutique',
    tagline: 'Casques et écouteurs',
    city: 'Bobo-Dioulasso',
    description: 'Spécialiste de l’audio : écouteurs, casques, enceintes.',
    verified: true,
    followers: 2100,
    rating: 4.7,
    reviewCount: 230,
    items: [{ id: 'pr3', name: 'Écouteurs sans fil', price: 18000, category: 'Audio' }],
  },
  {
    username: 'sneakers.house',
    name: 'Sneakers House',
    type: 'boutique',
    tagline: 'Baskets et chaussures de sport',
    city: 'Ouagadougou',
    description: 'Les meilleures baskets de la ville.',
    followers: 1800,
    rating: 4.5,
    reviewCount: 160,
    items: [
      { id: 'pr4', name: 'Baskets de sport', price: 55000, category: 'Chaussures' },
    ],
  },
  {
    username: 'beauty.center',
    name: 'Beauty Center',
    type: 'boutique',
    tagline: 'Beauté et parfums',
    city: 'Ouagadougou',
    description: 'Parfums, soins et idées cadeaux.',
    verified: true,
    followers: 4300,
    rating: 4.4,
    reviewCount: 320,
    items: [{ id: 'pr5', name: 'Parfum d’intérieur', price: 35000, category: 'Maison' }],
  },
  // --- Boutiques en tendance ---
  {
    username: 'fashion.house',
    name: 'Fashion House',
    type: 'boutique',
    tagline: 'Mode et accessoires',
    city: 'Ouagadougou',
    description: 'Vêtements et accessoires de créateurs locaux.',
    verified: true,
    followers: 8700,
    rating: 4.6,
    reviewCount: 540,
  },
  {
    username: 'good.food',
    name: 'Good Food',
    type: 'boutique',
    tagline: 'Épicerie fine et produits locaux',
    city: 'Ouagadougou',
    description: 'Produits locaux, frais et de saison.',
    verified: true,
    followers: 6200,
    rating: 4.8,
    reviewCount: 410,
  },
  {
    username: 'home.deco',
    name: 'Home Deco',
    type: 'boutique',
    tagline: 'Décoration d’intérieur',
    city: 'Bobo-Dioulasso',
    description: 'Tout pour embellir votre maison.',
    followers: 5100,
    rating: 4.5,
    reviewCount: 290,
  },
  // --- Services populaires ---
  {
    username: 'transport.urbain',
    name: 'Transport urbain',
    type: 'transport',
    tagline: 'Transport',
    city: 'Ouagadougou',
    description: 'Réservez vos trajets en ville.',
    verified: true,
    followers: 9000,
    rating: 4.3,
    reviewCount: 1200,
  },
  {
    username: 'gaz.domestique',
    name: 'Gaz domestique',
    type: 'station',
    tagline: 'Énergie',
    city: 'Ouagadougou',
    description: 'Recharge et livraison de gaz domestique.',
    verified: true,
    followers: 4000,
    rating: 4.6,
    reviewCount: 850,
  },
  {
    username: 'electricite',
    name: 'Électricité',
    type: 'boutique',
    tagline: 'Énergie',
    city: 'Ouagadougou',
    description: 'Services liés à l’électricité.',
    verified: true,
    followers: 7000,
    rating: 4.2,
    reviewCount: 1000,
  },
  {
    username: 'eau.potable',
    name: 'Eau potable',
    type: 'boutique',
    tagline: 'Services publics',
    city: 'Ouagadougou',
    description: 'Services liés à l’eau potable.',
    verified: true,
    followers: 3200,
    rating: 4.1,
    reviewCount: 680,
  },
  {
    username: 'telecommunications',
    name: 'Télécommunications',
    type: 'boutique',
    tagline: 'Télécoms',
    city: 'Ouagadougou',
    description: 'Forfaits, recharges et assistance.',
    followers: 15000,
    rating: 4.4,
    reviewCount: 2300,
  },
  // --- Restaurants ---
  {
    username: 'le.gourmet',
    name: 'Le Gourmet',
    type: 'restaurant',
    tagline: 'Cuisine variée',
    city: 'Ouagadougou',
    description: 'Cuisine soignée, sur place ou à emporter.',
    followers: 2400,
    rating: 4.6,
    reviewCount: 310,
  },
  {
    username: 'pizza.house',
    name: 'Pizza House',
    type: 'restaurant',
    tagline: 'Pizzas au feu de bois',
    city: 'Ouagadougou',
    description: 'Pizzas, pâtes et desserts.',
    followers: 1900,
    rating: 4.4,
    reviewCount: 220,
  },
  {
    username: 'chez.alima',
    name: 'Chez Alima',
    type: 'restaurant',
    tagline: 'Cuisine traditionnelle',
    city: 'Ouagadougou',
    description: 'Les plats du terroir, comme à la maison.',
    followers: 3100,
    rating: 4.7,
    reviewCount: 430,
  },
  {
    username: 'wend.panga',
    name: 'Wend Panga',
    type: 'restaurant',
    tagline: 'Grillades et boissons',
    city: 'Ouagadougou',
    description: 'Grillades, brochettes et boissons fraîches.',
    followers: 1500,
    rating: 4.5,
    reviewCount: 190,
  },
  // --- Organisateurs de Market Event ---
  {
    username: 'sahel.sneakers',
    name: 'Sahel Sneakers',
    type: 'boutique',
    tagline: 'Baskets de ville',
    city: 'Ouagadougou',
    description: 'Baskets de ville et ventes flash.',
    verified: true,
    followers: 2600,
    rating: 4.6,
    reviewCount: 180,
  },
  {
    username: 'wax.co',
    name: 'Wax & Co',
    type: 'boutique',
    tagline: 'Tissus wax',
    city: 'Ouagadougou',
    description: 'Pagnes et tissus wax de qualité.',
    followers: 1200,
    rating: 4.5,
    reviewCount: 90,
  },
  {
    username: 'bio.faso',
    name: 'Bio Faso',
    type: 'boutique',
    tagline: 'Produits bio',
    city: 'Ouagadougou',
    description: 'Alimentation bio et produits naturels.',
    verified: true,
    followers: 3900,
    rating: 4.7,
    reviewCount: 260,
  },
  {
    username: 'couture.express',
    name: 'Couture Express',
    type: 'boutique',
    tagline: 'Couture et retouches',
    city: 'Bobo-Dioulasso',
    description: 'Couture sur mesure et retouches rapides.',
    followers: 800,
    rating: 4.3,
    reviewCount: 70,
  },
  {
    username: 'maison.pratique',
    name: 'Maison Pratique',
    type: 'boutique',
    tagline: 'Électroménager et ustensiles',
    city: 'Ouagadougou',
    description: 'Tout pour une maison pratique.',
    verified: true,
    followers: 5200,
    rating: 4.6,
    reviewCount: 350,
  },
]

export const DEMO_PROS: readonly DemoPro[] = DEMO_SPECS.map(buildDemoPro)

// Aligne getProExtras / bridges Accueil-Explorer sur les extras curatés (ids forfaits).
for (const demo of DEMO_PROS) {
  registerProExtrasSeed(demo.service.id, demo.extras)
}

/** Établissement d'exemple par nom d'utilisateur public ou identifiant. */
export function findDemoPro(ref: string | undefined): DemoPro | undefined {
  if (!ref) return undefined
  return DEMO_PROS.find((p) => p.service.username === ref || p.service.id === ref)
}

/** Produit d'exemple (et son vendeur) par identifiant. */
export function findDemoProduct(
  productId: string | undefined,
): { item: CatalogItem; pro: DemoPro } | undefined {
  if (!productId) return undefined
  for (const pro of DEMO_PROS) {
    const item = pro.items.find((i) => i.id === productId)
    if (item) return { item, pro }
  }
  return undefined
}
