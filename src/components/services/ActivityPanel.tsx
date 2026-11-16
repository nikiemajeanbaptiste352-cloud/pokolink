import { ClipboardList, Eye, Wallet, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { TrendChart } from '@/components/charts/TrendChart'
import { useNow } from '@/hooks/use-now'
import { useServiceItems } from '@/hooks/use-services'
import { formatCount, formatNumber, formatPrice } from '@/lib/format'
import { getTempActivity, type ActivityDay } from '@/lib/placeholder-activity'
import type { Service } from '@/types/service'

export type ActivityMetricId = 'visitors' | 'revenue' | 'orders'

interface MetricMeta {
  label: string
  icon: LucideIcon
  /** Couleur de la courbe (`text-*`). */
  color: string
  read: (day: ActivityDay) => number
  /** Total court affiché dans le bouton. */
  short: (value: number) => string
  /** Valeur complète (info-bulle, lecteurs d'écran). */
  long: (value: number) => string
}

const METRICS: Record<ActivityMetricId, MetricMeta> = {
  visitors: {
    label: 'Visiteurs',
    icon: Eye,
    color: 'text-brand',
    read: (day) => day.visitors,
    short: formatCount,
    long: (value) => `${formatNumber(value)} visiteurs`,
  },
  revenue: {
    label: 'Revenus',
    icon: Wallet,
    color: 'text-info',
    read: (day) => day.revenue,
    short: formatCount,
    long: formatPrice,
  },
  orders: {
    label: 'Commandes',
    icon: ClipboardList,
    color: 'text-violet',
    read: (day) => day.orders,
    short: formatCount,
    long: (value) => `${formatNumber(value)} commandes`,
  },
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

interface ActivityPanelProps {
  service: Service
  /** Mesures proposées (une courbe à la fois). */
  metrics?: readonly ActivityMetricId[]
  /** Périodes proposées, en jours. */
  ranges?: readonly number[]
  /** `hero` : grande courbe pour le tableau de bord. */
  size?: 'default' | 'hero'
}

/** « +12 % » ou « −5 % » par rapport à la période précédente (« — » sans base). */
function formatDelta(current: number, previous: number): string {
  if (previous <= 0) return '—'
  const delta = Math.round(((current - previous) / previous) * 100)
  return `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta)} %`
}

/**
 * Courbe d'activité d'UN établissement : visiteurs, revenus (et commandes). Chaque mesure est
 * un bouton qui affiche son total et son évolution ; la courbe suit la mesure choisie.
 * Les chiffres sont des exemples tant que l'API ne les fournit pas.
 */
export function ActivityPanel({
  service,
  metrics = ['visitors', 'revenue'],
  ranges = [7, 30],
  size = 'default',
}: ActivityPanelProps) {
  const items = useServiceItems(service.id)
  const now = useNow(60_000)
  const [metricId, setMetricId] = useState<ActivityMetricId>(metrics[0] ?? 'visitors')
  const [range, setRange] = useState<number>(ranges[0] ?? 7)
  const metric = METRICS[metricId]
  const hero = size === 'hero'

  const averageBasket = useMemo(() => {
    const prices = items.map((item) => item.price).filter((price) => price > 0)
    return prices.reduce((sum, price) => sum + price, 0) / (prices.length || 1)
  }, [items])

  // Deux périodes : la précédente sert uniquement à calculer l'évolution.
  const days = useMemo(
    () => getTempActivity(service.id, now, range * 2, averageBasket),
    [service.id, now, range, averageBasket],
  )
  const current = days.slice(range)
  const previous = days.slice(0, range)
  const sum = (list: readonly ActivityDay[], id: ActivityMetricId) =>
    list.reduce((total, day) => total + METRICS[id].read(day), 0)

  return (
    <div
      className={
        hero
          ? 'space-y-4 rounded-[1.35rem] border border-border/70 bg-card/95 p-3 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.4)] sm:space-y-5 sm:p-5'
          : 'space-y-4 rounded-[1.35rem] border border-border/70 bg-card/95 p-3 shadow-[0_12px_36px_-24px_rgba(15,23,42,0.35)] sm:p-4'
      }
    >
      <div
        role="group"
        aria-label="Mesure de la courbe"
        className={`grid ${metrics.length > 2 ? 'grid-cols-3 gap-1.5 sm:gap-2' : 'grid-cols-2 gap-2'}`}
      >
        {metrics.map((id) => {
          const { label, icon: Icon, short } = METRICS[id]
          const total = sum(current, id)
          const delta = formatDelta(total, sum(previous, id))
          const selected = id === metricId
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setMetricId(id)}
              className={`min-w-0 rounded-2xl border text-left transition-all duration-200 ${
                hero ? 'p-3 sm:p-3.5' : 'p-2.5 sm:p-3'
              } ${
                selected
                  ? 'border-primary/40 bg-primary/10 shadow-sm'
                  : 'border-border/50 bg-muted/50 hover:bg-muted'
              }`}
            >
              <span
                className={`flex items-center gap-1.5 font-semibold text-muted-foreground ${metrics.length > 2 ? 'text-[11px] tracking-tight sm:text-caption sm:tracking-normal' : 'text-caption'}`}
              >
                <Icon className="hidden size-3.5 shrink-0 sm:block" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </span>
              <span
                className={`block truncate font-extrabold ${
                  hero
                    ? 'text-title leading-8 sm:text-[1.35rem]'
                    : metrics.length > 2
                      ? 'text-body leading-7 sm:text-title'
                      : 'text-title leading-7'
                }`}
              >
                {short(total)}
              </span>
              <span className="block truncate text-caption text-muted-foreground">
                {id === 'revenue' ? (
                  <span className={metrics.length > 2 ? 'hidden sm:inline' : undefined}>
                    FCFA ·{' '}
                  </span>
                ) : null}
                {delta}{' '}
                <span className="sr-only">par rapport à la période précédente</span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        role="group"
        aria-label="Période"
        className="flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <p className="truncate text-body font-extrabold tracking-tight sm:text-title">
            {metric.label}
          </p>
          {hero ? (
            <p className="truncate text-[11px] text-muted-foreground">
              Activité de l’établissement · {range} derniers jours
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1 rounded-xl border border-border/60 bg-muted/60 p-1">
          {ranges.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={value === range}
              onClick={() => setRange(value)}
              className={`inline-flex h-9 min-w-11 items-center justify-center rounded-lg px-3 text-caption font-bold transition-colors ${
                value === range
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-secondary-foreground hover:bg-background/70'
              }`}
            >
              {value} j
            </button>
          ))}
        </div>
      </div>

      <TrendChart
        key={`${metricId}-${range}`}
        values={current.map((day) => metric.read(day))}
        labels={current.map((day) => dayFormatter.format(day.date))}
        format={metric.long}
        colorClass={metric.color}
        plotHeight={hero ? 'h-56 sm:h-72 md:h-80' : 'h-40 sm:h-52'}
        summary={`Courbe : ${metric.label.toLowerCase()} des ${range} derniers jours. Flèches gauche et droite pour parcourir les jours.`}
      />
    </div>
  )
}
