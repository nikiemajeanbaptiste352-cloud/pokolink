import { Star } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { FilterChips } from '@/components/common/FilterChips'
import {
  RatingSummary,
  ReplySheet,
  ReviewCard,
} from '@/components/pro/reviews/ReviewParts'
import { FlashMessage } from '@/components/pro/shared'
import { RubriquePage } from '@/components/services/RubriquePage'
import { useCurrentService } from '@/hooks/use-current-service'
import { useFlash } from '@/hooks/use-flash'
import { useProExtras } from '@/hooks/use-pro-extras'
import type { Review } from '@/types/pro'

type Filter = 'all' | 'unanswered'

const FILTERS: readonly { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous les avis' },
  { id: 'unanswered', label: 'Sans réponse' },
]

/** Avis clients : note moyenne, répartition, liste et réponses du propriétaire. */
export function ServiceReviewsPage() {
  const service = useCurrentService()
  const { data, update } = useProExtras(service)
  const { message, flash } = useFlash()
  const [filter, setFilter] = useState<Filter>('all')
  const [replying, setReplying] = useState<Review | null>(null)

  const sorted = [...data.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const unanswered = sorted.filter((review) => !review.reply).length
  const visible = filter === 'all' ? sorted : sorted.filter((review) => !review.reply)

  function submitReply(review: Review, comment: string) {
    update((current) => ({
      ...current,
      reviews: current.reviews.map((candidate) =>
        candidate.id === review.id
          ? { ...candidate, reply: { comment, createdAt: new Date().toISOString() } }
          : candidate,
      ),
    }))
    setReplying(null)
    flash('Réponse publiée (démonstration).')
  }

  return (
    <RubriquePage
      toolId="reviews"
      title="Avis clients"
      subtitle={`Ce que disent vos clients · ${service.name}`}
    >
      <FlashMessage message={message} />

      <RatingSummary reviews={data.reviews} />

      <FilterChips
        label="Filtrer les avis"
        items={FILTERS.map((item) =>
          item.id === 'unanswered'
            ? { ...item, label: `Sans réponse (${unanswered})` }
            : item,
        )}
        value={filter}
        onChange={setFilter}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon={Star}
          tone="gold"
          title={filter === 'all' ? 'Pas encore d’avis' : 'Tous les avis ont une réponse'}
          description={
            filter === 'all'
              ? 'Les avis de vos clients apparaîtront ici.'
              : 'Bravo : vous avez répondu à chaque avis.'
          }
          className="py-8"
        />
      ) : (
        <ul className="space-y-3 px-4">
          {visible.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} onReply={setReplying} />
            </li>
          ))}
        </ul>
      )}

      <ReplySheet
        review={replying}
        onClose={() => setReplying(null)}
        onSubmit={submitReply}
      />
    </RubriquePage>
  )
}
