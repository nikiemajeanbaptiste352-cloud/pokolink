import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { WalletBalances } from '@/types/wallet'

const HIDDEN = '••••••'

/**
 * Soldes du Wallet : disponible, réservé et total, avec actions principales.
 */
export function BalanceCard({ balances }: { balances: WalletBalances }) {
  const [hidden, setHidden] = useState(false)
  const show = (value: number) =>
    hidden ? HIDDEN : formatPrice(value).replace(/\s*FCFA$/, '')

  return (
    <section
      aria-label="Soldes du Wallet"
      className="wallet-balance relative mx-3 overflow-hidden rounded-[1.5rem] text-brand-foreground sm:mx-4"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-brand" />
      <div aria-hidden="true" className="wallet-balance-mesh pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="wallet-balance-orb wallet-balance-orb-a" />
      <div aria-hidden="true" className="wallet-balance-orb wallet-balance-orb-b" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/10 via-transparent to-black/20"
      />

      <div className="relative space-y-5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <Wallet className="size-5" aria-hidden="true" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.18em] text-white/70 uppercase">
                AfriConnect
              </p>
              <p className="truncate text-[13px] font-semibold text-white/90">
                Wallet · Solde disponible
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label={hidden ? 'Afficher les soldes' : 'Masquer les soldes'}
            aria-pressed={hidden}
            onClick={() => setHidden((value) => !value)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition-colors hover:bg-white/18"
          >
            {hidden ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-[clamp(1.85rem,8.5vw,2.45rem)] leading-none font-black tracking-tight break-all tabular-nums">
            {show(balances.available)}
            <span className="ml-1.5 text-[0.9rem] font-extrabold tracking-wide text-white/75">
              FCFA
            </span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15 backdrop-blur-[2px]">
            <dt className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">
              Réservé
            </dt>
            <dd className="mt-1 text-[15px] font-extrabold tabular-nums">
              {show(balances.reserved)}
              <span className="ml-1 text-[11px] font-bold text-white/65">FCFA</span>
            </dd>
            <p className="mt-0.5 text-[11px] text-white/55">Retraits en cours</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-3 ring-1 ring-white/15 backdrop-blur-[2px]">
            <dt className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">
              Total
            </dt>
            <dd className="mt-1 text-[15px] font-extrabold tabular-nums">
              {show(balances.total)}
              <span className="ml-1 text-[11px] font-bold text-white/65">FCFA</span>
            </dd>
            <p className="mt-0.5 text-[11px] text-white/55">Comptable</p>
          </div>
        </dl>

        <div className="grid grid-cols-3 gap-2">
          <ActionLink
            to={paths.walletDeposit()}
            icon={ArrowDownToLine}
            label="Déposer"
            primary
          />
          <ActionLink
            to={paths.walletWithdrawal()}
            icon={ArrowUpFromLine}
            label="Retirer"
          />
          <ActionLink
            to={paths.walletTransfer}
            icon={ArrowLeftRight}
            label="Envoyer"
          />
        </div>
      </div>
    </section>
  )
}

function ActionLink({
  to,
  icon: Icon,
  label,
  primary,
}: {
  to: string
  icon: typeof ArrowDownToLine
  label: string
  primary?: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center transition-transform active:scale-[0.98]',
        primary
          ? 'bg-brand-foreground font-extrabold text-brand shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)]'
          : 'bg-white/12 font-bold text-white ring-1 ring-white/20 hover:bg-white/18',
      )}
    >
      <Icon className="size-5" aria-hidden="true" strokeWidth={2.25} />
      <span className="text-[12px] leading-none">{label}</span>
    </Link>
  )
}
