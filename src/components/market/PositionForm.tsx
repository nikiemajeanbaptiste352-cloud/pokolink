import { TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { Field } from '@/components/form/Field'
import { Input } from '@/components/ui/input'
import { WalletPaymentForm } from '@/components/wallet/WalletPaymentForm'
import { useProfile } from '@/hooks/use-profile'
import { findCreator } from '@/lib/creators'
import { addEventParticipation } from '@/lib/event-participation-store'
import { addLocalMarketPosition } from '@/lib/market-positions-store'
import { splitName } from '@/lib/payment-labels'
import { cn } from '@/lib/utils'
import type { MarketPosition } from '@/types/market'

const OPTIONS = [
  {
    id: 'yes',
    label: 'OUI',
    description: 'Le facteur va monter',
    icon: TrendingUp,
    checked: 'peer-checked:border-primary peer-checked:bg-accent',
  },
  {
    id: 'no',
    label: 'NON',
    description: 'Le facteur va baisser',
    icon: TrendingDown,
    checked: 'peer-checked:border-danger peer-checked:bg-destructive/10',
  },
] as const satisfies readonly {
  id: MarketPosition
  label: string
  description: string
  icon: typeof TrendingUp
  checked: string
}[]

/**
 * Prise de position OUI / NON. Paiement Wallet démo → position locale
 * (« Mes positions ») + enregistrement participation.
 */
export function PositionForm({
  defaultPosition = 'yes',
  idPrefix = 'market',
  creatorHandle,
  marketId,
  entryCote,
  onSent,
}: {
  defaultPosition?: MarketPosition
  /** Préfixe des identifiants, pour éviter les doublons si le formulaire apparaît deux fois. */
  idPrefix?: string
  /** Créateur de l'événement, pour l'intitulé du paiement. */
  creatorHandle: string
  marketId: string
  /** Facteur au moment de l’entrée. */
  entryCote: number
  onSent?: () => void
}) {
  const profile = useProfile()
  const { firstName, lastName } = splitName(profile.name)
  const [position, setPosition] = useState<MarketPosition>(defaultPosition)
  const [amount, setAmount] = useState('500')
  const selected = OPTIONS.find((option) => option.id === position) ?? OPTIONS[0]
  const creator = findCreator(creatorHandle)
  // Mise saisie en FCFA entiers ; `null` tant qu'elle est vide ou nulle.
  const stake = Number(amount) > 0 ? Number(amount) : null

  return (
    <form onSubmit={(event) => event.preventDefault()} noValidate className="space-y-3">
      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold text-muted-foreground">
          Votre position
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <label key={option.id} className="relative flex">
                <input
                  type="radio"
                  name={`${idPrefix}-position`}
                  value={option.id}
                  checked={position === option.id}
                  onChange={() => setPosition(option.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 bg-card p-3 text-center transition-colors hover:bg-muted',
                    'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
                    option.checked,
                  )}
                >
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                  <span className="text-title font-extrabold">{option.label}</span>
                  <span className="text-caption text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div role="group" aria-label="Mise rapide" className="flex flex-wrap gap-2">
        {[200, 500, 1000, 2000].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={amount === String(n)}
            onClick={() => setAmount(String(n))}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-bold',
              amount === String(n)
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>

      <Field id={`${idPrefix}-amount`} label="Autre montant (FCFA)" optional>
        {(a11y) => (
          <Input
            {...a11y}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 750"
            value={amount}
            className="h-10"
            onChange={(event) =>
              setAmount(event.target.value.replace(/\D/g, '').slice(0, 7))
            }
          />
        )}
      </Field>

      <WalletPaymentForm
        // Changer de côté ou de montant repart d'un formulaire de paiement vierge.
        key={`${idPrefix}-${position}`}
        purpose="position"
        title={`Position ${selected.label} · @${creatorHandle}`}
        detail={selected.description}
        fees={0}
        payer={{ firstName, lastName }}
        beneficiary={{
          name: creator?.name ?? `@${creatorHandle}`,
          handle: creatorHandle,
          business: 'Creator Market',
          serviceId: marketId,
          ...(creator?.avatar ? { avatarSrc: creator.avatar } : {}),
        }}
        amount={stake}
        waitingLabel="Indiquez votre mise"
        actionLabel="Confirmer le paiement"
        onSent={() => {
          if (stake && stake > 0) {
            addLocalMarketPosition({
              marketId,
              side: position,
              stake,
              entryCote,
            })
            // eslint-disable-next-line react-hooks/purity -- horodatage au clic
            addEventParticipation(marketId, 'rsvp', Date.now(), 'factor')
          }
          onSent?.()
        }}
      />
    </form>
  )
}
