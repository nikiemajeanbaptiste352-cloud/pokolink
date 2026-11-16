import { Eye, Users, Wallet, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'

import { ColumnChart } from '@/components/charts/ColumnChart'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { getCreatorCommission, getEventTitle, STUDIO_KINDS } from '@/lib/studio'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

type MetricId = 'views' | 'participants' | 'revenue'

interface Metric {
  label: string
  icon: LucideIcon
  /** Titre complet du graphique. */
  title: string
  /** Couleur des barres (graphique : contraste ≥ 3:1 avec le fond de la carte). */
  bar: string
  /** Valeur à tracer, `undefined` si indisponible. */
  read: (event: StudioEvent) => number | undefined
  /** Valeur courte (axe, légende). */
  short: (value: number) => string
  /** Valeur complète (lecteurs d'écran, total). */
  long: (value: number) => string
}

const METRICS: Record<MetricId, Metric> = {
  views: {
    label: 'Vues',
    icon: Eye,
    title: 'Vues validées par événement',
    bar: 'bg-brand',
    read: (event) =>
      event.stats && event.stats.views > 0 ? event.stats.views : undefined,
    short: formatCount,
    long: (value) => `${formatNumber(value)} vues validées`,
  },
  participants: {
    label: 'Participants',
    icon: Users,
    title: 'Participants par événement',
    bar: 'bg-info',
    read: (event) =>
      event.stats && event.stats.participants > 0
        ? event.stats.participants
        : undefined,
    short: formatCount,
    long: (value) => `${formatNumber(value)} participants`,
  },
  revenue: {
    label: 'Commission 2 %',
    icon: Wallet,
    title: 'Commission créateur (2 %) par événement',
    bar: 'bg-gold',
    read: (event) => getCreatorCommission(event) ?? undefined,
    short: formatCount,
    long: formatPrice,
  },
}

const METRIC_IDS = Object.keys(METRICS) as MetricId[]

/** Nombre d'événements tracés : les plus récents, pour que le graphique reste lisible. */
const MAX_POINTS = 8

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

/**
 * Graphique des vues, participants et commission créateur (2 % du volume) par événement.
 */
export function MetricChart({ events }: { events: readonly StudioEvent[] }) {
  const [metricId, setMetricId] = useState<MetricId>('views')
  const captionId = useId()
  const metric = METRICS[metricId]

  const points = [...events]
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(-MAX_POINTS)
    .map((event) => ({
      event,
      value: metric.read(event),
    }))

  const values = points.flatMap((point) =>
    point.value === undefined ? [] : [point.value],
  )
  const total = values.reduce((sum, value) => sum + value, 0)
  const top = points.reduce<(typeof points)[number] | undefined>(
    (best, point) =>
      point.value !== undefined && point.value > (best?.value ?? 0) ? point : best,
    undefined,
  )

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-card">
      <div
        role="group"
        aria-label="Mesure du graphique"
        className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1"
      >
        {METRIC_IDS.map((id) => {
          const { icon: Icon, label } = METRICS[id]
          const selected = id === metricId
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setMetricId(id)}
              className={cn(
                'inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 font-semibold transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-secondary-foreground hover:bg-background/60',
              )}
            >
              <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
              <span className="truncate text-caption sm:text-body">{label}</span>
            </button>
          )
        })}
      </div>

      <div id={captionId} className="space-y-0.5">
        <span className="block text-title font-extrabold">{metric.title}</span>
        <span className="block text-body text-muted-foreground">
          {values.length > 0
            ? `Total affiché : ${metric.long(total)}`
            : 'Aucune donnée pour cette mesure pour le moment.'}
        </span>
        {top && values.length > 1 ? (
          <span className="block text-body text-muted-foreground">
            Meilleur :{' '}
            <strong className="text-foreground">{metric.short(top.value ?? 0)}</strong> (
            {dayFormatter.format(top.event.startsAt)})
          </span>
        ) : null}
      </div>

      <div aria-labelledby={captionId} role="group">
        <ColumnChart
          barClass={metric.bar}
          items={points.map(({ event, value }) => ({
            id: event.id,
            value,
            valueLabel: value === undefined ? '' : metric.short(value),
            labels: [dayFormatter.format(event.startsAt), STUDIO_KINDS[event.kind].short],
            aria: `${getEventTitle(event)} : ${
              value === undefined ? 'pas de donnée' : metric.long(value)
            }`,
            to: paths.studioEvent(event.id),
          }))}
        />
      </div>
      {metricId === 'revenue' ? (
        <p className="text-caption text-muted-foreground">
          Commission créateur : 2 % du volume de chaque événement (FCFA). Du plus ancien
          au plus récent (8 au plus).
        </p>
      ) : (
        <p className="text-caption text-muted-foreground">
          Du plus ancien au plus récent (8 événements au plus). Touchez une colonne pour
          ouvrir l’événement.
        </p>
      )}
    </div>
  )
}
