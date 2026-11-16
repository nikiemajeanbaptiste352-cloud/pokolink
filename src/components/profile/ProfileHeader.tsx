import { ExternalLink, MapPin, Pencil, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { formatCount } from '@/lib/format'
import { paths } from '@/routes/paths'
import type { UserProfile } from '@/types/profile'

interface ProfileHeaderProps {
  profile: UserProfile
  /** Stats live (publications locales, abonnés / suivis connectés). */
  liveStats?: { posts: number; followers: number; following: number }
}

/**
 * Hero profil pro : bandeau cover, identité, actions, stats en ligne.
 */
export function ProfileHeader({ profile, liveStats }: ProfileHeaderProps) {
  const { name, handle, verified, avatarSrc, bio, city, country, stats } = profile

  const place = [city, country].filter(Boolean).join(', ')
  const statItems = [
    { label: 'Posts', value: liveStats?.posts ?? stats.posts },
    { label: 'Abonnés', value: liveStats?.followers ?? stats.followers },
    { label: 'Suivis', value: liveStats?.following ?? stats.following },
  ]

  return (
    <section
      aria-label="Informations du profil"
      className="profile-hero profile-hero-card overflow-hidden border-b border-border/50 bg-card"
    >
      {/* Cover */}
      <div
        aria-hidden="true"
        className="profile-hero-cover relative h-[5.5rem] sm:h-[6.25rem]"
      />

      <div className="relative px-3 pb-4 sm:px-4">
        {/* Avatar chevauchant le cover */}
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-11">
          <Avatar
            name={name}
            src={avatarSrc}
            size="2xl"
            className="shrink-0 rounded-full ring-4 ring-card"
          />
          <div className="mb-1 flex shrink-0 gap-1.5">
            <Link
              to={paths.profileEdit}
              aria-label="Modifier le profil"
              className="grid size-9 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to={paths.profileQr}
              aria-label="Mon QR Code"
              className="grid size-9 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
            >
              <QrCode className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <h1 className="flex min-w-0 items-center gap-1.5 text-[1.35rem] leading-tight font-extrabold tracking-tight">
              <span className="truncate">{name}</span>
              {verified ? <VerifiedBadge className="size-4 shrink-0" /> : null}
            </h1>
            <p className="truncate text-[13px] font-semibold text-brand">@{handle}</p>
            {place ? (
              <p className="inline-flex max-w-full items-center gap-1 text-[12px] text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{place}</span>
              </p>
            ) : null}
          </div>

          {bio ? (
            <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/85">
              {bio}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              to={paths.creator(handle)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 text-[13px] font-bold text-brand-foreground min-[380px]:flex-none"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Page publique
            </Link>
            <Link
              to={paths.profileEdit}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-muted px-3 text-[13px] font-bold text-foreground min-[380px]:flex-none"
            >
              Modifier
            </Link>
          </div>

          <dl
            aria-label="Statistiques du profil"
            className="grid grid-cols-3 divide-x divide-border/70 border-t border-border/60 pt-3"
          >
            {statItems.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 px-1"
              >
                <dd className="text-[1.05rem] font-extrabold tracking-tight tabular-nums">
                  {formatCount(value)}
                </dd>
                <dt className="text-[11px] font-medium text-muted-foreground">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
