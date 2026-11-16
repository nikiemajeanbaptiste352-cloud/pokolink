/**
 * DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu de la page Explorer.
 * À remplacer par les données réelles de l'API (TanStack Query).
 */
import {
  Bus,
  CarTaxiFront,
  Building2,
  Droplets,
  Ellipsis,
  Flame,
  Fuel,
  GraduationCap,
  HeartPulse,
  Landmark,
  Package,
  RadioTower,
  ShoppingCart,
  Store,
  Truck,
  UtensilsCrossed,
  Zap,
} from 'lucide-react'

import { paths } from '@/routes/paths'
import type {
  Banner,
  Category,
  Product,
  Restaurant,
  ServiceProvider,
  Shop,
} from '@/types/explore'

export const TEMP_BANNERS: readonly Banner[] = [
  {
    id: 'b1',
    title: 'Déplacez-vous facilement',
    description: 'Réservez vos trajets en quelques clics.',
    cta: 'Réserver maintenant',
    to: paths.explore,
    tone: 'brand',
    icon: Bus,
  },
  {
    id: 'b2',
    title: 'Faites le plein sans attendre',
    description: 'Choisissez votre station et payez avec votre Wallet.',
    cta: 'Trouver une station',
    to: paths.explore,
    tone: 'violet',
    icon: Fuel,
  },
  {
    id: 'b3',
    title: 'Services près de vous',
    description: 'Restaurants, transport, santé : payez avec votre Wallet.',
    cta: 'Découvrir',
    to: paths.explore,
    tone: 'gold',
    icon: UtensilsCrossed,
  },
]

/** Catégories marketplace : produits + services, scannables en grille. */
export const TEMP_CATEGORIES: readonly Category[] = [
  {
    id: 'produits',
    label: 'Produits',
    icon: Package,
    tone: 'violet',
    target: { section: 'products' },
  },
  {
    id: 'boutiques',
    label: 'Boutiques',
    icon: Store,
    tone: 'gold',
    target: { section: 'pro', types: ['boutique'] },
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: UtensilsCrossed,
    tone: 'red',
    target: { section: 'pro', types: ['restaurant'] },
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: Bus,
    tone: 'brand',
    target: { section: 'pro', types: ['transport'] },
  },
  {
    id: 'carburant',
    label: 'Carburant',
    icon: Fuel,
    tone: 'amber',
    target: { section: 'pro', types: ['station'] },
  },
  {
    id: 'sante',
    label: 'Santé',
    icon: HeartPulse,
    tone: 'info',
    target: { section: 'pro', types: ['pharmacie', 'hopital'] },
  },
  {
    id: 'hotels',
    label: 'Hôtels',
    icon: Building2,
    tone: 'violet',
    target: { section: 'pro', types: ['hotel'] },
  },
  {
    id: 'pharmacies',
    label: 'Pharmacies',
    icon: Droplets,
    tone: 'brand',
    target: { section: 'pro', types: ['pharmacie'] },
  },
]

export const TEMP_DAILY_SERVICES: readonly Category[] = [
  { id: 'banques', label: 'Banques', icon: Landmark, tone: 'violet' },
  { id: 'livraison', label: 'Livraison', icon: Truck, tone: 'gold' },
  { id: 'taxi', label: 'Taxi', icon: CarTaxiFront, tone: 'amber' },
  { id: 'hotels', label: 'Hôtels', icon: Building2, tone: 'info' },
  { id: 'supermarches', label: 'Supermarchés', icon: ShoppingCart, tone: 'brand' },
  { id: 'ecoles', label: 'Écoles', icon: GraduationCap, tone: 'red' },
  { id: 'plus', label: 'Plus', icon: Ellipsis, tone: 'neutral' },
]

export const TEMP_PRODUCTS: readonly Product[] = [
  {
    id: 'pr1',
    name: 'Smartphone Pro 128 Go',
    price: 650000,
    seller: 'Boutique Alpha',
    sellerVerified: true,
    rating: 4.8,
  },
  {
    id: 'pr2',
    name: 'Montre connectée M6',
    price: 25000,
    seller: 'TechStore',
    sellerVerified: true,
    rating: 4.6,
  },
  {
    id: 'pr3',
    name: 'Écouteurs sans fil',
    price: 18000,
    seller: 'AudioPro',
    sellerVerified: true,
    rating: 4.7,
  },
  {
    id: 'pr4',
    name: 'Baskets de sport',
    price: 55000,
    seller: 'Sneakers House',
    rating: 4.5,
  },
  {
    id: 'pr5',
    name: "Parfum d'intérieur",
    price: 35000,
    seller: 'Beauty Center',
    sellerVerified: true,
    rating: 4.4,
  },
]

export const TEMP_SERVICES: readonly ServiceProvider[] = [
  {
    id: 'sv1',
    proRef: 'transport.urbain',
    name: 'Transport urbain',
    category: 'Transport',
    icon: Bus,
    tone: 'brand',
    rating: 4.3,
    reviews: 1200,
    verified: true,
  },
  {
    id: 'sv2',
    proRef: 'gaz.domestique',
    name: 'Gaz domestique',
    category: 'Énergie',
    icon: Flame,
    tone: 'amber',
    rating: 4.6,
    reviews: 850,
    verified: true,
  },
  {
    id: 'sv3',
    proRef: 'electricite',
    name: 'Électricité',
    category: 'Énergie',
    icon: Zap,
    tone: 'gold',
    rating: 4.2,
    reviews: 1000,
    verified: true,
  },
  {
    id: 'sv4',
    proRef: 'eau.potable',
    name: 'Eau potable',
    category: 'Services publics',
    icon: Droplets,
    tone: 'info',
    rating: 4.1,
    reviews: 680,
    verified: true,
  },
  {
    id: 'sv5',
    proRef: 'telecommunications',
    name: 'Télécommunications',
    category: 'Télécoms',
    icon: RadioTower,
    tone: 'red',
    rating: 4.4,
    reviews: 2300,
  },
]

export const TEMP_SHOPS: readonly Shop[] = [
  {
    id: 'sh1',
    proRef: 'techstore',
    name: 'TechStore',
    followers: 12500,
    products: 452,
    rating: 4.7,
    verified: true,
  },
  {
    id: 'sh2',
    proRef: 'fashion.house',
    name: 'Fashion House',
    followers: 8700,
    products: 312,
    rating: 4.6,
    verified: true,
  },
  {
    id: 'sh3',
    proRef: 'good.food',
    name: 'Good Food',
    followers: 6200,
    products: 180,
    rating: 4.8,
    verified: true,
  },
  {
    id: 'sh4',
    proRef: 'home.deco',
    name: 'Home Deco',
    followers: 5100,
    products: 210,
    rating: 4.5,
  },
]

export const TEMP_RESTAURANTS: readonly Restaurant[] = [
  {
    id: 'rs1',
    proRef: 'le.gourmet',
    name: 'Le Gourmet',
    distanceKm: 1.2,
    eta: '25-35 min',
    open: true,
    rating: 4.6,
  },
  {
    id: 'rs2',
    proRef: 'pizza.house',
    name: 'Pizza House',
    distanceKm: 1.8,
    eta: '30-40 min',
    open: true,
    rating: 4.4,
  },
  {
    id: 'rs3',
    proRef: 'chez.alima',
    name: 'Chez Alima',
    distanceKm: 2.1,
    eta: '25-35 min',
    open: false,
    rating: 4.7,
  },
  {
    id: 'rs4',
    proRef: 'wend.panga',
    name: 'Wend Panga',
    distanceKm: 2.5,
    eta: '20-30 min',
    open: true,
    rating: 4.5,
  },
]
