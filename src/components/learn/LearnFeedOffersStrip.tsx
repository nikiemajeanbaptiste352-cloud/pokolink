import { Link } from 'react-router-dom'

import {
  LearnCanalFeedCard,
  LearnProductFeedCard,
} from '@/components/learn/LearnFeedOfferCard'
import {
  usePublishedEduProducts,
  usePublishedLearnCanals,
} from '@/hooks/use-afrilearn-commerce'
import { paths } from '@/routes/paths'

/**
 * Bandeau de cartes Canal Pro + produits éducatifs dans les fils AfriLearn.
 * Relie le fil public au marché et aux profils vendeurs.
 */
export function LearnFeedOffersStrip({ query = '' }: { query?: string }) {
  const canals = usePublishedLearnCanals()
  const products = usePublishedEduProducts()
  const q = query.trim().toLowerCase()

  const visibleCanals = q
    ? canals.filter((c) =>
        `${c.name} ${c.tagline} ${c.description} ${c.ownerHandle}`
          .toLowerCase()
          .includes(q),
      )
    : canals
  const visibleProducts = q
    ? products.filter((p) =>
        `${p.name} ${p.description} ${p.sellerHandle}`.toLowerCase().includes(q),
      )
    : products

  if (visibleCanals.length === 0 && visibleProducts.length === 0) return null

  return (
    <section aria-label="Offres éducatives" className="space-y-2 border-b pb-3">
      <div className="flex items-center justify-between gap-2 px-4">
        <h2 className="text-[12px] font-extrabold tracking-wide text-muted-foreground uppercase">
          Canaux & produits
        </h2>
        <Link to={paths.learnMarket} className="text-[12px] font-bold text-brand">
          Marché ›
        </Link>
      </div>
      <ul className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
        {visibleCanals.map((canal) => (
          <li key={`canal-${canal.id}`}>
            <LearnCanalFeedCard canal={canal} />
          </li>
        ))}
        {visibleProducts.map((product) => (
          <li key={`product-${product.id}`}>
            <LearnProductFeedCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
