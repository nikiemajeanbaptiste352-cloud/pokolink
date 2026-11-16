import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DetailsToggleProps {
  /** `true` : les informations sont masquées, il ne reste que la vidéo et ses compteurs. */
  clean: boolean
  onToggle: () => void
}

const shadow = { textShadow: '0 1px 3px rgb(0 0 0 / 0.6)' }

/**
 * Bouton « Détails » des fils Cotes et Coins : un appui masque les informations
 * superposées (textes, cote, boutons de prise de position) ; un second appui les réaffiche.
 * À placer dans la colonne d'actions (ses enfants s'empilent).
 */
export function DetailsToggle({ clean, onToggle }: DetailsToggleProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={clean}
        aria-label={clean ? 'Afficher les informations' : 'Masquer les informations'}
        className={cn(
          'grid size-12 place-items-center rounded-full transition-colors',
          clean
            ? 'bg-white text-black hover:bg-white/90'
            : 'bg-black/50 text-white hover:bg-black/65',
        )}
      >
        <Info className="size-6" aria-hidden="true" />
      </button>
      <span
        className="-mt-2 text-caption font-semibold"
        style={shadow}
        aria-hidden="true"
      >
        Détails
      </span>
    </>
  )
}
