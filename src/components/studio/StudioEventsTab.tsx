import { Clapperboard, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { SearchField } from '@/components/common/SearchField'
import { StudioEventCard } from '@/components/studio/StudioEventCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { normalize } from '@/lib/catalog'
import {
  getEventTitle,
  matchesFilter,
  STUDIO_FILTERS,
  STUDIO_KINDS,
  STUDIO_STATUS,
  type StudioFilter,
} from '@/lib/studio'
import { paths } from '@/routes/paths'
import type { StudioEvent } from '@/types/studio'

/** Historique de tous les événements du créateur, avec filtre par état et recherche. */
export function StudioEventsTab({ events }: { events: readonly StudioEvent[] }) {
  const [filter, setFilter] = useState<StudioFilter>('all')
  const [query, setQuery] = useState('')

  // Le nombre d'événements de chaque état est affiché dans la puce pour s'y repérer.
  const items = STUDIO_FILTERS.map((item) => ({
    id: item.id,
    label: `${item.label} (${events.filter((event) => matchesFilter(event, item.id)).length})`,
  }))

  const needle = normalize(query)
  const shown = events.filter((event) => {
    if (!matchesFilter(event, filter)) return false
    if (!needle) return true
    return normalize(
      [
        getEventTitle(event),
        event.caption,
        event.hashtags.join(' '),
        STUDIO_KINDS[event.kind].label,
        STUDIO_STATUS[event.status].label,
      ].join(' '),
    ).includes(needle)
  })

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Clapperboard}
        tone="violet"
        title="Aucun événement"
        description="Votre historique apparaîtra ici dès votre premier événement."
        action={
          <Link to={paths.studioEventNew} className={buttonVariants({ size: 'lg' })}>
            <Plus aria-hidden="true" />
            Créer un événement
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="px-4">
        <SearchField
          label="Rechercher dans mes événements"
          placeholder="Légende, mot-clé, état…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <FilterChips
        label="Filtrer par état"
        items={items}
        value={filter}
        onChange={setFilter}
      />

      {shown.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Aucun résultat"
          description="Aucun événement ne correspond à ce filtre ou à cette recherche."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setFilter('all')
                setQuery('')
              }}
            >
              Tout afficher
            </Button>
          }
          className="py-8"
        />
      ) : (
        <ul className="space-y-3 px-4" aria-label="Mes événements">
          {shown.map((event) => (
            <li key={event.id}>
              <StudioEventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
