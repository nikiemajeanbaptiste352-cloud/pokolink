import {
  Armchair,
  BedDouble,
  Banknote,
  Bus,
  Car,
  CreditCard,
  Fuel,
  Hospital,
  Hotel,
  MapPin,
  Moon,
  Package,
  Pill,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Stethoscope,
  Store,
  Truck,
  UtensilsCrossed,
  Users,
  Waves,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type { Tone } from '@/lib/tones'
import type {
  PaymentMethodId,
  ServiceType,
  ServiceTypeMeta,
  TicketPaper,
} from '@/types/service'

/** Types d'activité proposés à la création d'un service. */
export const SERVICE_TYPES: readonly ServiceTypeMeta[] = [
  {
    id: 'boutique',
    label: 'Boutique',
    description: 'Vendre des produits',
    icon: Store,
    tone: 'gold',
    catalogLabel: 'Produits',
    itemLabel: 'Produit',
    categories: ['Téléphones', 'Vêtements', 'Boissons'],
    businessFields: [
      {
        id: 'products',
        label: 'Produits vendus',
        placeholder: 'Ex: Téléphones, vêtements, boissons…',
        icon: Package,
      },
      {
        id: 'deliveryZones',
        label: 'Zones de livraison',
        placeholder: 'Ex: Dakar Centre, banlieue…',
        icon: Truck,
      },
      {
        id: 'staffCount',
        label: 'Nombre de vendeurs',
        placeholder: 'Ex: 3',
        icon: Users,
        numeric: true,
      },
    ],
  },
  {
    id: 'pharmacie',
    label: 'Pharmacie',
    description: 'Médicaments et soins',
    icon: Pill,
    tone: 'brand',
    catalogLabel: 'Médicaments et soins',
    itemLabel: 'Produit',
    categories: ['Médicaments', 'Hygiène', 'Parapharmacie'],
    businessFields: [
      {
        id: 'license',
        label: 'Numéro d’agrément',
        placeholder: 'Ex: PH-2024-0123',
        icon: ShieldCheck,
      },
      {
        id: 'pharmacist',
        label: 'Pharmacien responsable',
        placeholder: 'Ex: Dr Awa Diop',
        icon: Stethoscope,
      },
      {
        id: 'onCall',
        label: 'Service de garde',
        placeholder: 'Ex: Nuits et week-ends',
        icon: Moon,
      },
    ],
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    description: 'Plats et boissons',
    icon: UtensilsCrossed,
    tone: 'red',
    catalogLabel: 'Menu',
    itemLabel: 'Plat',
    categories: ['Plats', 'Boissons', 'Desserts'],
    businessFields: [
      {
        id: 'cuisine',
        label: 'Type de cuisine',
        placeholder: 'Ex: Sénégalaise, grillades…',
        icon: UtensilsCrossed,
      },
      {
        id: 'seats',
        label: 'Nombre de places',
        placeholder: 'Ex: 40',
        icon: Armchair,
        numeric: true,
      },
      {
        id: 'serviceModes',
        label: 'Modes de service',
        placeholder: 'Ex: Sur place, à emporter, livraison',
        icon: Truck,
      },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    description: 'Trajets et billets',
    icon: Bus,
    tone: 'info',
    catalogLabel: 'Trajets et billets',
    itemLabel: 'Trajet',
    categories: ['Trajets', 'Billets'],
    businessFields: [
      {
        id: 'vehicleTypes',
        label: 'Types de véhicules',
        placeholder: 'Ex: Berline, Minibus, Camion…',
        icon: Car,
      },
      {
        id: 'zones',
        label: 'Zones desservies',
        placeholder: 'Ex: Dakar Centre, Aéroport…',
        icon: MapPin,
      },
      {
        id: 'drivers',
        label: 'Nombre de chauffeurs',
        placeholder: 'Ex: 5',
        icon: Users,
        numeric: true,
      },
    ],
  },
  {
    id: 'hopital',
    label: 'Hôpital',
    description: 'Consultations et examens',
    icon: Hospital,
    tone: 'violet',
    catalogLabel: 'Consultations et examens',
    itemLabel: 'Prestation',
    categories: ['Consultations', 'Examens'],
    businessFields: [
      {
        id: 'specialties',
        label: 'Spécialités',
        placeholder: 'Ex: Pédiatrie, radiologie…',
        icon: Stethoscope,
      },
      {
        id: 'beds',
        label: 'Nombre de lits',
        placeholder: 'Ex: 60',
        icon: BedDouble,
        numeric: true,
      },
      {
        id: 'emergency',
        label: 'Urgences',
        placeholder: 'Ex: 24h/24, 7j/7',
        icon: Moon,
      },
    ],
  },
  {
    id: 'station',
    label: 'Station-service',
    description: 'Carburant et boutique',
    icon: Fuel,
    tone: 'amber',
    catalogLabel: 'Carburants et produits',
    itemLabel: 'Produit',
    categories: ['Carburants', 'Lubrifiants', 'Boutique'],
    businessFields: [
      {
        id: 'fuels',
        label: 'Carburants disponibles',
        placeholder: 'Ex: Super, gasoil, gaz',
        icon: Fuel,
      },
      {
        id: 'pumps',
        label: 'Nombre de pompes',
        placeholder: 'Ex: 6',
        icon: Wrench,
        numeric: true,
      },
      {
        id: 'extras',
        label: 'Services annexes',
        placeholder: 'Ex: Boutique, lavage, gonflage',
        icon: Sparkles,
      },
    ],
  },
  {
    id: 'hotel',
    label: 'Hôtel',
    description: 'Chambres et services',
    icon: Hotel,
    tone: 'neutral',
    catalogLabel: 'Chambres et services',
    itemLabel: 'Chambre ou service',
    categories: ['Chambres', 'Restauration', 'Services'],
    businessFields: [
      {
        id: 'rooms',
        label: 'Nombre de chambres',
        placeholder: 'Ex: 24',
        icon: BedDouble,
        numeric: true,
      },
      {
        id: 'stars',
        label: 'Classement',
        placeholder: 'Ex: 3 étoiles',
        icon: Star,
      },
      {
        id: 'amenities',
        label: 'Équipements',
        placeholder: 'Ex: Wi-Fi, piscine, climatisation',
        icon: Sparkles,
      },
    ],
  },
]

const typeById = new Map(SERVICE_TYPES.map((meta) => [meta.id, meta]))

/** Retrouve les métadonnées d'un type (le type est toujours valide côté TypeScript). */
export function getServiceTypeMeta(type: ServiceType): ServiceTypeMeta {
  return typeById.get(type) ?? SERVICE_TYPES[0]!
}

export interface PaymentMethodMeta {
  id: PaymentMethodId
  label: string
  description: string
  icon: LucideIcon
  tone: Tone
}

/** Moyens de paiement qu'un établissement peut déclarer accepter. */
export const PAYMENT_METHODS: readonly PaymentMethodMeta[] = [
  {
    id: 'wallet',
    label: 'Wallet AfriConnect',
    description: 'Portefeuille AfriConnect',
    icon: Wallet,
    tone: 'brand',
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    description: 'Paiement mobile',
    icon: Smartphone,
    tone: 'amber',
  },
  {
    id: 'moov_money',
    label: 'Moov Money',
    description: 'Paiement mobile',
    icon: Smartphone,
    tone: 'info',
  },
  {
    id: 'wave',
    label: 'Wave',
    description: 'Paiement mobile',
    icon: Waves,
    tone: 'info',
  },
  {
    id: 'card',
    label: 'Carte bancaire',
    description: 'Visa, Mastercard',
    icon: CreditCard,
    tone: 'neutral',
  },
  {
    id: 'cash',
    label: 'Espèces',
    description: 'Paiement sur place',
    icon: Banknote,
    tone: 'gold',
  },
]

export const TICKET_PAPERS: readonly { id: TicketPaper; label: string }[] = [
  { id: '58mm', label: '58 mm (petit)' },
  { id: '80mm', label: '80 mm (standard)' },
]

/** Jours de la semaine, lundi en premier. */
export const WEEK_DAYS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const

/** Pays proposés à l'étape « Localisation ». */
export const COUNTRIES = [
  'Sénégal',
  'Côte d’Ivoire',
  'Mali',
  'Burkina Faso',
  'Bénin',
  'Togo',
  'Guinée',
  'Niger',
  'Cameroun',
  'Ghana',
  'Nigeria',
] as const
