import { useMemo, useState } from 'react'

import { FilterChips } from '@/components/common/FilterChips'
import { ColumnChart } from '@/components/charts/ColumnChart'
import { ProgressBar, StudioSection } from '@/components/studio/parts'
import { useStudioAdStats } from '@/hooks/use-studio-ads'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import {
  STUDIO_AD_PERIODS,
  type StudioAdPeriod,
} from '@/lib/studio-ads-labels'

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

function SeriesCard({
  title,
  items,
  barClass,
  money,
}: {
  title: string
  items: readonly { label: string; value: number }[]
  barClass: string
  money?: boolean
}) {
  const chartItems = useMemo(
    () =>
      items.map((item, index) => ({
        id: `${title}-${index}`,
        value: item.value,
        valueLabel: money ? formatCount(item.value) : formatCount(item.value),
        labels: [item.label],
        aria: `${item.label} : ${money ? formatPrice(item.value) : formatNumber(item.value)}`,
      })),
    [items, money, title],
  )

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-card">
      <h3 className="text-body font-extrabold">{title}</h3>
      <ColumnChart items={chartItems} barClass={barClass} columnRem={3.2} />
    </div>
  )
}

/**
 * Rubrique privée « Statistiques publicitaires » — performances commerciales des forfaits.
 */
export function StudioAdStatsTab() {
  const stats = useStudioAdStats()
  const [period, setPeriod] = useState<StudioAdPeriod>('30d')

  return (
    <div className="space-y-5">
      <StudioSection
        title="Statistiques publicitaires"
        description="Performances de vos forfaits et du parcours annonceurs."
      >
        <FilterChips
          label="Période"
          items={STUDIO_AD_PERIODS}
          value={period}
          onChange={setPeriod}
        />
        {period === 'custom' ? (
          <p className="rounded-xl bg-muted px-3 py-2 text-caption text-muted-foreground">
            Période personnalisée : disponible lorsque l’API fournira les bornes de dates.
            Affichage actuel = données de démonstration (30 jours).
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Kpi label="Consultations" value={formatCount(stats.planViews)} />
          <Kpi label="Intérêts uniques" value={formatCount(stats.uniqueInterests)} />
          <Kpi label="Demandes de devis" value={formatCount(stats.quoteRequests)} />
          <Kpi label="Commandes reçues" value={formatCount(stats.ordersReceived)} />
          <Kpi label="Acceptées" value={formatCount(stats.ordersAccepted)} />
          <Kpi label="Terminées" value={formatCount(stats.ordersCompleted)} />
          <Kpi
            label="Annulées / refusées"
            value={formatCount(stats.ordersCancelledOrRefused)}
          />
          <Kpi label="Revenus pub" value={formatPrice(stats.revenue)} />
          <Kpi label="Panier moyen" value={formatPrice(stats.averageOrderValue)} />
        </div>

        <div className="rounded-2xl border bg-card p-3.5 shadow-card">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Taux de conversion
          </p>
          <p className="mt-1 text-title font-extrabold tabular-nums">
            {(stats.conversionRate * 100).toFixed(1).replace('.', ',')} %
          </p>
          <ProgressBar
            className="mt-2"
            value={Math.round(stats.conversionRate * 1000)}
            max={1000}
            label="Taux de conversion"
          />
        </div>
      </StudioSection>

      <StudioSection title="Graphiques">
        <div className="space-y-3">
          <SeriesCard
            title="Évolution des commandes"
            items={stats.ordersSeries}
            barClass="bg-brand"
          />
          <SeriesCard
            title="Évolution des revenus"
            items={stats.revenueSeries}
            barClass="bg-gold"
            money
          />
          <SeriesCard
            title="Revenus par forfait"
            items={stats.revenueByPlan}
            barClass="bg-info"
            money
          />
          <SeriesCard
            title="Commandes par forfait"
            items={stats.ordersByPlan}
            barClass="bg-brand"
          />
          <SeriesCard
            title="Répartition par statut"
            items={stats.statusBreakdown}
            barClass="bg-muted-foreground"
          />
          <SeriesCard
            title="Parcours des annonceurs"
            items={stats.funnel}
            barClass="bg-primary"
          />
        </div>
      </StudioSection>
    </div>
  )
}
