import { Minus, Plus } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'

import { BottomSheet } from '@/components/common/BottomSheet'
import { PaymentFields, type PaymentMethod } from '@/components/events/PaymentFields'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'
import { getPhoneError } from '@/lib/payment'
import { cn } from '@/lib/utils'
import type { MarketEvent } from '@/types/event'

export type ContributionMode = 'enter' | 'purchase'

interface ContributionSheetProps {
  event: MarketEvent
  mode: ContributionMode | null
  onClose: () => void
}

/**
 * Feuille de participation (loterie : inscription, éventuellement payante ; réduction
 * collective : contribution, puis achat au prix final après la clôture). Interface seule :
 * montants, stock, inscription et paiement sont décidés par le serveur.
 */
export function ContributionSheet({ event, mode, onClose }: ContributionSheetProps) {
  const title =
    mode === 'purchase'
      ? event.offer
        ? 'Acheter maintenant'
        : 'Acheter au prix final'
      : event.lottery
        ? 'Participer à la loterie'
        : event.collective
          ? 'Contribuer à la réduction'
          : 'Participer'

  return (
    <BottomSheet
      open={mode !== null}
      onClose={onClose}
      title={title}
      subtitle={event.title}
    >
      {mode ? <SheetForm key={`${event.id}-${mode}`} event={event} mode={mode} /> : null}
    </BottomSheet>
  )
}

function SheetForm({ event, mode }: { event: MarketEvent; mode: ContributionMode }) {
  const uid = useId()
  const { lottery, collective, offer } = event
  const purchasingCollective = mode === 'purchase' && collective !== undefined
  const purchasingOffer = mode === 'purchase' && offer !== undefined && !collective
  const purchasing = purchasingCollective || purchasingOffer

  const unitAmount = purchasingCollective
    ? collective.currentPrice
    : purchasingOffer
      ? offer.eventPrice
      : (lottery?.entryFee ?? collective?.entryFee ?? offer?.eventPrice ?? 0)
  const maxQuantity = purchasingCollective
    ? Math.max(collective.stockLeft, 1)
    : purchasingOffer
      ? Math.max(offer.stockLeft, 1)
      : 1

  const [quantity, setQuantity] = useState(1)
  const [method, setMethod] = useState<PaymentMethod>('mobile-money')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [acceptError, setAcceptError] = useState('')
  const [notice, setNotice] = useState('')

  const total = unitAmount * quantity
  const paid = total > 0

  const intro = purchasingCollective
    ? `Le prix est arrêté : ${formatPrice(collective.currentPrice)} l’unité, dans la limite du stock (${collective.stockLeft} restant${collective.stockLeft > 1 ? 's' : ''}).`
    : purchasingOffer
      ? `Prix événement : ${formatPrice(offer.eventPrice)} · stock ${offer.stockLeft} restant${offer.stockLeft > 1 ? 's' : ''}. Simulation locale — aucun paiement réel.`
      : lottery
        ? paid
          ? 'Votre participation vous inscrit au tirage au sort. Elle ne garantit pas de gagner : les gagnants sont désignés par le serveur.'
          : 'Participation gratuite : aucune somme n’est demandée.'
        : collective
          ? 'Votre contribution fait baisser le prix pour tous les participants. Le prix final n’est connu qu’à la clôture.'
          : 'Simulation de participation. Aucune transaction réelle n’est effectuée.'

  const itemName = purchasingCollective
    ? collective.productName
    : purchasingOffer
      ? offer.productName
      : (lottery?.prizeName ?? collective?.productName ?? offer?.productName ?? event.title)

  function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault()
    const phoneIssue = paid && method === 'mobile-money' ? getPhoneError(phone) : ''
    const acceptIssue = accepted
      ? ''
      : 'Cochez la case pour confirmer avoir lu les règles.'
    setPhoneError(phoneIssue)
    setAcceptError(acceptIssue)
    if (phoneIssue || acceptIssue) {
      setNotice('')
      return
    }
    setNotice(
      paid
        ? 'Paiement indisponible dans cette démonstration : aucun prestataire n’est connecté. Aucune somme n’a été débitée.'
        : 'Inscription indisponible dans cette démonstration : elle sera enregistrée par le serveur avec le module Événements.',
    )
  }

  const acceptId = `${uid}-accept`
  const errorId = `${uid}-accept-error`

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="text-body text-muted-foreground">{intro}</p>

      <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-card">
        <div className="min-w-0">
          <p className="truncate text-body font-semibold">{itemName}</p>
          <p className="text-caption text-muted-foreground">
            {purchasing
              ? `${formatPrice(unitAmount)} l’unité`
              : paid
                ? 'Participation'
                : 'Gratuit'}
          </p>
        </div>
        {purchasing ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="grid size-11 place-items-center rounded-full border hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <output aria-label="Quantité" className="w-8 text-center text-body font-bold">
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              disabled={quantity >= maxQuantity}
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="grid size-11 place-items-center rounded-full border hover:bg-muted disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <p className="shrink-0 text-body font-extrabold text-brand tabular-nums">
            {paid ? formatPrice(total) : 'Gratuite'}
          </p>
        )}
      </div>

      {paid ? (
        <PaymentFields
          method={method}
          onMethodChange={setMethod}
          phone={phone}
          onPhoneChange={(value) => {
            setPhone(value)
            setPhoneError('')
          }}
          phoneError={phoneError}
        />
      ) : null}

      <div className="space-y-1">
        <label
          htmlFor={acceptId}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-muted p-3.5 text-body"
        >
          <input
            id={acceptId}
            type="checkbox"
            checked={accepted}
            aria-invalid={acceptError ? true : undefined}
            aria-describedby={acceptError ? errorId : undefined}
            onChange={(changeEvent) => {
              setAccepted(changeEvent.target.checked)
              setAcceptError('')
            }}
            className="mt-0.5 size-5 shrink-0 accent-primary"
          />
          <span>
            J’ai lu les règles de l’événement
            {purchasing
              ? ' et les conditions d’achat.'
              : ', y compris le financement et les conditions de remboursement.'}
          </span>
        </label>
        <p id={errorId} role="alert" className="text-caption text-danger empty:hidden">
          {acceptError}
        </p>
      </div>

      <dl className="space-y-1.5 rounded-xl bg-muted p-4 text-body">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {purchasing ? 'Sous-total' : 'Participation'}
          </dt>
          <dd className="font-semibold tabular-nums">
            {paid ? formatPrice(total) : 'Gratuite'}
          </dd>
        </div>
        {purchasing ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Livraison</dt>
            <dd className="font-semibold">Calculée par le serveur</dd>
          </div>
        ) : null}
      </dl>

      <div className="space-y-2">
        <Button type="submit" size="lg" className="w-full">
          {purchasing
            ? `Payer ${formatPrice(total)}`
            : paid
              ? `Payer ${formatPrice(total)} et participer`
              : 'Confirmer ma participation'}
        </Button>
        <p className="text-center text-caption text-muted-foreground">
          Montant indicatif : le prix, le stock, l’inscription et le paiement sont
          vérifiés par le serveur.
        </p>
        <p
          role="status"
          className={cn('rounded-xl bg-muted p-3.5 text-body empty:hidden')}
        >
          {notice}
        </p>
      </div>
    </form>
  )
}
