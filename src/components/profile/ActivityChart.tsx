import { Trophy } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { useProfileStats } from '@/hooks/use-profile-stats'
import { formatCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

type Range = '7j' | 'posts'

const RANGES: readonly { id: Range; label: string }[] = [
  { id: '7j', label: '7 derniers jours' },
  { id: 'posts', label: 'Par publication' },
]

const WIDTH = 320
const HEIGHT = 160
const PAD = { top: 16, right: 12, bottom: 28, left: 8 }

interface ActivityChartProps {
  /** @handle du profil (même source que ProfilePage). */
  handle?: string
}

/**
 * Activité du profil branchée sur les visites de la page publique et les
 * publications créées en privé (frontend only).
 */
export function ActivityChart({ handle }: ActivityChartProps) {
  const gradId = useId()
  const [range, setRange] = useState<Range>('7j')
  const { activity, postStats } = useProfileStats(handle)

  const maxViews = Math.max(...activity.map((point) => point.views), 1)
  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom

  const viewPoints = activity.map((point, index) => {
    const x = PAD.left + (index / Math.max(activity.length - 1, 1)) * innerW
    const y = PAD.top + innerH - (point.views / maxViews) * innerH
    return { x, y, ...point }
  })

  const linePath = (pts: readonly { x: number; y: number }[]) =>
    pts
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

  const areaPath = (pts: readonly { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    const first = pts[0]!
    const last = pts[pts.length - 1]!
    return `${linePath(pts)} L ${last.x} ${PAD.top + innerH} L ${first.x} ${PAD.top + innerH} Z`
  }

  const totalViews = activity.reduce((sum, point) => sum + point.views, 0)
  const maxPostViews = Math.max(...postStats.map((post) => post.views), 1)

  return (
    <section
      aria-labelledby="profile-activity-title"
      className="profile-panel mx-3 space-y-2.5 rounded-2xl border border-border/70 bg-card p-3.5 sm:mx-4 sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="profile-activity-title" className="text-[15px] font-extrabold tracking-tight">
            Activité
          </h2>
        </div>
        <Link
          to={paths.ranking}
          className={buttonVariants({
            size: 'sm',
            variant: 'secondary',
            className: 'shrink-0 gap-1.5',
          })}
        >
          <Trophy className="size-4" aria-hidden="true" />
          Classement
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Période"
          className="flex rounded-full bg-muted p-0.5"
        >
          {RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={range === item.id}
              onClick={() => setRange(item.id)}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full px-3 text-[11px] font-bold whitespace-nowrap transition-colors',
                range === item.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-caption">
        <p>
          <span
            className="mr-1.5 inline-block size-2 rounded-full bg-brand"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">Visites page </span>
          <strong className="tabular-nums">{formatCount(totalViews)}</strong>
        </p>
        <p>
          <span
            className="mr-1.5 inline-block size-2 rounded-full bg-info"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">Publications </span>
          <strong className="tabular-nums">{formatCount(postStats.length)}</strong>
        </p>
      </div>

      {range === '7j' ? (
        <div className="overflow-hidden">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-44 w-full"
            role="img"
            aria-label="Courbe des visites sur 7 jours"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = PAD.top + innerH * (1 - ratio)
              return (
                <line
                  key={ratio}
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="1"
                />
              )
            })}

            <path d={areaPath(viewPoints)} fill={`url(#${gradId})`} />
            <path
              d={linePath(viewPoints)}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {viewPoints.map((point) => (
              <circle
                key={`v-${point.label}-${point.x}`}
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="var(--brand)"
                stroke="var(--card)"
                strokeWidth="2"
              >
                <title>
                  {point.label} · {formatCount(point.views)} visites
                </title>
              </circle>
            ))}

            {viewPoints.map((point) => (
              <text
                key={`l-${point.label}-${point.x}`}
                x={point.x}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-semibold"
              >
                {point.label}
              </text>
            ))}
          </svg>
        </div>
      ) : postStats.length === 0 ? (
        <p className="py-6 text-center text-caption text-muted-foreground">
          Créez une publication : ses vues depuis la page publique apparaîtront ici.
        </p>
      ) : (
        <ul aria-label="Vues par publication" className="space-y-2.5 pt-1">
          {postStats.map((post) => {
            const width = `${Math.round((post.views / maxPostViews) * 100)}%`
            return (
              <li key={post.id} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-caption font-bold">
                    {post.title}
                  </span>
                  <span className="shrink-0 text-caption font-extrabold text-brand tabular-nums">
                    {formatCount(post.views)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand transition-[width]"
                    style={{ width }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="text-[11px] text-muted-foreground">
        Données locales : les totaux serveur remplaceront ce suivi démo.
      </p>
    </section>
  )
}
