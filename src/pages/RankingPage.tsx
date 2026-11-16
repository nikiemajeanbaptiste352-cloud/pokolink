import { Crown, Medal, Store, Trophy, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { PageHeader } from '@/components/common/PageHeader'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { formatCount } from '@/lib/format'
import {
  getCreatorRanking,
  getSellerRanking,
  type CreatorRank,
  type SellerRank,
} from '@/lib/placeholder-ranking'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

type Tab = 'creators' | 'sellers'
type CreatorSort = 'views' | 'participants'
type SellerSort = 'sales' | 'visitors'

type RankPerson = {
  rank: number
  handle: string
  name: string
  avatar?: string | undefined
  verified: boolean
  href: string
  primary: number
  primaryLabel: string
  secondary: number
  secondaryLabel: string
  subtitle?: string | undefined
}

const TABS: readonly { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'creators', label: 'Créateurs', icon: Users },
  { id: 'sellers', label: 'Vendeurs', icon: Store },
]

function toCreatorPerson(item: CreatorRank, sort: CreatorSort): RankPerson {
  return {
    rank: item.rank,
    handle: item.handle,
    name: item.name,
    avatar: item.avatar,
    verified: item.verified,
    href: paths.creator(item.handle),
    primary: sort === 'views' ? item.views : item.participants,
    primaryLabel: sort === 'views' ? 'vues' : 'participants',
    secondary: sort === 'views' ? item.participants : item.views,
    secondaryLabel: sort === 'views' ? 'participants' : 'vues',
  }
}

function toSellerPerson(item: SellerRank, sort: SellerSort): RankPerson {
  return {
    rank: item.rank,
    handle: item.handle,
    name: item.name,
    avatar: item.logo,
    verified: item.verified,
    href: paths.establishment(item.handle),
    primary: sort === 'sales' ? item.sales : item.visitors,
    primaryLabel: sort === 'sales' ? 'ventes' : 'visiteurs',
    secondary: sort === 'sales' ? item.visitors : item.sales,
    secondaryLabel: sort === 'sales' ? 'visiteurs' : 'ventes',
    subtitle: item.city || undefined,
  }
}

function podiumTone(rank: number) {
  if (rank === 1) {
    return {
      bar: 'from-gold/90 via-gold to-warning/80',
      ring: 'ring-gold/70',
      badge: 'bg-gold text-gold-foreground',
      height: 'h-28',
    }
  }
  if (rank === 2) {
    return {
      bar: 'from-muted-foreground/25 via-muted to-muted-foreground/10',
      ring: 'ring-muted-foreground/35',
      badge: 'bg-secondary text-secondary-foreground',
      height: 'h-20',
    }
  }
  return {
    bar: 'from-warning/35 via-warning/20 to-gold/15',
    ring: 'ring-warning/40',
    badge: 'bg-warning/20 text-warning',
    height: 'h-16',
  }
}

function PodiumSlot({ person }: { person: RankPerson }) {
  const tone = podiumTone(person.rank)
  return (
    <Link
      to={person.href}
      className={cn(
        'ranking-podium-slot group flex min-w-0 flex-1 flex-col items-center text-center',
        person.rank === 1 && 'ranking-podium-slot-1 z-10',
        person.rank === 2 && 'ranking-podium-slot-2',
        person.rank === 3 && 'ranking-podium-slot-3',
      )}
    >
      {person.rank === 1 ? (
        <Crown
          className="ranking-crown mb-1.5 size-5 text-gold"
          aria-hidden="true"
        />
      ) : (
        <span className="mb-1.5 block h-5" aria-hidden="true" />
      )}
      <span className="relative mb-2">
        <Avatar
          name={person.name}
          src={person.avatar}
          size={person.rank === 1 ? 'lg' : 'md'}
          className={cn('rounded-full ring-2 ring-offset-2 ring-offset-[#0a3d24]', tone.ring)}
        />
        <span
          className={cn(
            'absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full text-[11px] font-extrabold',
            tone.badge,
          )}
        >
          {person.rank === 1 ? (
            <Trophy className="size-3.5" aria-hidden="true" />
          ) : (
            person.rank
          )}
        </span>
      </span>
      <span className="flex max-w-full items-center justify-center gap-1 px-1">
        <span className="truncate text-caption font-extrabold text-white">
          {person.name}
        </span>
        {person.verified ? <VerifiedBadge tone="gold" className="size-3.5" /> : null}
      </span>
      <span className="mt-0.5 truncate text-[11px] text-white/65">@{person.handle}</span>
      <span className="mt-2 text-title font-extrabold text-gold tabular-nums">
        {formatCount(person.primary)}
      </span>
      <span className="text-[10px] tracking-wide text-white/55 uppercase">
        {person.primaryLabel}
      </span>
      <span
        className={cn(
          'mt-3 w-full rounded-t-2xl bg-linear-to-t',
          tone.bar,
          tone.height,
        )}
        aria-hidden="true"
      />
    </Link>
  )
}

function RankRow({ person, index }: { person: RankPerson; index: number }) {
  return (
    <Link
      to={person.href}
      className="ranking-row flex items-center gap-3 px-1 py-3 transition-colors hover:bg-accent/40"
      style={{ animationDelay: `${Math.min(index, 8) * 40 + 180}ms` }}
    >
      <span
        className={cn(
          'w-7 shrink-0 text-center text-body font-extrabold tabular-nums',
          person.rank <= 3 ? 'text-gold' : 'text-muted-foreground',
        )}
      >
        {person.rank}
      </span>
      <Avatar name={person.name} src={person.avatar} size="md" />
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-center gap-1">
          <span className="truncate text-body font-extrabold">{person.name}</span>
          {person.verified ? <VerifiedBadge className="size-3.5" /> : null}
        </span>
        <span className="block truncate text-caption text-muted-foreground">
          @{person.handle}
          {person.subtitle ? ` · ${person.subtitle}` : ''}
        </span>
      </span>
      <span className="shrink-0 space-y-0.5 text-right">
        <span className="block text-body font-extrabold text-brand tabular-nums">
          {formatCount(person.primary)}
        </span>
        <span className="block text-[11px] text-muted-foreground">
          {person.primaryLabel}
        </span>
        <span className="block text-caption tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">
            {formatCount(person.secondary)}
          </span>{' '}
          {person.secondaryLabel}
        </span>
      </span>
    </Link>
  )
}

function SortToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { id: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-xl border border-white/10 bg-black/20 p-0.5 backdrop-blur-sm"
    >
      {options.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-caption font-bold transition-colors',
            value === item.id
              ? 'bg-gold text-gold-foreground'
              : 'text-white/70 hover:text-white',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Classement AfriConnect : créateurs (vues / participants) et vendeurs
 * (ventes / visiteurs). Données d'exemple jusqu'à l'API.
 */
export function RankingPage() {
  const [tab, setTab] = useState<Tab>('creators')
  const [creatorSort, setCreatorSort] = useState<CreatorSort>('views')
  const [sellerSort, setSellerSort] = useState<SellerSort>('sales')

  const creators = useMemo(() => getCreatorRanking(creatorSort), [creatorSort])
  const sellers = useMemo(() => getSellerRanking(sellerSort), [sellerSort])

  const people =
    tab === 'creators'
      ? creators.map((item) => toCreatorPerson(item, creatorSort))
      : sellers.map((item) => toSellerPerson(item, sellerSort))

  const podium = people.slice(0, 3)
  const rest = people.slice(3)
  const orderedPodium = [podium[1], podium[0], podium[2]].filter(
    (item): item is RankPerson => Boolean(item),
  )

  return (
    <>
      <PageHeader
        title="Classement"
        leading={
          <BackLink
            to={paths.profile}
            label="Profil"
            history
            className="text-white hover:bg-white/10 hover:text-white"
          />
        }
        overlay
      />

      <div className="relative -mt-(--header-height) overflow-hidden pb-8">
        {/* Atmosphère premium : vert profond + or, motif discret */}
        <div
          className="relative px-4 pt-[calc(var(--header-height)+0.75rem)] pb-6 text-white"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% -10%, color-mix(in srgb, var(--gold) 28%, transparent), transparent 55%), linear-gradient(165deg, color-mix(in srgb, var(--brand) 92%, #04170c) 0%, #0a3d24 48%, #062818 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--gold) 55%, transparent) 0 1.2px, transparent 1.6px), radial-gradient(circle at 82% 68%, color-mix(in srgb, white 35%, transparent) 0 1px, transparent 1.4px)',
              backgroundSize: '22px 22px, 16px 16px',
            }}
            aria-hidden="true"
          />

          <div className="relative space-y-5">
            <div className="space-y-1.5 pt-1">
              <p className="inline-flex items-center gap-1.5 text-caption font-semibold tracking-[0.14em] text-gold uppercase">
                <Medal className="size-3.5" aria-hidden="true" />
                Elite AfriConnect
              </p>
              <h2 className="max-w-[16ch] text-headline font-extrabold tracking-tight text-white">
                Le sommet de la scène
              </h2>
              <p className="max-w-sm text-body text-white/70">
                Les créateurs qui marquent la scène.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Type de classement"
              className="flex gap-1 rounded-2xl border border-white/10 bg-black/25 p-1 backdrop-blur-sm"
            >
              {TABS.map((item) => {
                const Icon = item.icon
                const selected = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      'inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-body font-bold transition-colors',
                      selected
                        ? 'bg-white text-brand'
                        : 'text-white/70 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-2">
              <p className="text-caption text-white/55">
                {tab === 'creators' ? 'Influence & audience' : 'Commerce & trafic'}
              </p>
              {tab === 'creators' ? (
                <SortToggle
                  label="Trier les créateurs"
                  value={creatorSort}
                  onChange={setCreatorSort}
                  options={[
                    { id: 'views', label: 'Vues' },
                    { id: 'participants', label: 'Participants' },
                  ]}
                />
              ) : (
                <SortToggle
                  label="Trier les vendeurs"
                  value={sellerSort}
                  onChange={setSellerSort}
                  options={[
                    { id: 'sales', label: 'Ventes' },
                    { id: 'visitors', label: 'Visiteurs' },
                  ]}
                />
              )}
            </div>

            {orderedPodium.length > 0 ? (
              <div
                key={`${tab}-${tab === 'creators' ? creatorSort : sellerSort}`}
                className="flex items-end gap-2 pt-2"
                aria-label="Podium du top 3"
              >
                {orderedPodium.map((person) => (
                  <PodiumSlot key={person.handle} person={person} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <section
          aria-label={
            tab === 'creators' ? 'Classement des créateurs' : 'Classement des vendeurs'
          }
          className="space-y-1 px-4 pt-5"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-title font-extrabold">Suite du classement</h3>
            <p className="text-caption text-muted-foreground">
              {rest.length} profil{rest.length > 1 ? 's' : ''}
            </p>
          </div>

          {rest.length === 0 ? (
            <p className="py-8 text-center text-body text-muted-foreground">
              Pas encore d’autres profils dans ce classement.
            </p>
          ) : (
            <ol
              key={`list-${tab}-${tab === 'creators' ? creatorSort : sellerSort}`}
              className="ranking-row-stagger divide-y"
            >
              {rest.map((person, index) => (
                <li key={person.handle}>
                  <RankRow person={person} index={index} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
