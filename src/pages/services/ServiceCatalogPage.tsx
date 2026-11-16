import { LayoutGrid, List, PackagePlus, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import { ProductCard } from '@/components/services/catalog/ProductCard'
import { RubriquePage } from '@/components/services/RubriquePage'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCurrentService } from '@/hooks/use-current-service'
import { useServiceItems } from '@/hooks/use-services'
import {
  CATALOG_SORTS,
  getCategories,
  selectItems,
  type CatalogSort,
} from '@/lib/catalog'
import { getServiceTypeMeta } from '@/lib/service-types'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

const ALL = 'all'

type Layout = 'grid' | 'list'

const LAYOUTS: readonly { id: Layout; label: string; icon: typeof List }[] = [
  { id: 'grid', label: 'Affichage en grille', icon: LayoutGrid },
  { id: 'list', label: 'Affichage en liste', icon: List },
]

/**
 * Catalogue d'un service, façon marketplace : recherche, catégories, tri,
 * grille de cartes produit. Chaque carte ouvre la fiche produit.
 */
export function ServiceCatalogPage() {
  const service = useCurrentService()
  const items = useServiceItems(service.id)
  const meta = getServiceTypeMeta(service.type)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>(ALL)
  const [sort, setSort] = useState<CatalogSort>('default')
  const [layout, setLayout] = useState<Layout>('grid')
  const categories = getCategories(items)
  // Si la catégorie filtrée n'existe plus (élément modifié), on revient à « Tout ».
  const activeCategory = categories.includes(category) ? category : ALL
  const visible = selectItems(items, {
    query,
    category: activeCategory === ALL ? null : activeCategory,
    sort,
  })
  const filtering = query.trim() !== '' || activeCategory !== ALL

  const addLink = (
    <Link to={paths.serviceItemNew(service.id)} className={buttonVariants()}>
      <Plus aria-hidden="true" />
      Ajouter
      <span className="sr-only"> un élément au catalogue</span>
    </Link>
  )

  return (
    <RubriquePage
      toolId="catalog"
      title={meta.catalogLabel}
      subtitle={
        items.length === 0
          ? 'Aucun élément pour le moment'
          : `${items.length} élément${items.length > 1 ? 's' : ''} · ${service.name}`
      }
      action={items.length > 0 ? addLink : undefined}
    >
      {items.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          tone={meta.tone}
          title="Votre catalogue est vide"
          description={`Ajoutez ce que propose « ${service.name} » : nom, image, prix, catégorie et disponibilité.`}
          action={
            <Link to={paths.serviceItemNew(service.id)} className={buttonVariants()}>
              <Plus aria-hidden="true" />
              Ajouter le premier élément
            </Link>
          }
        />
      ) : (
        <>
          <div className="px-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Rechercher dans ${meta.catalogLabel.toLowerCase()}`}
                aria-label="Rechercher dans le catalogue"
                className="rounded-xl border-border/70 bg-card/90 pl-11 shadow-sm"
              />
            </div>
          </div>

          {categories.length > 1 ? (
            <FilterChips
              label="Catégories"
              value={activeCategory}
              onChange={setCategory}
              items={[
                { id: ALL, label: 'Tout' },
                ...categories.map((c) => ({ id: c, label: c })),
              ]}
            />
          ) : null}

          <p role="status" className="px-4 text-body text-muted-foreground">
            {`${visible.length} résultat${visible.length > 1 ? 's' : ''}`}
          </p>

          <div className="flex items-center gap-3 px-4">
            <div className="min-w-0 flex-1">
              <Select
                value={sort}
                onChange={(event) => setSort(event.target.value as CatalogSort)}
                aria-label="Trier les éléments"
              >
                {CATALOG_SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div
              role="group"
              aria-label="Mode d’affichage"
              className="flex shrink-0 rounded-xl border border-border/60 bg-card/90 p-0.5 shadow-sm"
            >
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={layout === l.id}
                  aria-label={l.label}
                  onClick={() => setLayout(l.id)}
                  className={cn(
                    'grid size-11 place-items-center rounded-[0.65rem] transition-colors',
                    layout === l.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-secondary-foreground hover:bg-muted',
                  )}
                >
                  <l.icon className="size-5" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={
                filtering
                  ? 'Essayez un autre mot ou choisissez « Tout » dans les catégories.'
                  : 'Aucun élément à afficher.'
              }
              action={
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline' })}
                  onClick={() => {
                    setQuery('')
                    setCategory(ALL)
                  }}
                >
                  Effacer la recherche
                </button>
              }
            />
          ) : (
            <ul
              className={cn(
                'px-4 pb-2',
                layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3',
              )}
            >
              {visible.map((item) => (
                <li key={item.id} className="flex min-w-0 flex-col">
                  <ProductCard
                    item={item}
                    icon={meta.icon}
                    tone={meta.tone}
                    layout={layout}
                    className="flex-1"
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </RubriquePage>
  )
}
