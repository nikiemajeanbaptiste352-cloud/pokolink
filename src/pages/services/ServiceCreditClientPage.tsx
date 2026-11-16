import { Handshake } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useMerchantDebts } from '@/hooks/use-merchant-credits'
import { formatPrice } from '@/lib/format'
import { formatTicketDate, formatTicketTime } from '@/lib/ticket-labels'
import { findMerchantDebt } from '@/lib/merchant-credits-store'
import { paths } from '@/routes/paths'

/** Détail crédit d’un client pour l’établissement courant. */
export function ServiceCreditClientPage() {
  const service = useCurrentService()
  const { debtId } = useParams()
  useMerchantDebts()
  const debt = findMerchantDebt(debtId)

  if (!debt || debt.serviceId !== service.id) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          icon={Handshake}
          title="Client introuvable"
          description="Cette créance n’appartient pas à cet établissement."
          action={
            <Link
              to={paths.serviceCredits(service.id)}
              className={buttonVariants({ variant: 'outline' })}
            >
              Retour
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-4 pb-8">
      <header className="space-y-1">
        <Link
          to={paths.serviceCredits(service.id)}
          className="text-caption font-bold text-brand"
        >
          ← Crédits clients
        </Link>
        <h1 className="text-title font-extrabold">{debt.clientName}</h1>
        <p className="text-caption text-muted-foreground">@{debt.clientHandle}</p>
      </header>

      <section className="rounded-2xl border bg-card p-4 shadow-card">
        <p className="text-caption text-muted-foreground">Solde restant</p>
        <p className="text-display font-extrabold tabular-nums text-brand">
          {formatPrice(debt.balance)}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-caption">
          <div>
            <dt className="text-muted-foreground">Ventes à crédit</dt>
            <dd className="font-bold tabular-nums">{formatPrice(debt.principal)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Remboursements</dt>
            <dd className="font-bold tabular-nums">{formatPrice(debt.repaid)}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Historique" className="space-y-2">
        <h2 className="text-body font-extrabold">Historique des opérations</h2>
        <ul className="divide-y rounded-2xl border bg-card shadow-card">
          {debt.movements.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 px-3.5 py-3">
              <div className="min-w-0">
                <p className="font-bold">
                  {m.kind === 'sale' ? 'Achat à crédit' : 'Remboursement reçu'}
                </p>
                <p className="text-caption text-muted-foreground">
                  {formatTicketDate(m.createdAt)} {formatTicketTime(m.createdAt)} ·{' '}
                  {m.reference}
                </p>
              </div>
              <p
                className={
                  m.kind === 'sale'
                    ? 'font-extrabold tabular-nums text-brand'
                    : 'font-extrabold tabular-nums text-emerald-600'
                }
              >
                {m.kind === 'sale' ? '+' : '−'}
                {formatPrice(m.amount)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
