import { Mic, Plus } from 'lucide-react'
import { useState } from 'react'

import { Avatar } from '@/components/common/Avatar'
import { FilterChips, type ChipItem } from '@/components/common/FilterChips'
import { SearchField } from '@/components/common/SearchField'
import { SectionHeader } from '@/components/common/SectionHeader'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { paths } from '@/routes/paths'

/** DONNÉES TEMPORAIRES : uniquement pour vérifier le rendu. */
const chips = [
  { id: 'discussions', label: 'Discussions' },
  { id: 'canaux', label: 'Canaux' },
  { id: 'business', label: 'Business' },
] as const satisfies readonly ChipItem<string>[]

type ChipId = (typeof chips)[number]['id']

/** Aperçu des composants communs (page de développement). */
export function ComponentsShowcase() {
  const [chip, setChip] = useState<ChipId>('discussions')

  return (
    <>
      <section className="space-y-3">
        <h2 className="text-title font-bold">Avatars</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="Amadou Ba" size="sm" />
          <Avatar name="Fatou Sow" size="md" ring="story" />
          <Avatar name="Kofi Mensah" size="lg" ring="seen" />
          <Avatar name="Awa Traoré" size="xl" online />
          <Avatar
            name="Moi"
            size="xl"
            ring="seen"
            corner={
              <span className="grid size-5 place-items-center rounded-full bg-brand text-brand-foreground ring-2 ring-background">
                <Plus className="size-3.5" aria-hidden="true" />
              </span>
            }
          />
        </div>
        <p className="flex items-center gap-1 text-body font-bold">
          Fatou Sow <VerifiedBadge />
          <span className="ml-2 text-sm font-medium text-muted-foreground">créateur</span>
          <VerifiedBadge tone="gold" />
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="px-0 text-title font-bold">Recherche et filtres</h2>
        <SearchField label="Rechercher" placeholder="Rechercher dans AfriConnect" />
        <SearchField
          label="Rechercher un produit"
          placeholder="Produit, service, boutique…"
          trailing={<Mic className="size-5" aria-hidden="true" />}
        />
        <div className="-mx-4">
          <FilterChips
            label="Filtrer les messages"
            items={chips}
            value={chip}
            onChange={setChip}
          />
        </div>
      </section>

      <section className="-mx-4 space-y-3">
        <SectionHeader title="Produits populaires" to={paths.explore} />
        <SectionHeader
          title="Services populaires"
          description="Entreprises et services utilisés au quotidien"
          to={paths.explore}
        />
      </section>
    </>
  )
}
