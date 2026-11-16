import { CircleCheck, Hourglass, Pause, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { CoinEvent } from '@/types/coin-market'

/** Explique l'état de l'événement quand il demande une précision. Texte seul, sans calcul. */
export function CoinStateNotice({ event }: { event: CoinEvent }) {
  let icon = Hourglass
  let title = ''
  let text = ''
  let tone = 'bg-muted'

  switch (event.state) {
    case 'purchases_open':
      title = 'Achats ouverts'
      text = `Vous pouvez acheter des coins jusqu’au début. L’indice ne bouge pas avant. ${event.startLabel}.`
      break
    case 'purchases_closed':
      title = 'Tous les coins sont vendus'
      text = `Les achats sont fermés, mais l’événement attend son heure : l’indice ne commence à évoluer qu’au début. ${event.startLabel}.`
      break
    case 'closing':
      icon = TriangleAlert
      tone = 'bg-warning/20'
      title =
        event.closeReason === 'pool_exhausted'
          ? 'Pool épuisé : clôture en cours'
          : 'Clôture en cours'
      text =
        event.closeReason === 'pool_exhausted'
          ? 'Il ne reste plus de fonds : aucun retrait ne peut être payé. Vos coins et votre historique sont conservés ; les détenteurs restants seront traités selon les règles publiées.'
          : 'Les demandes en cours sont traitées. Plus aucun achat ni nouveau retrait.'
      break
    case 'closed':
      icon = CircleCheck
      title =
        event.settlement === 'done' ? 'Clôturé et réglé' : 'Clôturé : règlement en cours'
      text =
        event.settlement === 'done'
          ? 'Toutes les demandes ont été traitées. Le rapport final est conservé.'
          : 'Le mécanisme est arrêté. Certaines demandes ou certains droits restent à traiter.'
      break
    case 'suspended':
      icon = Pause
      tone = 'bg-warning/20'
      title = 'Événement suspendu'
      text = event.suspendedReason ?? 'Les opérations sont en pause.'
      break
    case 'running':
      return null
  }

  const Icon = icon
  return (
    <div role="status" className={cn('flex items-start gap-3 rounded-xl p-3.5', tone)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <p className="text-body font-bold">{title}</p>
        <p className="text-body">{text}</p>
      </div>
    </div>
  )
}
