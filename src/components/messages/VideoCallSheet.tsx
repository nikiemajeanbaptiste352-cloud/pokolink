import { PhoneOff } from 'lucide-react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Button } from '@/components/ui/button'

/**
 * Appel vidéo : le service d'appel n'est pas connecté. La feuille le dit clairement et propose
 * d'écrire un message en attendant, plutôt qu'un bouton sans effet.
 */
export function VideoCallSheet({
  open,
  onClose,
  onWriteMessage,
}: {
  open: boolean
  onClose: () => void
  onWriteMessage: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Appel vidéo">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <PhoneOff className="size-7" aria-hidden="true" />
        </span>
        <p className="text-body font-bold">
          Les appels vidéo ne sont pas encore disponibles
        </p>
        <p className="text-body text-muted-foreground">
          Le service d’appel sera activé avec le serveur. En attendant, vous pouvez écrire
          un message à votre correspondant.
        </p>
      </div>
      <Button size="lg" className="w-full" onClick={onWriteMessage}>
        Écrire un message
      </Button>
    </BottomSheet>
  )
}
