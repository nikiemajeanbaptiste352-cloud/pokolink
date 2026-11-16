import { Check, Copy, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { TEMP_DEPOSIT_METHODS, TEMP_MERCHANT_NUMBER } from '@/lib/placeholder-wallet'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

interface MerchantDepositCardProps {
  className?: string
  /** Affiche le CTA « Déclarer mon dépôt » (page Wallet). */
  showDeclareCta?: boolean
}

/**
 * Numéro Mobile Money de dépôt AfriConnect : l’utilisateur transfère dehors,
 * puis déclare la transaction pour le rapprochement backend.
 */
export function MerchantDepositCard({
  className,
  showDeclareCta = false,
}: MerchantDepositCardProps) {
  const [copied, setCopied] = useState(false)
  const operator = TEMP_DEPOSIT_METHODS[0]?.label ?? 'Orange Money'
  const digits = TEMP_MERCHANT_NUMBER.replace(/\s/g, '')

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(digits)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      aria-label="Numéro de dépôt Mobile Money"
      className={cn(
        'mx-3 space-y-3 overflow-hidden rounded-[1.35rem] border border-gold/20 bg-card/95 p-3.5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] sm:mx-4 sm:p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-gold/25 to-gold/10 text-gold ring-1 ring-gold/25">
          <Smartphone className="size-5" aria-hidden="true" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
            Dépôt Mobile Money · {operator}
          </p>
          <p className="text-[13px] leading-snug text-muted-foreground">
            Transférez vers ce numéro, notez l’ID de transaction, puis déclarez
            votre dépôt dans l’app.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-muted/80 px-3 py-3 ring-1 ring-border/60">
        <p className="min-w-0 flex-1 font-mono text-[1.35rem] font-extrabold tracking-wide tabular-nums">
          {TEMP_MERCHANT_NUMBER}
        </p>
        <button
          type="button"
          onClick={copyNumber}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-3.5 text-[12px] font-bold text-brand-foreground shadow-sm transition-opacity hover:opacity-95"
          aria-label={copied ? 'Numéro copié' : 'Copier le numéro de dépôt'}
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>

      <ol className="grid gap-1.5 text-[12px] text-muted-foreground sm:grid-cols-3">
        <li className="rounded-xl bg-muted/50 px-2.5 py-2">
          <span className="font-bold text-foreground">1.</span> Envoyez l’argent
        </li>
        <li className="rounded-xl bg-muted/50 px-2.5 py-2">
          <span className="font-bold text-foreground">2.</span> Notez l’ID
        </li>
        <li className="rounded-xl bg-muted/50 px-2.5 py-2">
          <span className="font-bold text-foreground">3.</span> Déclarez ici
        </li>
      </ol>

      {showDeclareCta ? (
        <Link
          to={paths.walletDeposit()}
          className={buttonVariants({
            size: 'lg',
            className: 'w-full rounded-2xl font-bold',
          })}
        >
          Déclarer mon dépôt
        </Link>
      ) : null}
    </section>
  )
}
