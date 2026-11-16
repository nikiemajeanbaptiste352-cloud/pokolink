import type { CSSProperties } from 'react'

import type { AccentId } from '@/types/service'

export const ACCENT_IDS = [
  'green',
  'blue',
  'red',
  'amber',
  'violet',
  'orange',
  'teal',
  'pink',
  'slate',
  'lime',
] as const

export interface AccentMeta {
  id: AccentId
  label: string
  /** Thème clair : fond de bouton avec texte blanc (contraste ≥ 4,5:1). */
  light: string
  /** Thème sombre : version éclairée, avec texte quasi noir. */
  dark: string
}

/**
 * Palette d'accents d'un établissement. Chaque teinte est assez sombre pour porter du
 * texte blanc en thème clair, et sa version éclairée porte du texte noir en thème sombre.
 */
export const ACCENTS: readonly AccentMeta[] = [
  { id: 'green', label: 'Vert', light: '#0b6b3a', dark: '#2fb36b' },
  { id: 'blue', label: 'Bleu', light: '#1d4ed8', dark: '#60a5fa' },
  { id: 'red', label: 'Rouge', light: '#c81e1e', dark: '#f87171' },
  { id: 'amber', label: 'Ambre', light: '#b45309', dark: '#fbbf24' },
  { id: 'violet', label: 'Violet', light: '#6d28d9', dark: '#a78bfa' },
  { id: 'orange', label: 'Orange', light: '#c2410c', dark: '#fb923c' },
  { id: 'teal', label: 'Turquoise', light: '#0e7490', dark: '#2dd4bf' },
  { id: 'pink', label: 'Rose', light: '#be185d', dark: '#f472b6' },
  { id: 'slate', label: 'Ardoise', light: '#334155', dark: '#94a3b8' },
  { id: 'lime', label: 'Olive', light: '#4d7c0f', dark: '#a3e635' },
]

export function getAccent(id: AccentId): AccentMeta {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0]!
}

/**
 * Variables CSS à poser sur un conteneur `.service-scope` : voir `globals.css`.
 * L'accent ne change que l'espace du service, jamais le reste de l'application.
 */
export function accentStyle(id: AccentId): CSSProperties {
  const accent = getAccent(id)
  return {
    '--service-accent': accent.light,
    '--service-accent-dark': accent.dark,
  } as CSSProperties
}
