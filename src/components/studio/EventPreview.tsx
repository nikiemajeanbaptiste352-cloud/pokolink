import { Avatar } from '@/components/common/Avatar'
import { VerifiedBadge } from '@/components/common/VerifiedBadge'
import { EventPoster } from '@/components/studio/EventPoster'
import { formatNumber, formatPrice } from '@/lib/format'
import { formatDateTime } from '@/lib/pro-labels'
import { useProfile } from '@/hooks/use-profile'
import {
  formatDuration,
  formatHashtags,
  getMarketTitle,
  STUDIO_KINDS,
} from '@/lib/studio'
import type { StudioEventKind } from '@/types/studio'

export interface EventPreviewData {
  kind: StudioEventKind
  caption: string
  hashtags: readonly string[]
  cover: string
  /** Début en millisecondes ; `null` tant qu'il n'est pas choisi. */
  startsAt: number | null
  durationHours: number
  maxCoins?: number | undefined
  coinPrice?: number | undefined
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="text-body text-muted-foreground">{label}</dt>
      <dd className="text-right text-body font-semibold">{value}</dd>
    </div>
  )
}

/**
 * Aperçu de ce que verront les participants : visuel, créateur, légende et conditions.
 * Purement informatif : les règles et les valeurs de calcul viennent d'AfriConnect.
 */
export function EventPreview({ data }: { data: EventPreviewData }) {
  const { kind, caption, hashtags, cover, startsAt, durationHours } = data
  const profile = useProfile()
  const title = getMarketTitle({ kind, caption, durationHours })

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <EventPoster
        kind={kind}
        cover={cover}
        seed={caption}
        className="aspect-video w-full"
      />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Avatar name={profile.name} size="sm" />
          <p className="min-w-0 truncate text-body font-bold">
            @{profile.handle}
            {profile.verified ? (
              <VerifiedBadge tone="gold" className="ml-1 align-middle" />
            ) : null}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-caption font-bold text-brand">{STUDIO_KINDS[kind].label}</p>
          <h3 className="text-title font-extrabold">{title}</h3>
          {kind === 'factor' && caption.trim() ? (
            <p className="text-body">{caption.trim()}</p>
          ) : null}
          {hashtags.length > 0 ? (
            <p className="text-body text-brand">{formatHashtags(hashtags)}</p>
          ) : null}
        </div>

        <dl className="divide-y border-y">
          <Fact
            label="Début"
            value={startsAt === null ? 'À choisir' : formatDateTime(startsAt)}
          />
          <Fact label="Durée" value={formatDuration(durationHours)} />
          {kind === 'coins' ? (
            <>
              <Fact
                label="Nombre de coins"
                value={data.maxCoins ? formatNumber(data.maxCoins) : 'À indiquer'}
              />
              <Fact
                label="Prix initial d’un coin"
                value={data.coinPrice ? formatPrice(data.coinPrice) : 'À indiquer'}
              />
            </>
          ) : (
            <Fact label="Facteur de départ" value="1,000 (neutre)" />
          )}
        </dl>
      </div>
    </article>
  )
}
