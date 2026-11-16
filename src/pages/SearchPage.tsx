import { Compass, GraduationCap, Search, TrendingUp, type LucideIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { useServices } from '@/hooks/use-services'
import { listCreators } from '@/lib/creators'
import { DEMO_PROS } from '@/lib/directory'
import { formatPrice } from '@/lib/format'
import { TEMP_COIN_EVENTS } from '@/lib/placeholder-coin-markets'
import { TEMP_LEARN_LEVELS, listTempMembers } from '@/lib/placeholder-learn'
import { TEMP_MARKETS } from '@/lib/placeholder-markets'
import { paths } from '@/routes/paths'

const MAX_PER_SECTION = 5

interface Result {
  id: string
  title: string
  subtitle: string
  to: string
  avatar?: { name: string; src?: string | undefined }
  verified?: boolean
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matches(needle: string, ...fields: (string | undefined)[]): boolean {
  return fields.some((field) => field && normalize(field).includes(needle))
}

const SHORTCUTS: readonly { to: string; label: string; icon: LucideIcon }[] = [
  { to: paths.explore, label: 'Explorer', icon: Compass },
  { to: paths.markets, label: 'Creator Market', icon: TrendingUp },
  { to: paths.learn, label: 'AfriLearn', icon: GraduationCap },
]

/** Recherche globale : établissements, produits, créateurs, événements et AfriLearn. */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const needle = normalize(query.trim())
  const { services } = useServices()

  const sections = useMemo(() => {
    if (!needle) return []
    const list: { title: string; results: Result[] }[] = []

    const ownPros: Result[] = services
      .filter((s) => s.status === 'active')
      .filter((s) => matches(needle, s.name, s.username))
      .map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: `@${s.username || s.id}`,
        to: paths.establishment(s.username || s.id),
        avatar: { name: s.name, src: s.logo || undefined },
      }))
    const demoPros: Result[] = DEMO_PROS.filter((p) =>
      matches(needle, p.service.name, p.service.username, p.tagline),
    ).map((p) => ({
      id: p.service.id,
      title: p.service.name,
      subtitle: p.tagline,
      to: paths.establishment(p.service.username),
      avatar: { name: p.service.name, src: p.service.logo || undefined },
      verified: p.verified,
    }))
    list.push({ title: 'Établissements', results: [...ownPros, ...demoPros] })

    const products: Result[] = []
    for (const pro of DEMO_PROS) {
      for (const item of pro.items) {
        if (matches(needle, item.name, item.category, item.description)) {
          products.push({
            id: item.id,
            title: item.name,
            subtitle: `${formatPrice(item.price)} · ${pro.service.name}`,
            to: paths.product(item.id),
            avatar: { name: item.name, src: item.image || undefined },
          })
        }
      }
    }
    list.push({ title: 'Produits et services', results: products })

    list.push({
      title: 'Créateurs',
      results: listCreators()
        .filter((c) => matches(needle, c.name, c.handle, c.bio))
        .map((c) => ({
          id: c.handle,
          title: c.name,
          subtitle: `@${c.handle}`,
          to: paths.creator(c.handle),
          avatar: { name: c.name, src: c.avatar },
          verified: c.verified,
        })),
    })

    list.push({
      title: 'Événements Creator Market',
      results: [
        ...TEMP_MARKETS.filter((m) =>
          matches(needle, m.caption, m.title, m.creatorName, m.creatorHandle),
        ).map((m) => ({
          id: m.id,
          title: m.caption,
          subtitle: `Cote · @${m.creatorHandle}`,
          to: paths.marketEvent(m.id),
        })),
        ...TEMP_COIN_EVENTS.filter((e) =>
          matches(needle, e.caption, e.creatorName, e.creatorHandle),
        ).map((e) => ({
          id: e.id,
          title: e.caption,
          subtitle: `Coins · @${e.creatorHandle}`,
          to: paths.coinEvent(e.id),
        })),
      ],
    })

    list.push({
      title: 'AfriLearn',
      results: [
        ...TEMP_LEARN_LEVELS.filter((l) => matches(needle, l.name, l.category)).map(
          (l) => ({
            id: `level-${l.id}`,
            title: l.name,
            subtitle: `Niveau · ${l.category}`,
            to: paths.learnFeed(l.id),
          }),
        ),
        ...listTempMembers()
          .filter((m) => matches(needle, m.name, m.handle))
          .map((m) => ({
            id: `member-${m.handle}`,
            title: m.name,
            subtitle: `Membre · @${m.handle}`,
            to: paths.learnMember(m.handle),
            avatar: { name: m.name, src: m.avatarSrc },
          })),
      ],
    })

    return list.filter((section) => section.results.length > 0)
  }, [needle, services])

  return (
    <>
      <PageHeader
        title="Recherche"
        leading={<BackLink to={paths.home} label="Accueil" history />}
      />

      <div className="px-4 py-3">
        <SearchField
          label="Rechercher dans AfriConnect"
          placeholder="Établissement, produit, créateur, niveau…"
          value={query}
          autoFocus
          onChange={(event) => {
            const value = event.target.value
            setSearchParams(value ? { q: value } : {}, { replace: true })
          }}
        />
      </div>

      {!needle ? (
        <section aria-label="Raccourcis" className="space-y-2 px-4 pb-4">
          <p className="text-caption font-bold text-muted-foreground">Où chercher ?</p>
          <ul className="grid grid-cols-3 gap-2">
            {SHORTCUTS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border bg-card p-2 text-center text-caption font-bold hover:bg-muted"
                >
                  <Icon className="size-5 text-brand" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={Search}
          tone="info"
          title="Aucun résultat"
          description={`Rien ne correspond à « ${query.trim()} ». Essayez un autre mot.`}
        />
      ) : (
        <div className="space-y-4 pb-4" role="status" aria-live="polite">
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="px-4 pb-1 text-caption font-bold text-muted-foreground">
                {section.title}
              </h2>
              <ul className="divide-y">
                {section.results.slice(0, MAX_PER_SECTION).map((result) => (
                  <li key={result.id}>
                    <Link
                      to={result.to}
                      className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-muted"
                    >
                      {result.avatar ? (
                        <Avatar name={result.avatar.name} src={result.avatar.src} />
                      ) : (
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-brand">
                          <TrendingUp className="size-5" aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 text-body font-bold">
                          <span className="truncate">{result.title}</span>
                          {result.verified ? <VerifiedBadge /> : null}
                        </span>
                        <span className="block truncate text-caption text-muted-foreground">
                          {result.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
