import type { ReactNode } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'

interface PublicProfileHeaderProps {
  name: string
  handle: string
  avatar?: string | undefined
  verified?: boolean
  /** Ligne secondaire : rôle, ville… */
  subtitle?: string | undefined
  bio?: string | undefined
  stats: readonly { label: string; value: string }[]
  /** Boutons d'action (abonnement, message, partage…). */
  actions: ReactNode
}

/** En-tête d'un profil public (créateur, membre AfriLearn) : identité, chiffres et actions. */
export function PublicProfileHeader({
  name,
  handle,
  avatar,
  verified,
  subtitle,
  bio,
  stats,
  actions,
}: PublicProfileHeaderProps) {
  return (
    <section aria-label={`Profil de ${name}`} className="space-y-4 px-4 pt-5 pb-4">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={avatar} size="2xl" />
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-headline font-extrabold">
            <span className="min-w-0 truncate">{name}</span>
            {verified ? <VerifiedBadge /> : null}
          </h2>
          <p className="truncate text-body text-muted-foreground">@{handle}</p>
          {subtitle ? (
            <p className="truncate text-caption text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {bio ? <p className="text-body break-words">{bio}</p> : null}

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-xl bg-muted px-2 py-2.5 text-center"
          >
            <dd className="truncate text-body font-extrabold">{stat.value}</dd>
            <dt className="truncate text-caption text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">{actions}</div>
    </section>
  )
}
