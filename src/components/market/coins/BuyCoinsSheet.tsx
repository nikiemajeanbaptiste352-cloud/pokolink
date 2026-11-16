import { BottomSheet } from '@/components/common/BottomSheet'
import type { CoinEvent } from '@/types/coin-market'

import { BuyCoinsForm } from './BuyCoinsForm'

interface BuyCoinsSheetProps {
  event: CoinEvent | null
  onClose: () => void
}

/** Feuille d'achat de coins, ouverte depuis le fil vidéo. */
export function BuyCoinsSheet({ event, onClose }: BuyCoinsSheetProps) {
  return (
    <BottomSheet
      open={event !== null}
      onClose={onClose}
      title="Participer · coins"
      subtitle={event ? `@${event.creatorHandle}` : undefined}
    >
      {event ? (
        <BuyCoinsForm key={event.id} event={event} onSent={onClose} />
      ) : null}
    </BottomSheet>
  )
}
