import type { LucideIcon } from 'lucide-react'

import type { Tone } from '@/lib/tones'

export interface UserProfile {
  name: string
  handle: string
  verified?: boolean
  avatarSrc?: string
  bio: string
  city: string
  country: string
  /** Numéro de téléphone de contact (paiements Wallet, litiges). */
  phone?: string
  stats: {
    posts: number
    followers: number
    following: number
  }
}

/**
 * Outil personnel du compte (Wallet, Tickets, Historique…).
 * À ne pas confondre avec un « service » : un service est un établissement professionnel.
 */
export interface PersonalTool {
  id: string
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
  /** Écran que l'outil ouvre. */
  to: string
}
