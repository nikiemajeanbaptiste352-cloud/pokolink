import { Wallet, Zap } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { formatPrice } from '@/lib/format'
import type { ParticipationAction } from '@/lib/participation'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const PAY = 'var(--brand)'

interface ParticipationBarProps {
  action: ParticipationAction
  onAction: () => void
  /** Message court sous le bouton (ex. solde insuffisant). */
  notice?: string
  disabled?: boolean
  /** Libellés orientés paiement Wallet. */
  walletPay?: boolean
  className?: string
}

/**
 * Pied d’écran ancré : montant + CTA Payer / Participer (ne déborde pas de la page).
 */
export function ParticipationBar({
  action,
  onAction,
  notice,
  disabled = false,
  walletPay = false,
  className,
}: ParticipationBarProps) {
  const location = useLocation()
  const depositHref = `${paths.walletDeposit()}?retour=${encodeURIComponent(
    `${location.pathname}${location.search}`,
  )}`
  const ctaLabel =
    walletPay && (action.kind === 'enter' || action.kind === 'purchase')
      ? action.amount && action.amount > 0
        ? action.kind === 'purchase'
          ? 'Payer'
          : action.label.toLowerCase().includes('contribu')
            ? 'Contribuer'
            : 'Participer'
        : action.label
      : action.label

  return (
    <div
      className={cn(
        'shrink-0 border-t border-white/10 bg-[#111] px-3 py-2.5',
        className,
      )}
    >
      {action.kind === 'none' ? (
        <p
          role="status"
          className="rounded-xl bg-white/10 px-3 py-2.5 text-center text-[13px] font-semibold text-white"
        >
          {action.label}
        </p>
      ) : (
        <div className="flex items-center gap-2.5">
          {action.amount !== undefined && action.amountLabel ? (
            <p className="min-w-0 shrink-0">
              <span className="block text-[10px] font-semibold text-white/65 uppercase">
                {action.amountLabel}
              </span>
              <span
                className="block text-[1.05rem] leading-none font-extrabold tabular-nums"
                style={{ color: PAY }}
              >
                {formatPrice(action.amount)}
              </span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-4 text-[14px] font-extrabold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-45"
            style={{ background: PAY }}
          >
            {walletPay && (action.kind === 'purchase' || action.kind === 'enter') ? (
              <Wallet className="size-4.5 shrink-0" aria-hidden="true" />
            ) : action.kind === 'purchase' || action.kind === 'enter' ? (
              <Zap className="size-4.5 shrink-0 fill-current" aria-hidden="true" />
            ) : null}
            <span className="truncate">{ctaLabel}</span>
          </button>
        </div>
      )}
      <p
        role="status"
        className="mt-1.5 text-center text-[11px] leading-snug text-white/70 empty:hidden"
      >
        {notice}
        {notice?.includes('Approvisionnez') ? (
          <>
            {' '}
            <Link
              to={depositHref}
              className="font-bold text-gold underline underline-offset-2"
            >
              Recharger
            </Link>
          </>
        ) : null}
      </p>
    </div>
  )
}
