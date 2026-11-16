import { zodResolver } from '@hookform/resolvers/zod'
import { MessageSquareReply, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { BottomSheet } from '@/components/common/BottomSheet'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { formatRating } from '@/lib/format'
import { formatDate } from '@/lib/pro-labels'
import { replySchema, type ReplyValues } from '@/lib/pro-schemas'
import type { Review } from '@/types/pro'

/** Rangée d'étoiles : valeur annoncée en texte pour les lecteurs d'écran. */
export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= value ? 'size-4 fill-gold text-gold' : 'size-4 text-muted-foreground/50'
          }
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{value} sur 5</span>
    </span>
  )
}

/** Note moyenne, nombre d'avis et répartition par étoiles. */
export function RatingSummary({ reviews }: { reviews: readonly Review[] }) {
  const total = reviews.length
  const average = total === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / total
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  return (
    <section
      aria-label="Résumé des avis"
      className="mx-4 flex gap-4 rounded-2xl border bg-card p-4 shadow-card"
    >
      <div className="flex shrink-0 flex-col items-center justify-center gap-1">
        <p className="text-4xl leading-none font-extrabold">
          {total === 0 ? '—' : formatRating(average)}
        </p>
        <Stars value={Math.round(average)} />
        <p className="text-caption text-muted-foreground">{total} avis</p>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5" aria-label="Répartition des étoiles">
        {counts.map(({ stars, count }) => (
          <li key={stars} className="flex items-center gap-2 text-caption">
            <span className="w-8 shrink-0">{stars} ★</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-gold"
                style={{ width: total === 0 ? '0%' : `${(count / total) * 100}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-muted-foreground">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Un avis client, avec sa réponse éventuelle et le bouton Répondre. */
export function ReviewCard({
  review,
  onReply,
}: {
  review: Review
  onReply: (review: Review) => void
}) {
  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-body font-bold">{review.customerName}</h3>
          <Stars value={review.rating} />
        </div>
        <p className="shrink-0 text-caption text-muted-foreground">
          {formatDate(review.createdAt)}
        </p>
      </div>
      <p className="text-body">{review.comment}</p>
      {review.reply ? (
        <div className="space-y-1 rounded-xl bg-muted p-3.5">
          <p className="text-caption font-bold">
            Votre réponse · {formatDate(review.reply.createdAt)}
          </p>
          <p className="text-body">{review.reply.comment}</p>
        </div>
      ) : null}
      <Button variant="outline" onClick={() => onReply(review)}>
        <MessageSquareReply aria-hidden="true" />
        {review.reply ? 'Modifier la réponse' : 'Répondre'}
        <span className="sr-only"> à {review.customerName}</span>
      </Button>
    </article>
  )
}

/** Feuille de réponse à un avis : commentaire, Publier la réponse, Annuler. */
export function ReplySheet({
  review,
  onClose,
  onSubmit,
}: {
  review: Review | null
  onClose: () => void
  onSubmit: (review: Review, comment: string) => void
}) {
  return (
    <BottomSheet
      open={review !== null}
      onClose={onClose}
      title="Répondre à l’avis"
      subtitle={review ? `${review.customerName} · ${review.rating} sur 5` : undefined}
    >
      {review ? (
        <ReplyForm review={review} onSubmit={onSubmit} onCancel={onClose} />
      ) : null}
    </BottomSheet>
  )
}

function ReplyForm({
  review,
  onSubmit,
  onCancel,
}: {
  review: Review
  onSubmit: (review: Review, comment: string) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { comment: review.reply?.comment ?? '' },
  })

  return (
    <form
      onSubmit={(event) =>
        void handleSubmit((values) => onSubmit(review, values.comment))(event)
      }
      noValidate
      className="space-y-4"
    >
      <p className="rounded-xl bg-muted p-3.5 text-body">« {review.comment} »</p>
      <Field id="reply-comment" label="Votre réponse" error={errors.comment?.message}>
        {(a11y) => <Textarea {...a11y} {...register('comment')} maxLength={500} />}
      </Field>
      <div className="grid gap-3">
        <Button type="submit" size="lg">
          Publier la réponse
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
