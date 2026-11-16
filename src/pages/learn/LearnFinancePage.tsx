import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import {
  useOwnerCanalSubscription,
  useSellerEduSales,
} from '@/hooks/use-afrilearn-commerce'
import { useProfile } from '@/hooks/use-profile'
import { useWalletBalances, useWalletPayments } from '@/hooks/use-wallet'
import { sellerFinanceSummary } from '@/lib/afrilearn-commerce-store'
import { isAfriLearnWalletPayment } from '@/lib/afrilearn-wallet-payments'
import { formatPrice } from '@/lib/format'
import { formatTicketDate } from '@/lib/ticket-labels'
import { paths } from '@/routes/paths'

/** Suivi financier AfriLearn — renvoie au Wallet central. */
export function LearnFinancePage() {
  const profile = useProfile()
  const sub = useOwnerCanalSubscription(profile.handle)
  const sales = useSellerEduSales(profile.handle)
  const summary = sellerFinanceSummary(profile.handle)
  const { available } = useWalletBalances()
  const payments = useWalletPayments().filter(isAfriLearnWalletPayment)

  return (
    <>
      <PageHeader
        title="Suivi financier"
        leading={<BackLink to={paths.learnMine} label="Mon AfriLearn" history />}
      />
      <div className="space-y-5 px-4 pb-10">
        <section className="rounded-2xl border bg-card p-3.5 shadow-card">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">
            Solde Wallet AfriConnect
          </p>
          <p className="text-title font-extrabold tabular-nums">
            {formatPrice(available)}
          </p>
          <Link
            to={`${paths.wallet}?retour=${encodeURIComponent(paths.learnFinance)}`}
            className="text-[12px] font-bold text-brand"
          >
            Ouvrir le Wallet ›
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-body font-extrabold">Abonnements Canal Pro</h2>
          {sub ? (
            <div className="rounded-2xl border bg-card p-3.5 shadow-card">
              <p className="font-bold">{sub.planName}</p>
              <p className="text-caption text-muted-foreground">
                Payé {formatPrice(sub.amountPaid)} · {sub.status} · refs{' '}
                {sub.paymentRefs.join(', ')}
              </p>
              <p className="text-caption text-muted-foreground">
                Début {formatTicketDate(sub.startedAt)} · expire{' '}
                {formatTicketDate(sub.expiresAt)}
              </p>
            </div>
          ) : (
            <p className="text-caption text-muted-foreground">Aucun paiement d’abonnement.</p>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-body font-extrabold">Revenus des ventes</h2>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-card p-3.5 shadow-card">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                Brut
              </p>
              <p className="font-extrabold tabular-nums text-[13px]">
                {formatPrice(summary.salesTotal)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                Frais
              </p>
              <p className="font-extrabold tabular-nums text-[13px]">
                {formatPrice(summary.feesTotal)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">
                Net
              </p>
              <p className="font-extrabold tabular-nums text-[13px] text-brand">
                {formatPrice(summary.netTotal)}
              </p>
            </div>
          </div>
          <p className="text-caption text-muted-foreground">
            {sales.length} vente{sales.length > 1 ? 's' : ''} · commissions produits
            uniquement (pas sur Canal Pro).
          </p>
          <Link to={paths.learnEduSales} className="text-[12px] font-bold text-brand">
            Détail des ventes ›
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-body font-extrabold">Paiements Wallet (AfriLearn)</h2>
          {payments.length === 0 ? (
            <p className="text-caption text-muted-foreground">
              Aucun paiement Canal / produit encore enregistré sur cet appareil.
            </p>
          ) : (
            <ul className="divide-y rounded-2xl border bg-card shadow-card">
              {payments.slice(0, 8).map((p) => (
                <li key={p.id} className="px-3.5 py-3">
                  <p className="font-bold">{p.title}</p>
                  <p className="text-caption text-muted-foreground">
                    {formatPrice(p.amount)} · {p.purpose}
                    {p.provisionalReference ? ` · ${p.provisionalReference}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link
          to={`${paths.wallet}?retour=${encodeURIComponent(paths.learnFinance)}`}
          className={buttonVariants({ size: 'lg', className: 'w-full' })}
        >
          Ouvrir le Wallet AfriConnect
        </Link>
      </div>
    </>
  )
}
