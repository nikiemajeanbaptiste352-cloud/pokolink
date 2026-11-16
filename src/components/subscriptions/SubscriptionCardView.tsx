import { BadgeCheck, CircleCheck, CircleX, Clock } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import type { Ref } from 'react'

import { Avatar } from '@/components/common/Avatar'
import type { CardPro } from '@/hooks/use-subscription-cards'
import { formatPrice } from '@/lib/format'
import { PLAN_DURATION_LABEL } from '@/lib/pro-labels'
import {
  formatCardNumber,
  formatValidity,
  getCardStatus,
  SUBSCRIPTION_STATUS,
} from '@/lib/subscription-labels'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { SubscriptionCard } from '@/types/subscription'

interface SubscriptionCardViewProps {
  card: SubscriptionCard
  pro: CardPro
  /** Heure courante (ms) : une carte dont la fin est passée s'affiche « expirée ». */
  now: number
  /** Canvas du QR code, pour exporter la carte en image. */
  qrRef?: Ref<HTMLCanvasElement>
  /** Marque la carte comme la seule partie imprimée de la page (voir `globals.css`). */
  printable?: boolean
}

/** Adresse encodée dans le QR code : le scanner de l'Espace Pro de l'établissement. */
function getCardQrValue(card: SubscriptionCard): string {
  return `${window.location.origin}${paths.serviceScanner(card.serviceId, card.verificationCode)}`
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-sm text-[#4b5b52]">{label}</dt>
      <dd className={cn('min-w-0 text-right text-sm break-words', strong && 'font-bold')}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Carte d'abonnement : preuve numérique de la souscription à un forfait, avec son QR code.
 * Elle garde toujours un fond blanc (clair et sombre) pour rester lisible, scannable et
 * imprimable. Tant que le paiement n'est pas confirmé par le serveur, elle l'indique et son
 * QR code n'est pas valable.
 */
export function SubscriptionCardView({
  card,
  pro,
  now,
  qrRef,
  printable = false,
}: SubscriptionCardViewProps) {
  const status = getCardStatus(card, now)
  const meta = SUBSCRIPTION_STATUS[status]
  const StatusIcon = meta.valid
    ? CircleCheck
    : status === 'pending_payment'
      ? Clock
      : CircleX
  const bannerClass = meta.valid
    ? 'bg-[#e8f5ec] text-[#0b6b3a]'
    : status === 'pending_payment'
      ? 'bg-[#fff4d6] text-[#7a5200]'
      : 'bg-[#fdecec] text-[#9b1c1c]'

  return (
    <figure
      data-print-ticket={printable ? '' : undefined}
      className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border bg-white text-[#111814] shadow-card"
    >
      <figcaption className="sr-only">
        Carte d’abonnement {formatCardNumber(card.number)}, {meta.label}
      </figcaption>

      <div className="flex items-center justify-between gap-3 bg-[#0b6b3a] px-5 py-4 text-white">
        <span className="text-xl font-extrabold tracking-tight">AfriConnect</span>
        <span className="text-sm font-bold">Carte d’abonnement</span>
      </div>

      <div
        className={cn(
          'flex items-center gap-2 px-5 py-3 text-base font-extrabold',
          bannerClass,
        )}
      >
        <StatusIcon className="size-5 shrink-0" aria-hidden="true" />
        {meta.headline}
      </div>

      <div className="space-y-4 px-5 pt-4 pb-5">
        <div className="flex items-center gap-3">
          <Avatar name={pro.name} src={pro.logo} size="lg" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-base font-extrabold">
              <span className="min-w-0 break-words">{pro.name}</span>
              {pro.verified ? (
                <BadgeCheck
                  className="size-4.5 shrink-0 text-[#0b6b3a]"
                  aria-label="Service Pro vérifié"
                />
              ) : null}
            </p>
            {pro.domain ? <p className="text-sm text-[#4b5b52]">{pro.domain}</p> : null}
          </div>
        </div>

        <div className="rounded-2xl bg-[#f1f5f2] px-4 py-3">
          <p className="text-xs font-bold tracking-wide text-[#4b5b52] uppercase">
            Forfait
          </p>
          <p className="text-xl leading-tight font-extrabold break-words">
            {card.planName}
          </p>
          <p className="text-sm text-[#4b5b52]">
            {PLAN_DURATION_LABEL[card.planDuration]} · {formatPrice(card.price)}
          </p>
        </div>

        <dl className="divide-y divide-dashed divide-[#c3cec7] border-y border-dashed border-[#c3cec7]">
          <Row label="Titulaire" value={card.holderName} strong />
          <Row label="Validité" value={formatValidity(card)} />
          <Row label="Numéro" value={formatCardNumber(card.number)} strong />
          <Row label="Statut" value={meta.label.toUpperCase()} strong />
        </dl>

        {status === 'cancelled' || status === 'expired' ? (
          <p className="rounded-xl bg-[#fdecec] p-3 text-center text-sm font-semibold text-[#9b1c1c]">
            {status === 'expired'
              ? 'Abonnement expiré : ce QR code n’est plus valable.'
              : 'Carte annulée : ce QR code n’est plus valable.'}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <QRCodeCanvas
              ref={qrRef}
              value={getCardQrValue(card)}
              size={264}
              marginSize={0}
              style={{ width: 176, height: 176 }}
              className={cn(status === 'pending_payment' && 'opacity-40')}
              aria-label="QR code de la carte d’abonnement"
              role="img"
            />
            <p className="text-center text-xs text-[#4b5b52]">
              {status === 'pending_payment'
                ? 'Ce QR code ne sera valable qu’après la confirmation du paiement par le serveur.'
                : 'Le prestataire scanne ce QR code pour vérifier votre abonnement.'}
              <span className="mt-0.5 block font-mono font-bold tracking-wide text-[#111814]">
                {card.verificationCode}
              </span>
            </p>
          </div>
        )}
      </div>
    </figure>
  )
}
