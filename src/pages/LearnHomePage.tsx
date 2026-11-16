import { BookOpen, ChevronRight, GraduationCap, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchField } from '@/components/common/SearchField'
import { SectionDivider } from '@/components/common/SectionDivider'
import { SectionHeader } from '@/components/common/SectionHeader'
import { LevelTile } from '@/components/learn/LevelTile'
import { useProfile } from '@/hooks/use-profile'
import { canManageCanal } from '@/lib/afrilearn-commerce-store'
import { formatCount } from '@/lib/format'
import {
  getTempLevel,
  TEMP_JOINED_LEVEL_IDS,
  TEMP_LEARN_LEVELS,
} from '@/lib/placeholder-learn'
import { paths } from '@/routes/paths'
import type { LearnCategory } from '@/types/learn'

const CATEGORIES: readonly LearnCategory[] = [
  'Primaire',
  'Collège',
  'Lycée',
  'Université',
]

/** Accueil d'AfriLearn : choisir sa classe ou son niveau, puis arriver dans le fil correspondant. */
export function LearnHomePage() {
  const profile = useProfile()
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const levels = normalized
    ? TEMP_LEARN_LEVELS.filter((level) =>
        `${level.name} ${level.category}`.toLowerCase().includes(normalized),
      )
    : TEMP_LEARN_LEVELS
  const mineLabel = canManageCanal(profile.handle)
    ? 'Mon AfriLearn (Canal Pro, produits)'
    : 'Mon AfriLearn (créer Canal Pro, produits)'
  const joined = TEMP_JOINED_LEVEL_IDS.flatMap((id) => {
    const level = getTempLevel(id)
    return level ? [level] : []
  })

  return (
    <>
      <PageHeader
        title="AfriLearn"
        leading={<BackLink to={paths.explore} label="Explorer" />}
      />

      <section className="space-y-3 px-4 pb-4">
        <div className="space-y-1">
          <h2 className="text-title font-extrabold">Quelle est votre classe ?</h2>
          <p className="text-body text-muted-foreground">
            Choisissez votre niveau : vous arrivez directement dans le fil de votre
            classe, pour discuter, poser vos questions et trouver des documents.
          </p>
        </div>
        <SearchField
          label="Rechercher une classe ou un niveau"
          placeholder="Terminale, 3e, Licence…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </section>

      {!normalized ? (
        <>
          <section className="space-y-3 pb-4">
            <SectionHeader title="Espace éducatif" />
            <ul className="space-y-3 px-4">
              {joined.map((level) => (
                <li key={level.id}>
                  <Link
                    to={paths.learnFeed(level.id)}
                    className="flex min-h-16 items-center gap-3 rounded-xl border bg-card p-3.5 shadow-card hover:bg-muted"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <GraduationCap className="size-6" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-bold">{level.name}</span>
                      <span className="block text-caption text-muted-foreground">
                        {level.category} · {formatCount(level.membersCount)} membres
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={paths.learnMine}
                  className="flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3.5 hover:bg-muted"
                >
                  <UserRound className="size-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-body font-semibold">
                    {mineLabel}
                  </span>
                  <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  to={paths.learnMarket}
                  className="flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3.5 hover:bg-muted"
                >
                  <BookOpen className="size-5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-body font-semibold">
                    Marché éducatif
                  </span>
                  <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </section>
          <SectionDivider />
        </>
      ) : null}

      {levels.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          tone="info"
          title="Aucun niveau trouvé"
          description="Vérifiez l’orthographe ou essayez un autre mot."
        />
      ) : (
        CATEGORIES.map((category) => {
          const items = levels.filter((level) => level.category === category)
          if (items.length === 0) return null
          return (
            <section key={category} className="space-y-3 py-4">
              <SectionHeader title={category} />
              <ul className="grid grid-cols-2 gap-3 px-4">
                {items.map((level) => (
                  <li key={level.id} className="flex flex-col">
                    <LevelTile level={level} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}

      <p className="px-4 pb-6 text-caption text-muted-foreground">
        Un niveau sans membres n’a pas encore de fil : il est créé automatiquement quand
        le premier élève le rejoint.
      </p>
    </>
  )
}
