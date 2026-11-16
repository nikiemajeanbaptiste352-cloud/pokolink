import { formatCount } from '@/lib/format'
import type { UserProfile } from '@/types/profile'

interface StatsRowProps {
  stats: UserProfile['stats']
}

/** Compteurs du profil en cartes KPI compactes (disposition type tableau de bord). */
export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    { label: 'Publications', value: stats.posts },
    { label: 'Abonnés', value: stats.followers },
    { label: 'Abonnements', value: stats.following },
  ]

  return (
    <dl aria-label="Statistiques du profil" className="grid grid-cols-3 gap-2 px-4 pb-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-0.5 rounded-2xl border bg-card px-2 py-3 shadow-sm"
        >
          <dd className="text-title font-extrabold tabular-nums">{formatCount(value)}</dd>
          <dt className="text-center text-[11px] leading-tight text-muted-foreground">
            {label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
