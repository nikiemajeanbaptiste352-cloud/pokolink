import type { ReactNode } from 'react'

import { ScrollRow } from '@/components/common/ScrollRow'
import { SectionHeader } from '@/components/common/SectionHeader'

interface ShelfProps {
  title: string
  description?: string
  /** Destination du lien « Voir tout ». */
  to?: string
  children: ReactNode
}

/** Section d'accueil de type « étagère » : titre + lien + rangée défilante. */
export function Shelf({ title, description, to, children }: ShelfProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} description={description} to={to} />
      <ScrollRow label={title}>{children}</ScrollRow>
    </section>
  )
}
