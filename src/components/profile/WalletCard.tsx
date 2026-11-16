import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  History,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { PaymentConnectors } from '@/components/profile/PaymentConnectors'
import { formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

interface WalletCardProps {
  /** Solde en francs CFA (même source que la page Wallet). */
  balance: number
}

/**
 * Caisse profil compacte : solde, actions, connecteurs.
 */
export function WalletCard({ balance }: WalletCardProps) {
  const [hidden, setHidden] = useState(false)

  return (
    <section
      aria-label="Wallet AfriConnect"
      className="profile-panel mx-3 overflow-hidden rounded-2xl border border-border/70 bg-card sm:mx-4"
    >
      <div className="space-y-3.5 p-3.5 sm:p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            <Wallet className="size-5" aria-hidden="true" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-wide text-brand uppercase">
              Wallet
            </p>
            <p className="text-[12px] text-muted-foreground">Solde disponible</p>
          </div>
          <button
            type="button"
            aria-label={hidden ? 'Afficher le solde' : 'Masquer le solde'}
            aria-pressed={hidden}
            onClick={() => setHidden((v) => !v)}
            className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
          >
            {hidden ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <p className="text-[1.85rem] leading-none font-extrabold tracking-tight tabular-nums sm:text-[2.1rem]">
          {hidden ? '••••••' : formatPrice(balance).replace(/\s*FCFA$/, '')}
          <span className="ml-1.5 text-[0.8rem] font-bold tracking-wide text-muted-foreground">
            FCFA
          </span>
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Link
            to={paths.walletDeposit()}
            className="inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-brand px-1 text-[12px] font-bold text-brand-foreground"
          >
            <ArrowDownToLine className="size-4" aria-hidden="true" strokeWidth={2.5} />
            Déposer
          </Link>
          <Link
            to={paths.walletWithdrawal()}
            className="inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-muted px-1 text-[12px] font-bold text-foreground"
          >
            <ArrowUpFromLine className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Retirer
          </Link>
          <Link
            to={paths.walletTransfer}
            className="inline-flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-muted px-1 text-[12px] font-bold text-foreground"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" strokeWidth={2.25} />
            Envoyer
          </Link>
        </div>

        <Link
          to={paths.wallet}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold text-brand hover:bg-brand/5"
        >
          <History className="size-3.5" aria-hidden="true" />
          Historique Wallet
        </Link>

        <div className="border-t border-border/60 pt-3">
          <PaymentConnectors />
        </div>
      </div>
    </section>
  )
}
