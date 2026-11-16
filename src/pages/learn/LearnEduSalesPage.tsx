import { HandCoins } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { useSellerEduSales } from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { sellerFinanceSummary } from '@/lib/afrilearn-commerce-store'
import { formatPrice } from '@/lib/format'
import { formatTicketDate } from '@/lib/ticket-labels'
import { paths } from '@/routes/paths'

/** Ventes produits éducatifs (séparées des abonnements Canal). */
export function LearnEduSalesPage() {
  const profile = useProfile()
  const sales = useSellerEduSales(profile.handle)
  const summary = sellerFinanceSummary(profile.handle)

  return (
    <>
      <PageHeader
        title="Mes ventes"
        leading={<BackLink to={paths.learnMine} label="Mon AfriLearn" history />}
      />
      <div className="space-y-4 px-4 pb-10">
        <section className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3.5 shadow-card">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Ventes
            </p>
            <p className="font-extrabold tabular-nums">{formatPrice(summary.salesTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Net vendeur
            </p>
            <p className="font-extrabold tabular-nums text-brand">
              {formatPrice(summary.netTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Commissions
            </p>
            <p className="font-extrabold tabular-nums">{formatPrice(summary.feesTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              Commandes
            </p>
            <p className="font-extrabold">{summary.salesCount}</p>
          </div>
        </section>

        <p className="text-caption text-muted-foreground">
          Les commissions produits ne s’appliquent pas aux abonnements Canal Pro.
          Le crédit Wallet vendeur est validé côté serveur.
        </p>

        {sales.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="Aucune vente"
            description="Les achats de vos produits publiés apparaîtront ici."
            className="py-10"
          />
        ) : (
          <ul className="divide-y rounded-2xl border bg-card shadow-card">
            {sales.map((s) => (
              <li key={s.id} className="px-3.5 py-3">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{s.productName}</p>
                    <p className="text-caption text-muted-foreground">
                      {formatTicketDate(s.createdAt)} · @{s.buyerHandle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-extrabold tabular-nums">{formatPrice(s.price)}</p>
                    <p className="text-[11px] text-brand tabular-nums">
                      net {formatPrice(s.sellerNet)}
                    </p>
                  </div>
                </div>
                {s.ticketId ? (
                  <Link
                    to={paths.ticket(s.ticketId)}
                    className="mt-1 inline-block text-[12px] font-bold text-brand"
                  >
                    Ticket ›
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
