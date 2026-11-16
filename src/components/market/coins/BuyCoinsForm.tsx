import { useState } from 'react'

import { Field } from '@/components/form/Field'
import { Input } from '@/components/ui/input'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useProfile } from '@/hooks/use-profile'
import { addLocalCoinPosition } from '@/lib/coin-positions-store'
import { addEventParticipation } from '@/lib/event-participation-store'
import { formatPrice } from '@/lib/format'
import { splitName } from '@/lib/payment-labels'
import { cn } from '@/lib/utils'
import type { CoinEvent } from '@/types/coin-market'

import { formatCoins } from './coin-utils'

const QUICK = [1, 5, 10, 20] as const

/**
 * Achat de coins express : quantité en 1 tap, puis PIN Wallet.
 */
export function BuyCoinsForm({
  event,
  onSent,
}: {
  event: CoinEvent
  onSent?: () => void
}) {
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const [value, setValue] = useState('1')
  const remaining = event.maxCoins - event.soldCoins
  const quantity = value === '' ? null : Number(value)

  let error: string | undefined
  if (quantity !== null && quantity < 1) error = 'Indiquez au moins 1 coin'
  else if (quantity !== null && quantity > remaining)
    error = `Il ne reste que ${formatCoins(remaining)} coin${remaining > 1 ? 's' : ''}`

  const total = quantity !== null && !error ? quantity * event.coinPrice : null

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-3">
      <p className="text-[13px] text-muted-foreground">
        <strong className="text-foreground">{formatPrice(event.coinPrice)}</strong> / coin ·{' '}
        {formatCoins(remaining)} restant{remaining > 1 ? 's' : ''}
      </p>

      <div role="group" aria-label="Quantité rapide" className="flex flex-wrap gap-2">
        {QUICK.filter((n) => n <= remaining).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={quantity === n}
            onClick={() => setValue(String(n))}
            className={cn(
              'inline-flex h-10 min-w-12 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-colors',
              quantity === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <Field id={`coins-${event.id}`} label="Autre quantité" error={error} optional>
        {(a11y) => (
          <Input
            {...a11y}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 7"
            value={value}
            className="h-10"
            onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 5))}
          />
        )}
      </Field>

      <WalletPaymentForm
        purpose="coins"
        title={`Coins · @${event.creatorHandle}`}
        fees={0}
        payer={{ firstName, lastName }}
        {...(quantity !== null && total !== null
          ? {
              detail: `${formatCoins(quantity)} coin${quantity > 1 ? 's' : ''} × ${formatPrice(event.coinPrice)}`,
            }
          : {})}
        beneficiary={{
          name: event.creatorName,
          handle: event.creatorHandle,
          business: 'Creator Market',
          serviceId: event.id,
          ...(event.creatorAvatar ? { avatarSrc: event.creatorAvatar } : {}),
        }}
        {...(quantity !== null && total !== null
          ? { quantity, unitPrice: event.coinPrice }
          : {})}
        amount={total}
        waitingLabel="Choisissez une quantité"
        actionLabel="Confirmer le paiement"
        onSent={() => {
          if (quantity !== null && total !== null && quantity > 0) {
            addLocalCoinPosition({
              eventId: event.id,
              coins: quantity,
              spent: total,
              unitValue: event.coinValue || event.coinPrice,
            })
            // eslint-disable-next-line react-hooks/purity -- horodatage au clic
            addEventParticipation(event.id, 'rsvp', Date.now(), 'coins')
          }
          onSent?.()
        }}
      />
    </form>
  )
}
