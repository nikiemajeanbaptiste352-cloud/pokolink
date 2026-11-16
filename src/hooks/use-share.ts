import { useCallback } from 'react'

import { useFlash } from '@/hooks/use-flash'
import { shareOrCopy } from '@/lib/share'

/** Bouton « Partager » d'une page : partage ou copie le lien et confirme par un message. */
export function useShare() {
  const { message, flash } = useFlash()
  const share = useCallback(
    async (path: string, title: string) => {
      const result = await shareOrCopy(`${window.location.origin}${path}`, title)
      if (result === 'copied') flash('Lien copié dans le presse-papiers.')
      else if (result === 'shared') flash('Lien partagé.')
      else if (result === 'failed')
        flash('Impossible de copier le lien sur cet appareil.')
    },
    [flash],
  )
  return { message, share }
}
