import { Handshake, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { useClientDebts } from '@/hooks/use-merchant-credits'
import { useProfile } from '@/hooks/use-profile'
import { formatPrice } from '@/lib/format'
import { clientCreditSummary } from '@/lib/merchant-credits-store'
import { paths } from '@/routes/paths'

const STATUS_LABEL = {
  open: 'Ouverte',
  partial: 'Partielle',
  settled: 'Soldée',
} as const

/** Espace client : une seule rubrique « Mes crédits ». */
export function MerchantCreditsPage() {
  const profile = useProfile()
  const debts = useClientDebts(profile.handle)
  const open = debts.filter((d) => d.balance > 0)
  const summary = clientCreditSummary(profile.handle)

  return (
    <>
      <PageHeader
        title="Mes crédits"
        leading={<BackLink to={paths.profile} label="Profil" history />}
      />
      <div className="page-body space-y-4 px-4 pb-8">
        <section
          aria-label="Synthèse"
          className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3.5 shadow-card"
        >
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Dettes restantes
            </p>
            <p className="text-title font-extrabold tabular-nums">
              {formatPrice(summary.totalBalance)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Boutiques
            </p>
            <p className="text-title font-extrabold">{summary.shopCount}</p>
          </div>
        </section>

        {open.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Aucune dette"
            description="Les achats à crédit confirmés apparaîtront ici, boutique par boutique."
            className="py-12"
          />
        ) : (
          <ul className="space-y-2">
            {open.map((debt) => (
              <li key={debt.id}>
                <Link
                  to={paths.merchantCreditDetail(debt.id)}
                  className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Store className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{debt.sellerName}</p>
                    <p className="text-caption text-muted-foreground">
                      {STATUS_LABEL[debt.status]} · @{debt.proRef}
                    </p>
                  </div>
                  <p className="shrink-0 font-extrabold tabular-nums text-brand">
                    {formatPrice(debt.balance)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
