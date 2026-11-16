import { ColumnChart } from '@/components/charts/ColumnChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { formatCount, formatNumber } from '@/lib/format'
import type { ProExtras } from '@/types/pro'

const DAY = 24 * 60 * 60 * 1000
const GROWTH_DAYS = 30
const MAX_POSTS = 8

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function startOfDay(ms: number): number {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/**
 * Statistiques du canal en graphiques : croissance des membres (courbe) et vues par
 * publication (histogramme). Les chiffres viennent des données reçues ; le serveur fournira
 * ses propres agrégats.
 */
export function ChannelStatsTab({
  data,
  now,
}: {
  data: Pick<ProExtras, 'members' | 'posts'>
  now: number
}) {
  const { members, posts } = data
  const published = posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
  const newThisWeek = members.filter(
    (member) => now - new Date(member.joinedAt).getTime() <= 7 * DAY,
  ).length
  const active = members.filter((member) => member.status === 'active').length
  const views = published.reduce((sum, post) => sum + post.views, 0)
  const reactions = published.reduce((sum, post) => sum + post.reactions, 0)

  // Total cumulé de membres à la fin de chacun des 30 derniers jours.
  const today = startOfDay(now)
  const growth = Array.from({ length: GROWTH_DAYS }, (_, index) => {
    const date = today - (GROWTH_DAYS - 1 - index) * DAY
    const end = date + DAY
    return {
      date,
      total: members.filter((member) => new Date(member.joinedAt).getTime() < end).length,
    }
  })

  const shown = published.slice(-MAX_POSTS)

  return (
    <section aria-label="Statistiques" className="space-y-4 px-4">
      <div className="space-y-1 rounded-2xl border bg-card p-4 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-body font-bold">Croissance des membres</h3>
          <p className="shrink-0 text-caption text-muted-foreground">
            {GROWTH_DAYS} derniers jours
          </p>
        </div>
        <TrendChart
          values={growth.map((point) => point.total)}
          labels={growth.map((point) => dayFormatter.format(point.date))}
          format={(value) => `${formatNumber(value)} membres`}
          colorClass="text-brand"
          summary="Courbe : nombre total de membres sur les 30 derniers jours. Flèches gauche et droite pour parcourir les jours."
        />
      </div>

      <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-card">
        <h3 className="text-body font-bold">Vues par publication</h3>
        {shown.length === 0 ? (
          <p className="py-6 text-center text-body text-muted-foreground">
            Aucune publication pour le moment.
          </p>
        ) : (
          <ColumnChart
            barClass="bg-info"
            columnRem={4.5}
            items={shown.map((post) => ({
              id: post.id,
              value: post.views,
              valueLabel: formatCount(post.views),
              labels: [post.title || 'Sans titre'],
              aria: `${post.title || 'Publication sans titre'} : ${formatNumber(post.views)} vues`,
            }))}
          />
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border bg-card p-4 text-body shadow-card sm:grid-cols-4">
        {[
          ['Membres', formatCount(members.length)],
          ['Actifs', formatCount(active)],
          ['Nouveaux (7 j)', `+${newThisWeek}`],
          ['Publications', String(published.length)],
          ['Brouillons', String(posts.length - published.length)],
          ['Vues', formatCount(views)],
          ['Réactions', formatCount(reactions)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <dt className="truncate text-muted-foreground">{label}</dt>
            <dd className="font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-caption text-muted-foreground">
        Le taux de lecture s’affichera lorsque le suivi des lectures sera disponible.
      </p>
    </section>
  )
}
