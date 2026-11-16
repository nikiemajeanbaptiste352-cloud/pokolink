import { Handshake } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { useMerchantDebts } from '@/hooks/use-merchant-credits'
import { formatPrice } from '@/lib/format'
import { formatTicketDate, formatTicketTime } from '@/lib/ticket-labels'
import { findMerchantDebt } from '@/lib/merchant-credits-store'
import { paths } from '@/routes/paths'

/** Détail d’une dette client envers une boutique. */
export function MerchantCreditDetailPage() {
  const { debtId } = useParams()
  useMerchantDebts()
  const debt = findMerchantDebt(debtId)

  if (!debt) {
    return (
      <>
        <PageHeader
          title="Crédit"
          leading={<BackLink to={paths.merchantCredits} label="Mes crédits" history />}
        />
        <EmptyState
          icon={Handshake}
          title="Dette introuvable"
          description="Cette fiche crédit n’existe plus ou a été soldée."
          className="py-16"
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={debt.sellerName}
        leading={<BackLink to={paths.merchantCredits} label="Mes crédits" history />}
      />
      <div className="page-body space-y-4 px-4 pb-8">
        <section className="rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-caption text-muted-foreground">Solde restant</p>
          <p className="text-display font-extrabold tabular-nums text-brand">
            {formatPrice(debt.balance)}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-caption">
            <div>
              <dt className="text-muted-foreground">Achats à crédit</dt>
              <dd className="font-bold tabular-nums">{formatPrice(debt.principal)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Remboursé</dt>
              <dd className="font-bold tabular-nums">{formatPrice(debt.repaid)}</dd>
            </div>
          </dl>
        </section>

        <section aria-label="Historique" className="space-y-2">
          <h2 className="text-body font-extrabold">Historique</h2>
          <ul className="divide-y rounded-2xl border bg-card shadow-card">
            {debt.movements.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-3 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="font-bold">
                    {m.kind === 'sale' ? 'Achat à crédit' : 'Remboursement'}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {formatTicketDate(m.createdAt)} {formatTicketTime(m.createdAt)} ·{' '}
                    {m.reference}
                  </p>
                </div>
                <p
                  className={
                    m.kind === 'sale'
                      ? 'font-extrabold tabular-nums text-danger'
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
    </>
  )
}
