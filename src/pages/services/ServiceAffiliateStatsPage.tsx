import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { FilterChips } from '@/components/common/FilterChips'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import {
  useAffiliateProgram,
  useProgramMemberships,
  useVendorAffiliateStats,
} from '@/hooks/use-affiliate'
import { useCurrentService } from '@/hooks/use-current-service'
import { AFFILIATE_MEMBERSHIP_STATUS_LABEL } from '@/lib/affiliate-labels'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { paths } from '@/routes/paths'

type Period = 'today' | '7d' | '30d' | '90d' | 'custom'

const PERIODS: readonly { id: Period; label: string }[] = [
  { id: 'today', label: 'Aujourd’hui' },
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
  { id: '90d', label: '90 jours' },
  { id: 'custom', label: 'Personnalisé' },
]

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3.5 shadow-card">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-title font-extrabold tabular-nums">{value}</p>
    </div>
  )
}

/** Statistiques d’affiliation vendeur (Espace Pro). */
export function ServiceAffiliateStatsPage() {
  const service = useCurrentService()
  const { programId } = useParams()
  const program = useAffiliateProgram(service.id, programId)
  const stats = useVendorAffiliateStats(programId)
  const members = useProgramMemberships(programId)
  const [period, setPeriod] = useState<Period>('30d')

  const clicksChart = useMemo(
    () =>
      stats.clicksSeries.map((item, i) => ({
        id: `c-${i}`,
        value: item.value,
        valueLabel: formatCount(item.value),
        labels: [item.label],
        aria: `${item.label} : ${formatNumber(item.value)}`,
      })),
    [stats.clicksSeries],
  )

  const salesChart = useMemo(
    () =>
      stats.salesSeries.map((item, i) => ({
        id: `s-${i}`,
        value: item.value,
        valueLabel: formatCount(item.value),
        labels: [item.label],
        aria: `${item.label} : ${formatPrice(item.value)}`,
      })),
    [stats.salesSeries],
  )

  return (
    <RubriquePage
      toolId="affiliation"
      title="Statistiques d’affiliation"
      subtitle={
        program
          ? `${program.name} · ${service.name}`
          : `Affiliation · ${service.name}`
      }
      showProgress={false}
      action={
        <Link
          to={paths.serviceAffiliate(service.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Retour programme
        </Link>
      }
    >
      <div className="space-y-4 px-4">
        <FilterChips
          label="Période"
          items={PERIODS}
          value={period}
          onChange={setPeriod}
          className="px-0"
        />
        {period === 'custom' ? (
          <p className="rounded-xl bg-muted px-3 py-2 text-caption text-muted-foreground">
            Période personnalisée : disponible lorsque l’API fournira les bornes.
            Affichage actuel = données de démonstration.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Kpi label="Affiliés actifs" value={String(stats.activeAffiliates)} />
          <Kpi label="Clics" value={formatCount(stats.clicks)} />
          <Kpi label="Clients" value={formatCount(stats.customers)} />
          <Kpi label="Commandes" value={formatCount(stats.orders)} />
          <Kpi
            label="Paiements confirmés"
            value={formatCount(stats.confirmedPayments)}
          />
          <Kpi label="Ventes générées" value={formatPrice(stats.salesAmount)} />
          <Kpi
            label="Commissions affiliés"
            value={formatPrice(stats.affiliateCommissions)}
          />
          <Kpi
            label="Commissions AfriConnect"
            value={formatPrice(stats.platformCommissions)}
          />
          <Kpi label="Revenus nets vendeur" value={formatPrice(stats.vendorNet)} />
        </div>

        <div className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <h3 className="text-body font-extrabold">Évolution des clics</h3>
          <ColumnChart items={clicksChart} barClass="bg-primary" columnRem={3.2} />
        </div>
        <div className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-card">
          <h3 className="text-body font-extrabold">Évolution des ventes</h3>
          <ColumnChart items={salesChart} barClass="bg-brand" columnRem={3.2} />
        </div>

        <section className="space-y-2">
          <h3 className="text-body font-extrabold">Tableau des affiliés</h3>
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[36rem] text-left text-caption">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Affilié</th>
                  <th className="px-3 py-2 font-semibold">Clics</th>
                  <th className="px-3 py-2 font-semibold">Clients</th>
                  <th className="px-3 py-2 font-semibold">Commandes</th>
                  <th className="px-3 py-2 font-semibold">Ventes</th>
                  <th className="px-3 py-2 font-semibold">Commissions</th>
                  <th className="px-3 py-2 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2 font-semibold">{m.affiliateName}</td>
                    <td className="px-3 py-2 tabular-nums">{m.clicks}</td>
                    <td className="px-3 py-2 tabular-nums">{m.customers}</td>
                    <td className="px-3 py-2 tabular-nums">{m.orders}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPrice(m.salesAmount)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {formatPrice(m.commissionsAmount)}
                    </td>
                    <td className="px-3 py-2">
                      {AFFILIATE_MEMBERSHIP_STATUS_LABEL[m.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </RubriquePage>
  )
}
