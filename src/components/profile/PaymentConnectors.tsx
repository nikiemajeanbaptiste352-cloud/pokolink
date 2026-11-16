import { CreditCard, Smartphone, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TEMP_DEPOSIT_METHODS } from '@/lib/placeholder-wallet'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const CONNECTORS = [
  {
    id: 'orange-money',
    label: 'Orange Money',
    short: 'OM',
    tone: 'bg-[#ff7900] text-white',
    icon: Smartphone,
  },
  {
    id: 'moov-money',
    label: 'Moov Money',
    short: 'Moov',
    tone: 'bg-[#0066b3] text-white',
    icon: Smartphone,
  },
  {
    id: 'wave',
    label: 'Wave',
    short: 'Wave',
    tone: 'bg-[#1dc0ff] text-[#06202b]',
    icon: Waves,
  },
  {
    id: 'card',
    label: 'Carte',
    short: 'Visa',
    tone: 'bg-brand text-brand-foreground',
    icon: CreditCard,
  },
] as const

/**
 * Connecteurs de paiement : dépôt via Mobile Money (fond clair).
 * « Carte » reste visible mais désactivée tant qu’aucun parcours carte n’existe.
 */
export function PaymentConnectors({ className }: { className?: string }) {
  const active = new Set(TEMP_DEPOSIT_METHODS.map((m) => m.id))

  return (
    <section
      aria-label="Connecteurs de paiement"
      className={cn('space-y-2', className)}
    >
      <div className="flex items-end justify-between gap-2 px-0.5">
        <div>
          <h2 className="text-[13px] font-extrabold tracking-tight text-foreground">
            Moyens de dépôt
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Connecteurs Mobile Money
          </p>
        </div>
        <Link
          to={paths.walletDeposit()}
          className="text-[11px] font-bold text-brand underline-offset-2 hover:underline"
        >
          Voir tout
        </Link>
      </div>
      <ul className="grid grid-cols-4 gap-2">
        {CONNECTORS.map(({ id, label, short, tone, icon: Icon }) => {
          const enabled = active.has(id)
          return (
            <li key={id}>
              {enabled ? (
                <Link
                  to={`${paths.walletDeposit()}?methode=${encodeURIComponent(id)}`}
                  aria-label={`Déposer via ${label}`}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-background p-2.5 ring-1 ring-brand/12 transition-transform active:scale-[0.97]"
                >
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-lg text-[11px] font-black tracking-tight',
                      tone,
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" strokeWidth={2.25} />
                  </span>
                  <span className="truncate text-[10px] font-bold text-foreground/85">
                    {short}
                  </span>
                </Link>
              ) : (
                <span
                  aria-label={`${label} — bientôt`}
                  title="Bientôt disponible"
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-background p-2.5 opacity-45 ring-1 ring-border/70"
                >
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-lg text-[11px] font-black tracking-tight',
                      tone,
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" strokeWidth={2.25} />
                  </span>
                  <span className="truncate text-[10px] font-bold text-foreground/85">
                    {short}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
