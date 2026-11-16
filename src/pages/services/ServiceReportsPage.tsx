import { ColumnChart } from '@/components/charts/ColumnChart'
import { RubriquePage } from '@/components/services/RubriquePage'
import { ActivityPanel } from '@/components/services/ActivityPanel'
import { useCurrentService } from '@/hooks/use-current-service'
import { useNow } from '@/hooks/use-now'
import { formatCount, formatNumber } from '@/lib/format'
import { getTempActivity } from '@/lib/placeholder-activity'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const
const WEEKS = 8

/**
 * Rapports d'UN établissement : courbe d'activité (visiteurs, revenus, commandes) sur 7, 30
 * ou 90 jours, et répartition des visiteurs par jour de la semaine.
 * Les chiffres sont des exemples tant que l'API ne les fournit pas.
 */
export function ServiceReportsPage() {
  const service = useCurrentService()
  const now = useNow(60_000)

  // Moyenne de visiteurs par jour de la semaine, sur les 8 dernières semaines.
  const days = getTempActivity(service.id, now, WEEKS * 7, 0)
  const byWeekday = WEEKDAYS.map((label, index) => {
    const weekday = (index + 1) % 7
    const matching = days.filter((day) => new Date(day.date).getDay() === weekday)
    const total = matching.reduce((sum, day) => sum + day.visitors, 0)
    return {
      label,
      average: matching.length === 0 ? 0 : Math.round(total / matching.length),
    }
  })

  return (
    <RubriquePage
      toolId="reports"
      subtitle={`Ventes et performances · ${service.name}`}
    >
      <div className="space-y-4 px-4">
        <ActivityPanel
          service={service}
          metrics={['visitors', 'revenue', 'orders']}
          ranges={[7, 30, 90]}
        />

        <div className="space-y-2 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.3)]">
          <h3 className="text-body font-bold tracking-tight">
            Visiteurs par jour de la semaine
          </h3>
          <p className="text-caption text-muted-foreground">
            Moyenne sur les {WEEKS} dernières semaines.
          </p>
          <ColumnChart
            barClass="bg-brand"
            columnRem={3}
            items={byWeekday.map((day) => ({
              id: day.label,
              value: day.average,
              valueLabel: formatCount(day.average),
              labels: [day.label],
              aria: `${day.label} : ${formatNumber(day.average)} visiteurs en moyenne`,
            }))}
          />
        </div>
      </div>
    </RubriquePage>
  )
}
