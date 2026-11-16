import { Eye, EyeOff, Gift } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatPoints } from '@/lib/rewards-labels'
import { paths } from '@/routes/paths'
import type { RewardsBalances } from '@/types/rewards'

const HIDDEN = '•••••• pts'

/**
 * Solde Rewards : points disponibles et points en attente, tels que le serveur les fournit.
 * Les points ne sont ni retirables en FCFA ni convertibles en Mobile Money : le Wallet FCFA
 * reste un solde distinct.
 */
export function RewardsBalanceCard({ balances }: { balances: RewardsBalances }) {
  const [hidden, setHidden] = useState(false)
  const show = (value: number) => (hidden ? HIDDEN : formatPoints(value))

  return (
    <section
      aria-label="Solde Rewards"
      className="relative mx-4 overflow-hidden rounded-2xl bg-neutral-900 p-4 text-white"
    >
      <Gift
        aria-hidden="true"
        className="absolute -top-6 -right-6 size-28 text-gold opacity-25"
        strokeWidth={1.25}
      />
      <div className="relative space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-body opacity-90">Points disponibles</p>
            <button
              type="button"
              aria-label={hidden ? 'Afficher les points' : 'Masquer les points'}
              aria-pressed={hidden}
              onClick={() => setHidden((value) => !value)}
              className="-mr-2 grid size-11 place-items-center rounded-full hover:bg-white/15"
            >
              {hidden ? (
                <EyeOff className="size-5" aria-hidden="true" />
              ) : (
                <Eye className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="-mt-2 text-3xl font-extrabold text-gold tabular-nums">
            {show(balances.available)}
          </p>
        </div>

        <dl className="rounded-xl bg-white/12 p-3 text-body">
          <dt className="text-caption opacity-90">En attente</dt>
          <dd className="font-extrabold tabular-nums">{show(balances.pending)}</dd>
        </dl>

        <p className="text-caption opacity-90">
          Les points ne se retirent pas en FCFA. Votre argent reste dans le{' '}
          <Link to={paths.wallet} className="font-bold underline underline-offset-2">
            Wallet FCFA
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
