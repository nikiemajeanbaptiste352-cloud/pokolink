import { Handshake, Settings2, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceDebts } from '@/hooks/use-merchant-credits'
import { formatPrice } from '@/lib/format'
import { serviceCreditSummary } from '@/lib/merchant-credits-store'
import { paths } from '@/routes/paths'

const STATUS_LABEL = {
  open: 'Ouverte',
  partial: 'Partielle',
  settled: 'Soldée',
} as const

/** Espace Pro : une seule rubrique « Crédits clients ». */
export function ServiceCreditsPage() {
  const service = useCurrentService()
  const debts = useServiceDebts(service.id)
  const open = debts.filter((d) => d.balance > 0)
  const summary = serviceCreditSummary(service.id)

  return (
    <div className="space-y-4 px-4 py-4 pb-8">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-title font-extrabold">Crédits clients</h1>
          <p className="text-caption text-muted-foreground">
            Créances que vous avez accordées. AfriConnect ne finance pas les achats.
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            Établissement :{' '}
            <span className={service.allowMerchantCredit ? 'text-brand' : ''}>
              {service.allowMerchantCredit ? 'crédit activé' : 'crédit désactivé'}
            </span>
          </p>
        </div>
        <Link
          to={paths.serviceCreditConfig(service.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <Settings2 aria-hidden="true" />
          Configurer
        </Link>
      </header>

      <section
        aria-label="Synthèse"
        className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-3.5 shadow-card"
      >
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">
            À récupérer
          </p>
          <p className="text-title font-extrabold tabular-nums">
            {formatPrice(summary.totalBalance)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase">
            Débiteurs
          </p>
          <p className="text-title font-extrabold">{summary.debtorCount}</p>
        </div>
      </section>

      {open.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Aucun crédit client"
          description="Configurez le crédit (établissement + articles), puis validez un paiement partiel."
          action={
            <Link
              to={paths.serviceCreditConfig(service.id)}
              className={buttonVariants()}
            >
              <Settings2 aria-hidden="true" />
              Configuration du crédit
            </Link>
          }
          className="py-12"
        />
      ) : (
        <ul className="space-y-2">
          {open.map((debt) => (
            <li key={debt.id}>
              <Link
                to={paths.serviceCreditClient(service.id, debt.id)}
                className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-card"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <User className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{debt.clientName}</p>
                  <p className="text-caption text-muted-foreground">
                    @{debt.clientHandle} · {STATUS_LABEL[debt.status]}
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
  )
}
