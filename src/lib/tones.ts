/**
 * Teintes sémantiques réutilisables (catégories, bannières, visuels provisoires).
 * Toutes s'appuient sur les tokens de `globals.css` : elles suivent les thèmes clair et sombre.
 */
export type Tone = 'brand' | 'gold' | 'violet' | 'red' | 'amber' | 'info' | 'neutral'

/** Pastille douce : fond teinté + icône colorée. */
export const toneSoft: Record<Tone, string> = {
  brand: 'bg-brand/12 text-brand',
  gold: 'bg-gold/20 text-warning',
  violet: 'bg-violet/15 text-violet',
  red: 'bg-destructive/12 text-destructive',
  amber: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
  neutral: 'bg-muted text-muted-foreground',
}

/** Dégradé léger pour les visuels provisoires. */
export const toneGradient: Record<Tone, string> = {
  brand: 'from-brand/25 to-brand/5 text-brand',
  gold: 'from-gold/30 to-gold/5 text-warning',
  violet: 'from-violet/25 to-violet/5 text-violet',
  red: 'from-destructive/20 to-destructive/5 text-destructive',
  amber: 'from-warning/25 to-warning/5 text-warning',
  info: 'from-info/25 to-info/5 text-info',
  neutral: 'from-muted to-muted/40 text-muted-foreground',
}
