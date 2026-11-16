import { Download, Printer } from 'lucide-react'
import { useRef, useState } from 'react'

import { SubscriptionCardView } from '@/components/subscriptions/SubscriptionCardView'
import { Button } from '@/components/ui/button'
import { useCardPro } from '@/hooks/use-subscription-cards'
import { renderCardPng, saveBlob } from '@/lib/subscription-card-image'
import type { SubscriptionCard } from '@/types/subscription'

/**
 * Carte d'abonnement avec ses deux actions : télécharger l'image (PNG, avec le QR code) et
 * imprimer (la page n'imprime que la carte, voir `globals.css`).
 */
export function SubscriptionCardPanel({
  card,
  now,
}: {
  card: SubscriptionCard
  now: number
}) {
  const pro = useCardPro(card)
  const qrRef = useRef<HTMLCanvasElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function download() {
    setBusy(true)
    setMessage('')
    try {
      const blob = await renderCardPng({
        card,
        proName: pro.name,
        proDomain: pro.domain,
        qr: qrRef.current,
        now,
      })
      saveBlob(blob, `Carte-${card.number}.png`)
      setMessage('Carte téléchargée.')
    } catch {
      setMessage('Impossible de télécharger la carte. Réessayez ou imprimez-la.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <SubscriptionCardView card={card} pro={pro} now={now} qrRef={qrRef} printable />
      <div className="mx-auto grid max-w-sm gap-2">
        <Button type="button" size="lg" disabled={busy} onClick={() => void download()}>
          <Download aria-hidden="true" />
          {busy ? 'Préparation…' : 'Télécharger la carte'}
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          Imprimer / enregistrer en PDF
        </Button>
        <p
          role="status"
          className="text-center text-caption text-muted-foreground empty:hidden"
        >
          {message}
        </p>
      </div>
    </div>
  )
}
